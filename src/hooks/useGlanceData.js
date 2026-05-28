import { useLiveQuery } from 'dexie-react-hooks'
import db from '../db/dexie'
import Dexie from 'dexie'

export function useGlanceData(householdId) {
  const result = useLiveQuery(async () => {
    if (!householdId) return null

    // Query feeds (ordered by time descending)
    const feeds = await db.events
      .where('[householdId+eventType+eventTime]')
      .between([householdId, 'feed', Dexie.minKey], [householdId, 'feed', Dexie.maxKey])
      .reverse()
      .toArray()
    const lastFeed = feeds.find(e => !e.deletedAt) || null

    // Query nappies
    const nappies = await db.events
      .where('[householdId+eventType+eventTime]')
      .between([householdId, 'nappy', Dexie.minKey], [householdId, 'nappy', Dexie.maxKey])
      .reverse()
      .toArray()
    const lastNappy = nappies.find(e => !e.deletedAt) || null

    // Query sleep
    const sleeps = await db.events
      .where('[householdId+eventType+eventTime]')
      .between([householdId, 'sleep', Dexie.minKey], [householdId, 'sleep', Dexie.maxKey])
      .reverse()
      .toArray()
    const activeSleeps = sleeps.filter(e => !e.deletedAt)

    // Last completed sleep (subtype: end)
    const lastSleep = activeSleeps.find(e => e.eventSubtype === 'end') || null

    // Active sleep (subtype: start, with no subsequent end)
    const startEvents = activeSleeps.filter(e => e.eventSubtype === 'start')
    let activeSleep = null
    if (startEvents.length > 0) {
      const activeStart = startEvents[0]
      const hasSubsequentEnd = activeSleeps.some(
        e => e.eventSubtype === 'end' && new Date(e.eventTime) > new Date(activeStart.eventTime)
      )
      if (!hasSubsequentEnd) {
        activeSleep = activeStart
      }
    }

    return { lastFeed, lastNappy, lastSleep, activeSleep }
  }, [householdId])

  if (!householdId) {
    return { lastFeed: null, lastNappy: null, lastSleep: null, activeSleep: null, isLoading: false }
  }

  const isLoading = result === undefined

  return {
    lastFeed: result?.lastFeed || null,
    lastNappy: result?.lastNappy || null,
    lastSleep: result?.lastSleep || null,
    activeSleep: result?.activeSleep || null,
    isLoading
  }
}
