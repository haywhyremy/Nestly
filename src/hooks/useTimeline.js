import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { startOfDay, endOfDay } from 'date-fns'
import db from '../db/dexie'
import Dexie from 'dexie'

export function useTimeline(householdId, options = {}) {
  const eventType = options.eventType
  const pageSize = options.pageSize || 20
  const selectedDate = options.selectedDate || new Date()

  const [limit, setLimit] = useState(pageSize)
  const [prevKey, setPrevKey] = useState(`${householdId}-${eventType}-${selectedDate.toDateString()}`)

  // Reset pagination limit inline during render when filters or date change
  const currentKey = `${householdId}-${eventType}-${selectedDate.toDateString()}`
  if (currentKey !== prevKey) {
    setPrevKey(currentKey)
    setLimit(pageSize)
  }

  // Query events from Dexie reactively
  const result = useLiveQuery(async () => {
    if (!householdId) return { entries: [], hasMore: false }

    const dayStart = startOfDay(selectedDate)
    const dayEnd = endOfDay(selectedDate)

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

    // Filter by date boundaries, deleted status
    const filteredEvents = events.filter(event => {
      const t = new Date(event.eventTime).getTime()
      return t >= dayStart.getTime() && t <= dayEnd.getTime() && !event.deletedAt
    })

    // Sort descending by eventTime
    filteredEvents.sort((a, b) => new Date(b.eventTime) - new Date(a.eventTime))

    const paginated = filteredEvents.slice(0, limit)
    const hasMore = filteredEvents.length > limit

    return { entries: paginated, hasMore }
  }, [householdId, eventType, selectedDate, limit])

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
