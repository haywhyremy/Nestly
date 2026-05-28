import { useEffect, useRef, useState } from 'react'
import { Sheet } from './Sheet'
import { SegmentedToggle } from '../inputs/SegmentedToggle'
import { TimePicker } from '../inputs/TimePicker'
import { CarerAttribution } from '../inputs/CarerAttribution'
import { PrimaryButton } from '../buttons/PrimaryButton'
import { useHousehold } from '../../context/HouseholdContext'
import { useAuth } from '../../context/AuthContext'
import { useDefaults } from '../../hooks/useDefaults'
import { createEvent } from '../../db/repositories'
import { trackEvent } from '../../services/analytics'

export function LogNappySheet({ isOpen, onClose }) {
  const { user } = useAuth()
  const { household, baby, myProfile } = useHousehold()
  const defaults = useDefaults(household?.id)

  const [nappyType, setNappyType] = useState('wet')
  const [eventTime, setEventTime] = useState(new Date())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const sheetOpenTime = useRef(null)

  // Reset fields to defaults when the sheet is opened
  useEffect(() => {
    if (isOpen) {
      setNappyType(defaults.defaultNappyType || 'wet')
      setEventTime(new Date())
      sheetOpenTime.current = Date.now()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const handleLogNappy = async () => {
    if (!household?.id || !baby?.id || !user?.id) {
      console.error('Cannot log nappy: Missing household, baby, or user details.')
      return
    }

    setIsSubmitting(true)
    try {
      const metadata = { nappy_type: nappyType }
      const loggedByName = myProfile?.displayLabel || myProfile?.displayName || 'Parent'

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

      // Track analytics with duration
      const durationMs = Date.now() - (sheetOpenTime.current || Date.now())
      trackEvent('entry_logged', {
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

  const footerElement = (
    <PrimaryButton
      onClick={handleLogNappy}
      disabled={isSubmitting}
      className="bg-accent-clay w-full"
    >
      {isSubmitting ? 'Logging...' : 'Log nappy'}
    </PrimaryButton>
  )

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Log nappy"
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
