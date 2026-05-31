import { useEffect, useRef, useState } from 'react'
import { Sheet } from './Sheet'
import { SegmentedToggle } from '../inputs/SegmentedToggle'
import { TimePicker } from '../inputs/TimePicker'
import { CarerAttribution } from '../inputs/CarerAttribution'
import { PrimaryButton } from '../buttons/PrimaryButton'
import { DestructiveButton } from '../buttons/DestructiveButton'
import { useHousehold } from '../../context/HouseholdContext'
import { useAuth } from '../../context/AuthContext'
import { useDefaults } from '../../hooks/useDefaults'
import { createEvent, updateEvent, softDeleteEvent } from '../../db/repositories'
import { trackEvent } from '../../services/analytics'

export function LogNappySheet({ isOpen, onClose, editEvent = null, onSave = null }) {
  const { user } = useAuth()
  const { household, baby, myProfile } = useHousehold()
  const defaults = useDefaults(household?.id)

  const [nappyType, setNappyType] = useState('wet')
  const [eventTime, setEventTime] = useState(new Date())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const sheetOpenTime = useRef(null)

  // Reset fields to defaults or event values when the sheet is opened
  useEffect(() => {
    if (isOpen) {
      if (editEvent) {
        setNappyType(editEvent.eventSubtype || 'wet')
        setEventTime(new Date(editEvent.eventTime))
      } else {
        setNappyType(defaults.defaultNappyType || 'wet')
        setEventTime(new Date())
      }
      sheetOpenTime.current = Date.now()
    }
  }, [isOpen, editEvent])

  if (!household || !baby) {
    return (
      <Sheet isOpen={isOpen} onClose={onClose} title="Loading...">
        <p className="text-sm text-ink-tertiary text-center py-8">Setting up...</p>
      </Sheet>
    )
  }

  const handleLogNappy = async () => {
    if (!household?.id || !baby?.id || !user?.id) {
      console.error('Cannot log nappy: Missing household, baby, or user details.')
      return
    }

    setIsSubmitting(true)
    try {
      const metadata = { nappy_type: nappyType }
      const loggedByName = myProfile?.displayLabel || myProfile?.displayName || 'Parent'

      if (editEvent) {
        await updateEvent(editEvent.clientId, {
          eventSubtype: nappyType,
          metadata,
          eventTime: eventTime.toISOString()
        })
        if (onSave) {
          onSave()
        }
      } else {
        await createEvent({
          type: 'nappy',
          subtype: nappyType,
          metadata,
          eventTime: eventTime.toISOString(),
          householdId: household.id,
          babyId: baby.id,
          loggedBy: user.id,
          loggedByName
        })
      }

      // Track analytics with duration
      const durationMs = Date.now() - (sheetOpenTime.current || Date.now())
      trackEvent(editEvent ? 'entry_edited' : 'entry_logged', {
        type: 'nappy',
        subtype: nappyType,
        household_id: household.id,
        duration_ms: durationMs
      })

      onClose()
    } catch (err) {
      console.error('Failed to log nappy entry:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteNappy = async () => {
    if (!editEvent) return

    const confirmed = window.confirm('Delete this entry? This cannot be undone.')
    if (!confirmed) return

    setIsSubmitting(true)
    try {
      await softDeleteEvent(editEvent.clientId)

      trackEvent('entry_deleted', {
        type: 'nappy',
        subtype: editEvent.eventSubtype,
        household_id: household?.id
      })

      onClose()
    } catch (err) {
      console.error('Failed to delete nappy entry:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const footerElement = (
    <div className="flex flex-col gap-2 w-full">
      <PrimaryButton
        onClick={handleLogNappy}
        disabled={isSubmitting}
        className="bg-accent-clay w-full"
      >
        {isSubmitting ? (editEvent ? 'Saving...' : 'Logging...') : editEvent ? 'Save changes' : 'Log nappy'}
      </PrimaryButton>

      {editEvent && (
        <DestructiveButton
          onClick={handleDeleteNappy}
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Deleting...' : 'Delete this entry'}
        </DestructiveButton>
      )}
    </div>
  )

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={editEvent ? 'Edit nappy' : 'Log nappy'}
      footer={footerElement}
    >
      <div className="space-y-6 pt-4">
        <SegmentedToggle
          options={[
            { value: 'wet', label: 'Wet' },
            { value: 'dirty', label: 'Dirty' },
            { value: 'both', label: 'Both' }
          ]}
          value={nappyType}
          onChange={setNappyType}
          accentColor="bg-accent-clay"
        />

        <div className="border-t border-surface-sunken my-2" />

        <TimePicker
          value={eventTime}
          onChange={setEventTime}
        />

        <CarerAttribution
          name={myProfile?.displayLabel || myProfile?.displayName || 'Parent'}
        />
      </div>
    </Sheet>
  )
}

export default LogNappySheet;
