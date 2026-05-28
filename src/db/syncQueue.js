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
  if (!remoteEvents || remoteEvents.length === 0) return []

  const processedEvents = []

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

  return processedEvents
}

// ==========================================
// 3. GET SYNC QUEUE LENGTH
// ==========================================

export async function getQueueLength() {
  return await db.syncQueue.count()
}
