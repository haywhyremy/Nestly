import db from './dexie'
import { getDeviceId } from './deviceId'
import { supabase } from '../services/supabase'
import { startOfDay, endOfDay } from 'date-fns'
import Dexie from 'dexie'

// ==========================================
// EVENT FUNCTIONS (Offline-first / Queued)
// ==========================================

export async function createEvent({
  type,
  subtype,
  metadata,
  eventTime,
  householdId,
  babyId,
  loggedBy,
  loggedByName
}) {
  const clientId = crypto.randomUUID()
  const deviceId = await getDeviceId()
  const now = new Date().toISOString()

  const newEvent = {
    clientId,
    householdId,
    babyId,
    loggedBy,
    loggedByName,
    deviceId,
    eventType: type,
    eventSubtype: subtype || null,
    metadata: metadata || {},
    parentId: null,
    syncStatus: 'pending',
    conflictStatus: null,
    eventTime: eventTime || now,
    createdAt: now,
    updatedAt: now,
    deletedAt: null
  }

  // 1. Write to Dexie instantly
  await db.events.put(newEvent)

  // 2. Add to local sync queue
  await db.syncQueue.put({
    clientId,
    createdAt: now
  })

  return newEvent
}

export async function getLatestEvent(householdId, eventType) {
  // Query by compound index and sort by eventTime descending
  const events = await db.events
    .where('[householdId+eventType+eventTime]')
    .between([householdId, eventType, Dexie.minKey], [householdId, eventType, Dexie.maxKey])
    .reverse()
    .toArray()

  const activeEvents = events.filter(e => !e.deletedAt)
  return activeEvents.length > 0 ? activeEvents[0] : null
}

export async function getEventsByDate(householdId, date, filters = {}) {
  const start = startOfDay(date).toISOString()
  const end = endOfDay(date).toISOString()

  // Query events in time window
  const rawEvents = await db.events
    .where('eventTime')
    .between(start, end, true, true)
    .toArray()

  const filtered = rawEvents.filter(e => {
    if (e.householdId !== householdId) return false
    if (e.deletedAt) return false
    if (filters.eventType && e.eventType !== filters.eventType) return false
    return true
  })

  // Sort descending by eventTime
  filtered.sort((a, b) => new Date(b.eventTime) - new Date(a.eventTime))
  return filtered
}

export async function getActiveSession(householdId) {
  // Query all sleep events for this household
  const sleepEvents = await db.events
    .where('[householdId+eventType+eventTime]')
    .between([householdId, 'sleep', Dexie.minKey], [householdId, 'sleep', Dexie.maxKey])
    .reverse()
    .toArray()

  const activeSleeps = sleepEvents.filter(e => !e.deletedAt)
  
  // Find the most recent start event
  const startEvents = activeSleeps.filter(e => e.eventSubtype === 'start')
  if (startEvents.length === 0) return null

  const activeStart = startEvents[0]

  // Check if there is an end event logged after this start event
  const hasSubsequentEnd = activeSleeps.some(
    e => e.eventSubtype === 'end' && new Date(e.eventTime) > new Date(activeStart.eventTime)
  )

  return hasSubsequentEnd ? null : activeStart
}

export async function updateEvent(clientId, updates) {
  const original = await db.events.get(clientId)
  if (!original) throw new Error(`Event not found with clientId: ${clientId}`)

  const newClientId = crypto.randomUUID()
  const now = new Date().toISOString()

  const newEvent = {
    ...original,
    ...updates,
    clientId: newClientId,
    parentId: clientId,
    syncStatus: 'pending',
    createdAt: now,
    updatedAt: now
  }

  // Write new revision locally
  await db.events.put(newEvent)

  // Enqueue new revision for synchronization
  await db.syncQueue.put({
    clientId: newClientId,
    createdAt: now
  })

  return newEvent
}

export async function softDeleteEvent(clientId) {
  const original = await db.events.get(clientId)
  if (!original) throw new Error(`Event not found with clientId: ${clientId}`)

  const now = new Date().toISOString()
  const updatedEvent = {
    ...original,
    deletedAt: now,
    syncStatus: 'pending',
    updatedAt: now
  }

  // Update locally with deletedAt flag
  await db.events.put(updatedEvent)

  // Add deletion command to syncQueue
  await db.syncQueue.put({
    clientId,
    createdAt: now
  })

  return updatedEvent
}

