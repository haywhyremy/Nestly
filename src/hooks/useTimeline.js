import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import db from '../db/dexie'
import Dexie from 'dexie'

export function useTimeline(householdId, options = {}) {
  const eventType = options.eventType
  const pageSize = options.pageSize || 20

  const [limit, setLimit] = useState(pageSize)
  const [prevKey, setPrevKey] = useState(`${householdId}-${eventType}`)

  // Reset pagination limit inline during render when filters change
  const currentKey = `${householdId}-${eventType}`
  if (currentKey !== prevKey) {
    setPrevKey(currentKey)
    setLimit(pageSize)
  }

  // Query events from Dexie reactively
  const result = useLiveQuery(async () => {
    if (!householdId) return { entries: [], hasMore: false }

    const events = eventType
      ? await db.events
          .where('[householdId+eventType+eventTime]')
          .between([householdId, eventType, Dexie.minKey], [householdId, eventType, Dexie.maxKey])
          .reverse()
          .toArray()
      : await db.events
          .where('householdId')
          .equals(householdId)
          .toArray()

    // Filter out deleted events and sort descending by eventTime
    const activeEvents = events.filter(e => !e.deletedAt)
    if (!eventType) {
      activeEvents.sort((a, b) => new Date(b.eventTime) - new Date(a.eventTime))
    }

    const paginated = activeEvents.slice(0, limit)
    const hasMore = activeEvents.length > limit

    return { entries: paginated, hasMore }
  }, [householdId, eventType, limit])

  const isLoading = result === undefined
  const entries = result?.entries || []
  const hasMore = result?.hasMore || false

  const loadMore = () => {
    if (hasMore) {
      setLimit(prev => prev + pageSize)
    }
  }

  return {
    entries,
    loadMore,
    hasMore,
    isLoading
  }
}
