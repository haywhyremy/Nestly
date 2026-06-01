import { useEffect, useRef, useState } from 'react'
import { Sheet } from './Sheet'
import { TimePicker } from '../inputs/TimePicker'
import { CarerAttribution } from '../inputs/CarerAttribution'
import { PrimaryButton } from '../buttons/PrimaryButton'
import { GhostButton } from '../buttons/GhostButton'
import { DestructiveButton } from '../buttons/DestructiveButton'
import { useHousehold } from '../../context/HouseholdContext'
import { useAuth } from '../../context/AuthContext'
import { createEvent, updateEvent, softDeleteEvent } from '../../db/repositories'
import { trackEvent } from '../../services/analytics'

export function LogSleepSheet({ isOpen, onClose, activeSleep, editEvent = null, onSave = null }) {
  const { user } = useAuth()
  const { household, baby, myProfile } = useHousehold()

  const [mode, setMode] = useState('start')
  const [eventTime, setEventTime] = useState(new Date())
  const [pastStartTime, setPastStartTime] = useState(new Date(Date.now() - 60 * 60 * 1000))
  const [pastEndTime, setPastEndTime] = useState(new Date(Date.now() - 15 * 60 * 1000))
  const [isSubmitting, setIsSubmitting] = useState(false)

  const sheetOpenTime = useRef(null)

  // Reset fields to defaults when the sheet is opened
  useEffect(() => {
    if (isOpen) {
      if (editEvent) {
        setEventTime(new Date(editEvent.eventTime))
        if (editEvent.eventSubtype === 'end') {
          setMode('edit_end')
        } else {
          setMode('edit_start')
        }
      } else {
        setMode(activeSleep ? 'end' : 'start')
        setEventTime(new Date())
        setPastStartTime(new Date(Date.now() - 60 * 60 * 1000))
        setPastEndTime(new Date(Date.now() - 15 * 60 * 1000))
      }
      sheetOpenTime.current = Date.now()
    }
  }, [isOpen, activeSleep, editEvent])

  if (!household || !baby) {
    return (
      <Sheet isOpen={isOpen} onClose={onClose} title="Loading...">
        <p className="text-sm text-ink-tertiary text-center py-8">Setting up...</p>
      </Sheet>
    )
  }

  const handleStartSleep = async () => {
    const loggedByName = myProfile?.displayLabel || myProfile?.displayName || 'Parent'
    await createEvent({
      type: 'sleep',
      subtype: 'start',
      metadata: { start_time: eventTime.toISOString() },
      eventTime: eventTime.toISOString(),
      householdId: household.id,
      babyId: baby.id,
      loggedBy: user.id,
      loggedByName
    })

    trackEvent('entry_logged', {
      type: 'sleep',
      subtype: 'start',
      household_id: household.id,
      duration_ms: Date.now() - sheetOpenTime.current
    })
  }

  const handleEndSleep = async () => {
    const durationMinutes = Math.max(
      0,
      Math.round((eventTime.getTime() - new Date(activeSleep.eventTime).getTime()) / 60000)
    )

    const loggedByName = myProfile?.displayLabel || myProfile?.displayName || 'Parent'
    await createEvent({
      type: 'sleep',
      subtype: 'end',
      metadata: {
        end_time: eventTime.toISOString(),
        duration_minutes: durationMinutes
      },
      eventTime: eventTime.toISOString(),
      householdId: household.id,
      babyId: baby.id,
      loggedBy: user.id,
      loggedByName
    })

    trackEvent('entry_logged', {
      type: 'sleep',
      subtype: 'end',
      household_id: household.id,
      duration_ms: Date.now() - sheetOpenTime.current
    })
  }

  const handlePastSleep = async () => {
    const durationMinutes = Math.max(
      0,
      Math.round((pastEndTime.getTime() - pastStartTime.getTime()) / 60000)
    )

    const loggedByName = myProfile?.displayLabel || myProfile?.displayName || 'Parent'
    
    // Create both events sequentially
    await createEvent({
      type: 'sleep',
      subtype: 'start',
      metadata: { start_time: pastStartTime.toISOString() },
      eventTime: pastStartTime.toISOString(),
      householdId: household.id,
      babyId: baby.id,
      loggedBy: user.id,
      loggedByName
    })

    await createEvent({
      type: 'sleep',
      subtype: 'end',
      metadata: {
        end_time: pastEndTime.toISOString(),
        duration_minutes: durationMinutes
      },
      eventTime: pastEndTime.toISOString(),
      householdId: household.id,
      babyId: baby.id,
      loggedBy: user.id,
      loggedByName
    })

    trackEvent('entry_logged', {
      type: 'sleep',
      subtype: 'past',
      household_id: household.id,
      duration_ms: Date.now() - sheetOpenTime.current
    })
  }

  const handleSaveEndSleep = async () => {
    if (!editEvent) return

    const originalEnd = new Date(editEvent.eventTime)
    const durationMinutesOld = editEvent.metadata?.duration_minutes || 0
    const startTime = new Date(originalEnd.getTime() - durationMinutesOld * 60 * 1000)

    const durationMinutes = Math.max(
      0,
      Math.round((eventTime.getTime() - startTime.getTime()) / 60000)
    )

    await updateEvent(editEvent.clientId, {
      metadata: {
        end_time: eventTime.toISOString(),
        duration_minutes: durationMinutes
      },
      eventTime: eventTime.toISOString()
    })

    if (onSave) {
      onSave()
    }
  }

  const handleDeleteSleep = async () => {
    if (!editEvent) return

    const confirmed = window.confirm('Delete this entry? This cannot be undone.')
    if (!confirmed) return

    setIsSubmitting(true)
    try {
      await softDeleteEvent(editEvent.clientId)

      trackEvent('entry_deleted', {
        type: 'sleep',
        subtype: editEvent.eventSubtype,
        household_id: household?.id
      })

      onClose()
    } catch (err) {
      console.error('Failed to delete sleep entry:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (!household?.id || !baby?.id || !user?.id) {
      console.error('Cannot log sleep: Missing household, baby, or user details.')
      return
    }

    setIsSubmitting(true)
    try {
      if (mode === 'start') {
        await handleStartSleep()
      } else if (mode === 'end') {
        await handleEndSleep()
      } else if (mode === 'past') {
        await handlePastSleep()
      } else if (mode === 'edit_end') {
        await handleSaveEndSleep()
      }
      onClose()
    } catch (err) {
      console.error('Failed to log sleep entry:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Determine prominent duration text for End Mode
  const renderEndModeDuration = () => {
    if (!activeSleep) return null
    const totalMinutes = Math.max(
      0,
      Math.round((Date.now() - new Date(activeSleep.eventTime).getTime()) / 60000)
    )
    const hours = Math.floor(totalMinutes / 60)
    const mins = totalMinutes % 60

    return (
      <div className="text-lg font-semibold text-ink-primary text-center my-4">
        Baby has been sleeping for {hours}h {mins}m
      </div>
    )
  }

  const sheetTitle =
    mode === 'edit_start' || mode === 'edit_end' ? 'Edit sleep' :
    mode === 'start' ? 'Start sleep' :
    mode === 'end' ? 'End sleep' :
    'Log a past sleep'

  const submitButtonText =
    mode === 'start' ? 'Start now' :
    mode === 'end' ? 'End now' :
    'Log sleep'

  const footerElement = (
    <div className="flex flex-col gap-2 w-full">
      {mode !== 'edit_start' && (
        <PrimaryButton
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-accent-dusk w-full"
        >
          {isSubmitting ? (mode === 'edit_end' ? 'Saving...' : 'Logging...') : mode === 'edit_end' ? 'Save changes' : submitButtonText}
        </PrimaryButton>
      )}

      {(mode === 'edit_start' || mode === 'edit_end') && (
        <DestructiveButton
          onClick={handleDeleteSleep}
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Deleting...' : 'Delete this entry'}
        </DestructiveButton>
      )}

      {mode === 'start' && (
        <GhostButton onClick={() => setMode('past')} className="w-full">
          Log a past sleep instead
        </GhostButton>
      )}

      {mode === 'past' && (
        <GhostButton onClick={() => setMode('start')} className="w-full">
          Cancel
        </GhostButton>
      )}
    </div>
  )

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={sheetTitle}
      footer={footerElement}
    >
      <div className="space-y-6 pt-4">
        {mode === 'start' && (
          <div className="space-y-6 animate-fade-in">
            <TimePicker
              value={eventTime}
              onChange={setEventTime}
            />
          </div>
        )}

        {mode === 'end' && (
          <div className="space-y-6 animate-fade-in">
            {renderEndModeDuration()}
            
            <div className="border-t border-surface-sunken my-2" />
            
            <TimePicker
              value={eventTime}
              onChange={setEventTime}
              label="End time"
            />
          </div>
        )}

        {mode === 'edit_start' && (
          <div className="space-y-4 animate-fade-in text-center py-6">
            <span className="block text-xs font-medium text-ink-secondary uppercase tracking-wider">
              Start Time (Read-Only)
            </span>
            <div className="text-2xl font-bold text-ink-primary">
              {eventTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <p className="text-xs text-ink-tertiary">
              Sleep start times cannot be edited directly once logged.
            </p>
          </div>
        )}

        {mode === 'edit_end' && (
          <div className="space-y-6 animate-fade-in">
            {(() => {
              const originalEnd = new Date(editEvent.eventTime)
              const durationMinutesOld = editEvent.metadata?.duration_minutes || 0
              const startTime = new Date(originalEnd.getTime() - durationMinutesOld * 60 * 1000)
              const totalMinutes = Math.max(
                0,
                Math.round((eventTime.getTime() - startTime.getTime()) / 60000)
              )
              const hours = Math.floor(totalMinutes / 60)
              const mins = totalMinutes % 60
              return (
                <div className="text-lg font-semibold text-ink-primary text-center my-4">
                  Sleep duration: {hours}h {mins}m
                </div>
              )
            })()}

            <div className="border-t border-surface-sunken my-2" />

            <TimePicker
              value={eventTime}
              onChange={setEventTime}
              label="End time"
            />
          </div>
        )}

        {mode === 'past' && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <span className="block text-xs font-medium text-ink-secondary uppercase tracking-wider mb-2">
                Started at
              </span>
              <TimePicker
                value={pastStartTime}
                onChange={setPastStartTime}
                label="Start time"
              />
            </div>

            <div className="border-t border-surface-sunken my-2" />

            <div>
              <span className="block text-xs font-medium text-ink-secondary uppercase tracking-wider mb-2">
                Ended at
              </span>
              <TimePicker
                value={pastEndTime}
                onChange={setPastEndTime}
                label="End time"
              />
            </div>
          </div>
        )}

        <div className="border-t border-surface-sunken my-2" />

        <CarerAttribution
          name={myProfile?.displayLabel || myProfile?.displayName || 'Parent'}
        />
      </div>
    </Sheet>
  )
}

export default LogSleepSheet;
