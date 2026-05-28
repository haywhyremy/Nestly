import { useEffect, useRef, useState } from 'react'
import { Sheet } from './Sheet'
import { SegmentedToggle } from '../inputs/SegmentedToggle'
import { Stepper } from '../inputs/Stepper'
import { TimePicker } from '../inputs/TimePicker'
import { DurationPicker } from '../inputs/DurationPicker'
import { CarerAttribution } from '../inputs/CarerAttribution'
import { PrimaryButton } from '../buttons/PrimaryButton'
import { useHousehold } from '../../context/HouseholdContext'
import { useAuth } from '../../context/AuthContext'
import { useDefaults } from '../../hooks/useDefaults'
import { createEvent } from '../../db/repositories'
import { trackEvent } from '../../services/analytics'

export function LogFeedSheet({ isOpen, onClose }) {
  const { user } = useAuth()
  const { household, baby, myProfile } = useHousehold()
  const defaults = useDefaults(household?.id)

  const [feedType, setFeedType] = useState('bottle')
  const [volume, setVolume] = useState(90)
  const [side, setSide] = useState('L')
  const [duration, setDuration] = useState(15)
  const [eventTime, setEventTime] = useState(new Date())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const sheetOpenTime = useRef(null)

  // Reset fields to fresh defaults whenever the sheet is opened
  useEffect(() => {
    if (isOpen) {
      setFeedType(defaults.defaultFeedType || 'bottle')
      setVolume(defaults.defaultVolume || 90)
      setSide(defaults.defaultSide || 'L')
      setDuration(defaults.defaultDuration || 15)
      setEventTime(new Date())
      sheetOpenTime.current = Date.now()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const handleLogFeed = async () => {
    if (!household?.id || !baby?.id || !user?.id) {
      console.error('Cannot log feed: Missing household, baby, or user details.')
      return
    }

    setIsSubmitting(true)
    try {
      const metadata =
        feedType === 'bottle'
          ? { volume_ml: volume }
          : { side, duration_minutes: duration }

      const loggedByName = myProfile?.displayLabel || myProfile?.displayName || 'Parent'

      await createEvent({
        type: 'feed',
        subtype: feedType,
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
        type: 'feed',
        subtype: feedType,
        household_id: household.id,
        duration_ms: durationMs
      })

      onClose()
    } catch (err) {
      console.error('Failed to log feed entry:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const footerElement = (
    <PrimaryButton
      onClick={handleLogFeed}
      disabled={isSubmitting}
      className="w-full"
    >
      {isSubmitting ? 'Logging...' : 'Log feed'}
    </PrimaryButton>
  )

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Log feed"
      footer={footerElement}
    >
      <div className="space-y-6 pt-4">
        <SegmentedToggle
          options={[
            { value: 'bottle', label: 'Bottle' },
            { value: 'breast', label: 'Breast' }
          ]}
          value={feedType}
          onChange={setFeedType}
          accentColor="bg-accent-sage"
        />

        {feedType === 'bottle' ? (
          <div className="space-y-2 animate-fade-in">
            <span className="block text-sm font-semibold text-ink-secondary uppercase tracking-wider mb-2">
              Volume
            </span>
            <Stepper
              value={volume}
              onChange={setVolume}
              min={0}
              max={500}
              step={10}
              unit="ml"
            />
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <span className="block text-sm font-semibold text-ink-secondary uppercase tracking-wider mb-2">
                Side
              </span>
              <SegmentedToggle
                options={[
                  { value: 'L', label: 'Left' },
                  { value: 'R', label: 'Right' },
                  { value: 'Both', label: 'Both' }
                ]}
                value={side}
                onChange={setSide}
                accentColor="bg-accent-sage"
              />
            </div>

            <DurationPicker
              value={duration}
              onChange={setDuration}
            />
          </div>
        )}

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

export default LogFeedSheet;
