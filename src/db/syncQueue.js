import { supabase } from '../services/supabase'
import db from './dexie'

// ==========================================
// 1. UPLOAD QUEUE PROCESSING
// ==========================================

export async function processUploadQueue(_householdId) {
  // Read all entries from syncQueue ordered by createdAt ascending
  const queue = await db.syncQueue.orderBy('createdAt').toArray()
  let successCount = 0

  for (const entry of queue) {
    try {
      const event = await db.events.get(entry.clientId)

      // If the event doesn't exist in Dexie (was deleted), remove from queue and skip
      if (!event) {
        await db.syncQueue.delete(entry.id)
        continue
      }

      // Transform event from Dexie camelCase format to Supabase snake_case format
      const transformedEvent = {
        client_id: event.clientId,
        household_id: event.householdId,
        baby_id: event.babyId,
        logged_by: event.loggedBy,
        logged_by_name: event.loggedByName,
        device_id: event.deviceId,
        event_type: event.eventType,
        event_subtype: event.eventSubtype,
        metadata: event.metadata,
        parent_id: event.parentId,
        conflict_status: event.conflictStatus,
        event_time: event.eventTime,
        created_at: event.createdAt,
        updated_at: event.updatedAt,
        deleted_at: event.deletedAt
      }

      // Upsert to Supabase
      const { error } = await supabase
        .from('events')
        .upsert(transformedEvent, { onConflict: 'client_id' })

      if (error) {
        console.error(`Failed to upload queued event ${entry.clientId}:`, error)
        continue // Continue to next entry, leave this one in queue to retry later
      }

      // On success: remove the entry from syncQueue, update syncStatus to 'synced' in Dexie
      await db.syncQueue.delete(entry.id)
      await db.events.update(event.clientId, { syncStatus: 'synced' })
      successCount++
    } catch (err) {
      console.error(`Error processing sync queue entry ${entry.id}:`, err)
    }
  }

  return successCount
}

// ==========================================
// 2. DOWNLOAD COHORT RECENT EVENTS
// ==========================================

export async function downloadNewEvents(householdId) {
  // Read lastSyncTimestamp from metadata
  const record = await db.metadata.get('lastSyncTimestamp')
  const lastSyncTimestamp = record ? record.value : '2000-01-01T00:00:00Z'

  // Fetch new/updated events from Supabase
  const { data: remoteEvents, error } = await supabase
    .from('events')
    .select('*')
    .eq('household_id', householdId)
    .gt('updated_at', lastSyncTimestamp)
    .order('updated_at', { ascending: true })

  if (error) throw error

  const processedEvents = []

  if (remoteEvents && remoteEvents.length > 0) {
    for (const row of remoteEvents) {
      // Transform from Supabase snake_case back to Dexie camelCase
      const dexieEvent = {
        clientId: row.client_id,
        householdId: row.household_id,
        babyId: row.baby_id,
        loggedBy: row.logged_by,
        loggedByName: row.logged_by_name,
        deviceId: row.device_id,
        eventType: row.event_type,
        eventSubtype: row.event_subtype,
        metadata: row.metadata,
        parentId: row.parent_id,
        conflictStatus: row.conflict_status,
        eventTime: row.event_time,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        deletedAt: row.deleted_at,
        syncStatus: 'synced' // Mark as synced
      }

      // Check if clientId already exists and overwrite / insert
      await db.events.put(dexieEvent)
      processedEvents.push(dexieEvent)
    }

    // Update lastSyncTimestamp in metadata to the latest updated_at value from downloaded events
    const latestUpdatedAt = remoteEvents[remoteEvents.length - 1].updated_at
    await db.metadata.put({ key: 'lastSyncTimestamp', value: latestUpdatedAt })
  }

  // After normal delta download, verify we have all events
  const { count: serverCount } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('household_id', householdId)

  const localCount = await db.events
    .where('householdId')
    .equals(householdId)
    .count()

  if (serverCount && localCount < serverCount) {
    console.warn(`[Sync] Local has ${localCount} events but server has ${serverCount}. Triggering full rehydration.`)
    await rehydrateFromServer(householdId)
  }

  return processedEvents
}

// ==========================================
// 3. GET SYNC QUEUE LENGTH
// ==========================================

export async function getQueueLength() {
  return await db.syncQueue.count()
}

// ==========================================
// 4. SUPABASE REHYDRATION SAFEGUARD
// ==========================================

export async function rehydrateFromServer(householdId) {
  if (!householdId) return 0

  // 1. Fetch all events for this household from Supabase ordered by updated_at ascending
  const { data: remoteEvents, error: eventsError } = await supabase
    .from('events')
    .select('*')
    .eq('household_id', householdId)
    .order('updated_at', { ascending: true })

  if (eventsError) throw eventsError

  let transformedEvents = []
  if (remoteEvents && remoteEvents.length > 0) {
    transformedEvents = remoteEvents.map(row => ({
      clientId: row.client_id,
      householdId: row.household_id,
      babyId: row.baby_id,
      loggedBy: row.logged_by,
      loggedByName: row.logged_by_name,
      deviceId: row.device_id,
      eventType: row.event_type,
      eventSubtype: row.event_subtype,
      metadata: row.metadata,
      parentId: row.parent_id,
      conflictStatus: row.conflict_status,
      eventTime: row.event_time,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
      syncStatus: 'synced'
    }))

    // Bulk put events to Dexie
    await db.events.bulkPut(transformedEvents)

    // Update lastSyncTimestamp in metadata to the latest event's updated_at value
    const latestUpdatedAt = remoteEvents[remoteEvents.length - 1].updated_at
    await db.metadata.put({ key: 'lastSyncTimestamp', value: latestUpdatedAt })
  }

  // 2. Fetch and cache household details
  const { data: households } = await supabase
    .from('households')
    .select('*')
    .eq('id', householdId)

  if (households && households.length > 0) {
    const transformed = households.map(h => ({
      id: h.id,
      name: h.name,
      createdAt: h.created_at,
      updatedAt: h.updated_at
    }))
    await db.households.bulkPut(transformed)
  }

  // 3. Fetch and cache babies
  const { data: babies } = await supabase
    .from('babies')
    .select('*')
    .eq('household_id', householdId)

  if (babies && babies.length > 0) {
    const transformed = babies.map(b => ({
      id: b.id,
      householdId: b.household_id,
      name: b.name,
      dateOfBirth: b.date_of_birth,
      createdAt: b.created_at,
      updatedAt: b.updated_at
    }))
    await db.babies.bulkPut(transformed)
  }

  // 4. Fetch profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')

  if (profiles && profiles.length > 0) {
    const transformed = profiles.map(p => ({
      id: p.id,
      displayName: p.display_name,
      displayLabel: p.display_label,
      createdAt: p.created_at,
      updatedAt: p.updated_at
    }))
    await db.profiles.bulkPut(transformed)
  }

  return transformedEvents.length
}