// ==========================================
// HOUSEHOLD FUNCTIONS (Network Required)
// ==========================================

export async function createHousehold(babyName, babyDob, userId, displayName) {
  // 1. Create household record in Supabase
  const { data: household, error: hError } = await supabase
    .from('households')
    .insert({ name: `${displayName}'s Household` })
    .select()
    .single()

  if (hError) throw hError

  // 2. Create baby record in Supabase
  const { data: baby, error: bError } = await supabase
    .from('babies')
    .insert({
      household_id: household.id,
      name: babyName,
      date_of_birth: babyDob
    })
    .select()
    .single()

  if (bError) throw bError

  // 3. Create household member admin link in Supabase
  const { data: member, error: mError } = await supabase
    .from('household_members')
    .insert({
      household_id: household.id,
      user_id: userId,
      role: 'admin'
    })
    .select()
    .single()

  if (mError) throw mError

  // 4. Cache everything locally in Dexie
  await db.households.put({
    id: household.id,
    name: household.name,
    createdAt: household.created_at,
    updatedAt: household.updated_at
  })

  await db.babies.put({
    id: baby.id,
    householdId: baby.household_id,
    name: baby.name,
    dateOfBirth: baby.date_of_birth,
    createdAt: baby.created_at,
    updatedAt: baby.updated_at
  })

  // Cache creator profile
  const { data: profile } = await supabase
    .from('profiles')
    .select()
    .eq('id', userId)
    .single()

  if (profile) {
    await db.profiles.put({
      id: profile.id,
      displayName: profile.display_name,
      displayLabel: profile.display_label,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at
    })
  }

  return { household, baby, member }
}

