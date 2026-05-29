import { useLiveQuery } from 'dexie-react-hooks'
import db from '../db/dexie'

/**
 * Custom hook to reactively track conflicts inside a household.
 * 
 * @param {string} householdId - Current active household ID.
 * @returns {Object} Reactively updated conflicts array and its length count.
 */
export function useConflictDetection(householdId) {
  const conflicts = useLiveQuery(async () => {
    if (!householdId) return []

    // Retrieve events efficiently using the indexed conflictStatus property
    const pendingEvents = await db.events
      .where('conflictStatus')
      .equals('pending')
      .toArray()

    // Filter results matching current household and not soft-deleted
    return pendingEvents.filter(
      (event) => event.householdId === householdId && !event.deletedAt
    )
  }, [householdId])

  return {
    conflicts: conflicts || [],
    conflictCount: conflicts ? conflicts.length : 0
  }
}

export default useConflictDetection;
