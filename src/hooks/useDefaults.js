import { useLiveQuery } from 'dexie-react-hooks'
import db from '../db/dexie'
import Dexie from 'dexie'

export function useDefaults(householdId) {
  const defaults = useLiveQuery(async () => {
    if (!householdId) return null

    // Get last feeds
    const feeds = await db.events
      .where('[householdId+eventType+eventTime]')
      .between([householdId, 'feed', Dexie.minKey], [householdId, 'feed', Dexie.maxKey])
      .reverse()
      .toArray()
    const lastFeed = feeds.find(e => !e.deletedAt)

    // Last specific types of feeds
    const lastBottle = feeds.find(e => !e.deletedAt && e.eventSubtype === 'bottle')
    const lastBreast = feeds.find(e => !e.deletedAt && e.eventSubtype === 'breast')

    // Get last diaper change nappy event
    const nappies = await db.events
      .where('[householdId+eventType+eventTime]')
      .between([householdId, 'nappy', Dexie.minKey], [householdId, 'nappy', Dexie.maxKey])
      .reverse()
      .toArray()
    const lastNappy = nappies.find(e => !e.deletedAt)

    // 1. defaultFeedType: subtype of the most recent feed ('bottle' or 'breast'), fallback 'bottle'
    const defaultFeedType = lastFeed?.eventSubtype || 'bottle'

    // 2. defaultVolume: metadata.volume_ml of the most recent bottle feed, fallback 90
    const defaultVolume = lastBottle?.metadata?.volume_ml || 90

    // 3. defaultSide: opposite of the most recent breast feed's side (if last L return R and vice versa), fallback 'L'
    let defaultSide = 'L'
    if (lastBreast?.metadata?.side) {
      defaultSide = lastBreast.metadata.side === 'L' ? 'R' : 'L'
    }

    // 4. defaultDuration: metadata.duration_minutes of the most recent breast feed, fallback 15
    const defaultDuration = lastBreast?.metadata?.duration_minutes || 15

    // 5. defaultNappyType: subtype of the most recent nappy, fallback 'wet'
    const defaultNappyType = lastNappy?.eventSubtype || 'wet'

    return {
      defaultFeedType,
      defaultVolume,
      defaultSide,
      defaultDuration,
      defaultNappyType
    }
  }, [householdId])

  if (!householdId || defaults === undefined) {
    return {
      defaultFeedType: 'bottle',
      defaultVolume: 90,
      defaultSide: 'L',
      defaultDuration: 15,
      defaultNappyType: 'wet',
      isLoading: defaults === undefined && !!householdId
    }
  }

  return {
    ...defaults,
    isLoading: false
  }
}