export async function getMyHousehold(userId) {
  // Try Dexie cache first
  const cachedHouseholds = await db.households.toArray()
  if (cachedHouseholds.length > 0) {
    const cachedHousehold = cachedHouseholds[0]
    const cachedBabies = await db.babies.where('householdId').eq(cachedHousehold.id).toArray()
    const cachedProfiles = await db.profiles.toArray()

    const members = cachedProfiles.map(p => ({
      user_id: p.id,
      profiles: {
        id: p.id,
        display_name: p.displayName,
        display_label: p.displayLabel
      }
    }))

    return {
      household: cachedHousehold,
      baby: cachedBabies.length > 0 ? cachedBabies[0] : null,
      members
    }
  }

  // Fetch from Supabase on cache miss
  const { data: membership, error: mError } = await supabase
    .from('household_members')
    .select(`
      id,
      household_id,
      user_id,
      role,
      joined_at,
      profiles (
        id,
        display_name,
        display_label
      )
    `)
    .eq('user_id', userId)

  if (mError) throw mError
  if (!membership || membership.length === 0) return null

  const activeMember = membership[0]
  const householdId = activeMember.household_id

  // Get household details
  const { data: household, error: hError } = await supabase
    .from('households')
    .select()
    .eq('id', householdId)
    .single()

  if (hError) throw hError

  // Get baby profiles
  const { data: babies, error: bError } = await supabase
    .from('babies')
    .select()
    .eq('household_id', householdId)

  if (bError) throw bError
  const baby = babies.length > 0 ? babies[0] : null

  // Update local Dexie Cache
  await db.households.put({
    id: household.id,
    name: household.name,
    createdAt: household.created_at,
    updatedAt: household.updated_at
  })

  if (baby) {
    await db.babies.put({
      id: baby.id,
      householdId: baby.household_id,
      name: baby.name,
      dateOfBirth: baby.date_of_birth,
      createdAt: baby.created_at,
      updatedAt: baby.updated_at
    })
  }

  // Populate profiles cache
  for (const m of membership) {
    if (m.profiles) {
      await db.profiles.put({
        id: m.profiles.id,
        displayName: m.profiles.display_name,
        displayLabel: m.profiles.display_label,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }
  }

  return {
    household,
    baby,
    members: membership
  }
}

export async function joinHousehold(householdId, userId, _displayName) {
  // Join in Supabase
  const { data: member, error: mError } = await supabase
    .from('household_members')
    .insert({
      household_id: householdId,
      user_id: userId,
      role: 'member'
    })
    .select()
    .single()

  if (mError) throw mError

  // Fetch updated details to sync cache
  const { data: household } = await supabase
    .from('households')
    .select()
    .eq('id', householdId)
    .single()

  const { data: babies } = await supabase
    .from('babies')
    .select()
    .eq('household_id', householdId)

  if (household) {
    await db.households.put({
      id: household.id,
      name: household.name,
      createdAt: household.created_at,
      updatedAt: household.updated_at
    })
  }

  if (babies && babies.length > 0) {
    const baby = babies[0]
    await db.babies.put({
      id: baby.id,
      householdId: baby.household_id,
      name: baby.name,
      dateOfBirth: baby.date_of_birth,
      createdAt: baby.created_at,
      updatedAt: baby.updated_at
    })
  }

  return member
}

// ==========================================
// PROFILE FUNCTIONS (Dual Write)
// ==========================================

export async function getProfile(userId) {
  const cached = await db.profiles.get(userId)
  if (cached) return cached

  // Query database on cache miss
  const { data: profile } = await supabase
    .from('profiles')
    .select()
    .eq('id', userId)
    .single()

  if (profile) {
    const dexieProfile = {
      id: profile.id,
      displayName: profile.display_name,
      displayLabel: profile.display_label,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at
    }
    await db.profiles.put(dexieProfile)
    return dexieProfile
  }

  return null
}

export async function updateProfile(userId, updates) {
  const displayName = updates.displayName || updates.display_name
  const displayLabel = updates.displayLabel || updates.display_label

  // Write through to Supabase
  const { data: profile, error } = await supabase
    .from('profiles')
    .update({
      display_name: displayName,
      display_label: displayLabel
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error

  const dexieProfile = {
    id: profile.id,
    displayName: profile.display_name,
    displayLabel: profile.display_label,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at
  }

  // Update Dexie cache
  await db.profiles.put(dexieProfile)
  return dexieProfile
}

// ==========================================
// INVITE FUNCTIONS (Network Required)
// ==========================================

export async function createInvite(householdId, userId) {
  // Generate a random 8-character alphanumeric invitation code
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  // Set code expiration to 72 hours from now
  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()

  const { data: invite, error } = await supabase
    .from('invites')
    .insert({
      household_id: householdId,
      code,
      created_by: userId,
      expires_at: expiresAt
    })
    .select()
    .single()

  if (error) throw error
  return invite
}

export async function getInvite(code) {
  const { data: invite, error } = await supabase
    .from('invites')
    .select()
    .eq('code', code)
    .maybeSingle()

  if (error) throw error
  return invite
}

export async function acceptInvite(code, userId, _displayName) {
  // Get active invite
  const { data: invite, error: iError } = await supabase
    .from('invites')
    .select()
    .eq('code', code)
    .single()

  if (iError) throw iError
  if (!invite) throw new Error('Invitation code not found.')

  const now = new Date()
  if (new Date(invite.expires_at) < now) {
    throw new Error('This invitation code has expired.')
  }
  if (invite.used_by) {
    throw new Error('This invitation code has already been used.')
  }

  // 1. Create co-member connection row in Supabase
  const { data: member, error: mError } = await supabase
    .from('household_members')
    .insert({
      household_id: invite.household_id,
      user_id: userId,
      role: 'member'
    })
    .select()
    .single()

  if (mError) throw mError

  // 2. Mark the code as consumed
  const { error: uError } = await supabase
    .from('invites')
    .update({ used_by: userId })
    .eq('id', invite.id)

  if (uError) throw uError

  // 3. Fetch household details to bootstrap cache
  const { data: household } = await supabase
    .from('households')
    .select()
    .eq('id', invite.household_id)
    .single()

  const { data: babies } = await supabase
    .from('babies')
    .select()
    .eq('household_id', invite.household_id)

  // 4. Cache locally
  if (household) {
    await db.households.put({
      id: household.id,
      name: household.name,
      createdAt: household.created_at,
      updatedAt: household.updated_at
    })
  }

  let baby = null
  if (babies && babies.length > 0) {
    baby = babies[0]
    await db.babies.put({
      id: baby.id,
      householdId: baby.household_id,
      name: baby.name,
      dateOfBirth: baby.date_of_birth,
      createdAt: baby.created_at,
      updatedAt: baby.updated_at
    })
  }

  return { household, baby, member }
}
