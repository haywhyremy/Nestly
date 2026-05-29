import { useEffect, useState } from 'react'
import { Sheet } from './Sheet'
import { LogEntryCard } from '../cards/LogEntryCard'
import { PrimaryButton } from '../buttons/PrimaryButton'
import { SecondaryButton } from '../buttons/SecondaryButton'
import { GhostButton } from '../buttons/GhostButton'
import { useHousehold } from '../../context/HouseholdContext'
import { useAuth } from '../../context/AuthContext'
import db from '../../db/dexie'
import { createEvent } from '../../db/repositories'
import { trackEvent } from '../../services/analytics'

/**
 * Overlay sheet for duplicate logs manual conflict resolution.
 * 
 * @param {Object} props - Hook properties.
 */
export function ConflictSheet({ isOpen, onClose, conflictEvent }) {
  const { user } = useAuth()
  const { household, baby, myProfile } = useHousehold()

  const [pairedEvent, setPairedEvent] = useState(null)
  const [isResolving, setIsResolving] = useState(false)
  const [resolved, setResolved] = useState(false)

  // Fetch paired duplicate event when opened
  useEffect(() => {
    if (isOpen && conflictEvent && household?.id) {
      const findPair = async () => {
        const conflictTime = new Date(conflictEvent.eventTime)
        const CONFLICT_WINDOW_MS = 10 * 60 * 1000

        try {
          // Fetch un-deleted pending conflicts from IndexedDB
          const pendingConflicts = await db.events
            .where('conflictStatus')
            .equals('pending')
            .toArray()

          const pair = pendingConflicts.find((e) => {
            if (e.householdId !== household.id) return false
            if (e.eventType !== conflictEvent.eventType) return false
            if (e.clientId === conflictEvent.clientId) return false
            if (e.deviceId === conflictEvent.deviceId) return false
            if (e.deletedAt) return false

            const diff = Math.abs(new Date(e.eventTime) - conflictTime)
            return diff < CONFLICT_WINDOW_MS
          })

          setPairedEvent(pair || null)
        } catch (err) {
          console.error('Failed to locate matching conflict event pair:', err)
        }
      }
      findPair()
    } else {
      setPairedEvent(null)
      setResolved(false)
    }
  }, [isOpen, conflictEvent, household?.id])

  // Helper function to update Dexie and stage changes in sync queue
  const resolveEventInDb = async (clientId, updates = {}) => {
    const original = await db.events.get(clientId)
    if (!original) return

    const now = new Date().toISOString()
    const updated = {
      ...original,
      ...updates,
      syncStatus: 'pending',
      updatedAt: now
    }

    await db.events.put(updated)
    await db.syncQueue.put({
      clientId,
      createdAt: now
    })
  }

  // Keep both events, flag resolved, log tracking event
  const handleKeepBoth = async () => {
    if (!household?.id || !baby?.id || !user?.id || !pairedEvent) return
    setIsResolving(true)

    try {
      await resolveEventInDb(conflictEvent.clientId, { conflictStatus: 'resolved' })
      await resolveEventInDb(pairedEvent.clientId, { conflictStatus: 'resolved' })

      const loggedByName = myProfile?.displayLabel || myProfile?.displayName || 'Parent'
      await createEvent({
        type: 'conflict_resolved',
        subtype: 'keep_both',
        metadata: {
          resolution: 'keep_both',
          affected_ids: [conflictEvent.clientId, pairedEvent.clientId]
        },
        eventTime: new Date().toISOString(),
        householdId: household.id,
        babyId: baby.id,
        loggedBy: user.id,
        loggedByName
      })

      trackEvent('conflict_resolved', {
        household_id: household.id,
        resolution: 'keep_both'
      })

      setResolved(true)
      onClose()
    } catch (err) {
      console.error('Failed to resolve conflicts (Keep Both):', err)
    } finally {
      setIsResolving(false)
    }
  }

  // Keep event with more metadata, soft-delete lesser, log tracking event
  const handleMerge = async () => {
    if (!household?.id || !baby?.id || !user?.id || !pairedEvent) return
    setIsResolving(true)

    try {
      const newEventKeys = Object.keys(conflictEvent.metadata || {}).length
      const pairedEventKeys = Object.keys(pairedEvent.metadata || {}).length

      let survivor = conflictEvent
      let lesser = pairedEvent

      if (pairedEventKeys > newEventKeys) {
        survivor = pairedEvent
        lesser = conflictEvent
      }

      // Soft delete the lesser event
      await resolveEventInDb(lesser.clientId, {
        deletedAt: new Date().toISOString()
      })

      // Set survivor status to resolved
      await resolveEventInDb(survivor.clientId, { conflictStatus: 'resolved' })

      const loggedByName = myProfile?.displayLabel || myProfile?.displayName || 'Parent'
      await createEvent({
        type: 'conflict_resolved',
        subtype: 'merged',
        metadata: {
          resolution: 'merged',
          surviving_id: survivor.clientId,
          deleted_id: lesser.clientId,
          affected_ids: [conflictEvent.clientId, pairedEvent.clientId]
        },
        eventTime: new Date().toISOString(),
        householdId: household.id,
        babyId: baby.id,
        loggedBy: user.id,
        loggedByName
      })

      trackEvent('conflict_resolved', {
        household_id: household.id,
        resolution: 'merged'
      })

      setResolved(true)
      onClose()
    } catch (err) {
      console.error('Failed to resolve conflicts (Merge):', err)
    } finally {
      setIsResolving(false)
    }
  }

  // Soft-delete clicked event, keep paired event, log tracking event
  const handleDeleteOne = async () => {
    if (!household?.id || !baby?.id || !user?.id || !pairedEvent) return
    setIsResolving(true)

    try {
      // Soft delete the tapped event (conflictEvent)
      await resolveEventInDb(conflictEvent.clientId, {
        deletedAt: new Date().toISOString()
      })

      // Mark the paired event as resolved
      await resolveEventInDb(pairedEvent.clientId, { conflictStatus: 'resolved' })

      const loggedByName = myProfile?.displayLabel || myProfile?.displayName || 'Parent'
      await createEvent({
        type: 'conflict_resolved',
        subtype: 'deleted_one',
        metadata: {
          resolution: 'deleted_one',
          deleted_id: conflictEvent.clientId,
          surviving_id: pairedEvent.clientId,
          affected_ids: [conflictEvent.clientId, pairedEvent.clientId]
        },
        eventTime: new Date().toISOString(),
        householdId: household.id,
        babyId: baby.id,
        loggedBy: user.id,
        loggedByName
      })

      trackEvent('conflict_resolved', {
        household_id: household.id,
        resolution: 'deleted_one'
      })

      setResolved(true)
      onClose()
    } catch (err) {
      console.error('Failed to resolve conflicts (Delete One):', err)
    } finally {
      setIsResolving(false)
    }
  }

  const getMinutesDifference = () => {
    if (!conflictEvent || !pairedEvent) return 0
    const diffMs = Math.abs(new Date(conflictEvent.eventTime) - new Date(pairedEvent.eventTime))
    return Math.round(diffMs / 60000)
  }

  if (!conflictEvent) return null

  const eventTypeLabel = conflictEvent.eventType

  const footerElement = (
    <div className="flex flex-col gap-2 w-full mt-4">
      <PrimaryButton
        onClick={handleKeepBoth}
        disabled={isResolving || !pairedEvent}
        className="w-full font-semibold"
      >
        {isResolving ? 'Resolving...' : 'Keep both'}
      </PrimaryButton>

      <SecondaryButton
        onClick={handleMerge}
        disabled={isResolving || !pairedEvent}
        className="w-full"
      >
        Merge into one
      </SecondaryButton>

      <GhostButton
        onClick={handleDeleteOne}
        disabled={isResolving || !pairedEvent}
        className="w-full text-accent-coral hover:text-accent-coral/80"
      >
        Delete one of them
      </GhostButton>

      <p className="text-xs text-ink-tertiary text-center mt-3 select-none leading-relaxed">
        You can decide later — they'll stay flagged until then.
      </p>
    </div>
  )

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Possible duplicate"
      footer={footerElement}
    >
      <div className="space-y-4 pt-4 select-none">
        <p className="text-sm text-ink-secondary leading-relaxed">
          {pairedEvent ? (
            `Two ${eventTypeLabel}s were logged ${getMinutesDifference()} minutes apart. Was this one ${eventTypeLabel} or two?`
          ) : (
            `Locating conflicting counterpart for this logged ${eventTypeLabel}...`
          )}
        </p>

        <div className="space-y-2">
          <div className="border border-signal-conflict/30 rounded-xl overflow-hidden bg-signal-conflict/5">
            <span className="block text-[10px] font-bold text-signal-conflict/80 px-4 pt-2 tracking-wider uppercase select-none">
              Tapped Entry
            </span>
            <LogEntryCard event={conflictEvent} onTap={() => {}} />
          </div>

          {pairedEvent && (
            <div className="border border-surface-sunken rounded-xl overflow-hidden bg-surface-sunken/10">
              <span className="block text-[10px] font-bold text-ink-tertiary px-4 pt-2 tracking-wider uppercase select-none">
                Conflicting Counterpart
              </span>
              <LogEntryCard event={pairedEvent} onTap={() => {}} />
            </div>
          )}
        </div>
      </div>
    </Sheet>
  )
}

export default ConflictSheet;
