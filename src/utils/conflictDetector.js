import db from '../db/dexie'

const CONFLICT_WINDOW_MS = 10 * 60 * 1000 // 10 minutes in milliseconds

/**
 * Detects care logging conflicts within a 10-minute window for newly downloaded events.
 * 
 * @param {Array} newEvents - Array of downloaded events.
 * @param {string} householdId - Current active household ID.
 * @returns {Promise<Array>} Newly flagged conflict pairs.
 */
export async function detectConflicts(newEvents = [], householdId) {
  if (!householdId || newEvents.length === 0) return []

  const flaggedPairs = []

  for (const newEvent of newEvents) {
    // Skip resolution events
    if (newEvent.eventType === 'conflict_resolved') continue

    // Skip sleep/end events (responses to sleep starts, not duplicates)
    if (newEvent.eventType === 'sleep' && newEvent.eventSubtype === 'end') continue

    // Skip if conflictStatus already set
    if (newEvent.conflictStatus) continue

    const newEventTime = new Date(newEvent.eventTime)
    const startTime = new Date(newEventTime.getTime() - CONFLICT_WINDOW_MS).toISOString()
    const endTime = new Date(newEventTime.getTime() + CONFLICT_WINDOW_MS).toISOString()

    try {
      // Query Dexie using compound index: [householdId+eventType+eventTime]
      const matches = await db.events
        .where('[householdId+eventType+eventTime]')
        .between(
          [householdId, newEvent.eventType, startTime],
          [householdId, newEvent.eventType, endTime],
          true,
          true
        )
        .toArray()

      // Filter matches based on criteria
      const filteredMatches = matches.filter((existing) => {
        // Different deviceId (same device = same person, not a conflict)
        if (existing.deviceId === newEvent.deviceId) return false
        // Not already soft-deleted (deletedAt is null/undefined)
        if (existing.deletedAt) return false
        // Not the same event (different clientId)
        if (existing.clientId === newEvent.clientId) return false
        // Strictly within 10 minutes (lexical boundary verification check)
        const diff = Math.abs(new Date(existing.eventTime) - newEventTime)
        return diff < CONFLICT_WINDOW_MS
      })

      if (filteredMatches.length > 0) {
        // Flag both in memory & local storage
        newEvent.conflictStatus = 'pending'
        await db.events.update(newEvent.clientId, { conflictStatus: 'pending' })

        for (const existing of filteredMatches) {
          await db.events.update(existing.clientId, { conflictStatus: 'pending' })
          
          flaggedPairs.push({
            newEventClientId: newEvent.clientId,
            matchingClientId: existing.clientId,
            eventType: newEvent.eventType,
            eventTime: newEvent.eventTime
          })
        }
      }
    } catch (err) {
      console.error(`Error detecting conflicts for event ${newEvent.clientId}:`, err)
    }
  }

  return flaggedPairs
}

export default detectConflicts;
