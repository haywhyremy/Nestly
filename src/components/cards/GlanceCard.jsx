import { useEffect, useState } from 'react'
import { formatTimeSince, formatDuration } from '../../utils/time'

export function GlanceCard({
  lastFeed,
  lastNappy,
  lastSleep,
  activeSleep
}) {
  const [tick, setTick] = useState(0)
  const [opacityClass, setOpacityClass] = useState('opacity-100')

  // Force a re-render every 60 seconds to keep the "time since" labels current
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1)
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // Trigger brief fade transition on tick changes (when not preferring reduced motion)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion || tick === 0) return

    setOpacityClass('opacity-60')
    const timer = setTimeout(() => {
      setOpacityClass('opacity-100')
    }, 150)
    return () => clearTimeout(timer)
  }, [tick])

  const renderHeroSection = () => {
    if (!lastFeed) {
      return (
        <div className="text-center py-4 select-none">
          <span className="block text-xs font-semibold tracking-widest uppercase text-[#A89F94] dark:text-[#6B6259] mb-1">
            LAST FEED
          </span>
          <span className="text-6xl font-semibold tracking-tight text-[#1F1B16] dark:text-[#F0ECE6]">
            —
          </span>
          <p className="text-sm text-[#A89F94] dark:text-[#6B6259] mt-1">
            No feeds logged yet
          </p>
        </div>
      )
    }

    const { eventSubtype, metadata, loggedByName, eventTime } = lastFeed
    const timeSince = formatTimeSince(eventTime)

    let subLine = ''
    if (eventSubtype === 'bottle') {
      subLine = `${metadata?.volume_ml || 0}ml · ${loggedByName || 'Parent'}`
    } else if (eventSubtype === 'breast') {
      const sideLabel = metadata?.side === 'L' ? 'Left' : metadata?.side === 'R' ? 'Right' : metadata?.side || 'Both'
      subLine = `${sideLabel} · ${metadata?.duration_minutes || 0}m · ${loggedByName || 'Parent'}`
    }

    return (
      <div className="text-center py-4 select-none animate-fade-in">
        <span className="block text-xs font-semibold tracking-widest uppercase text-[#A89F94] dark:text-[#6B6259] mb-1">
          LAST FEED
        </span>
        <span
          className={`text-6xl font-semibold tracking-tight text-[#1F1B16] dark:text-[#F0ECE6] tabular-nums transition-opacity duration-300 ${opacityClass}`}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {timeSince}
        </span>
        <p className="text-base text-[#6B6259] dark:text-[#A89F94] mt-1">
          {subLine}
        </p>
      </div>
    )
  }

  const renderNappyRow = () => {
    if (!lastNappy) {
      return (
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-accent-clay flex-shrink-0" />
          <span className="text-sm text-[#A89F94] dark:text-[#6B6259]">
            No nappies logged yet
          </span>
        </div>
      )
    }

    const { eventSubtype, loggedByName, eventTime } = lastNappy
    const timeSince = formatTimeSince(eventTime)
    
    const subtypeLabel = eventSubtype 
      ? eventSubtype.charAt(0).toUpperCase() + eventSubtype.slice(1) 
      : 'Wet'

    return (
      <div className="flex items-center gap-3 animate-fade-in">
        <div className="w-2 h-2 rounded-full bg-accent-clay flex-shrink-0" />
        <span className="text-sm text-[#6B6259] dark:text-[#A89F94]">
          Last nappy · {timeSince} · {subtypeLabel} · {loggedByName || 'Parent'}
        </span>
      </div>
    )
  }

  const renderSleepRow = () => {
    if (activeSleep) {
      const timeSince = formatTimeSince(activeSleep.eventTime)
      return (
        <div className="flex items-center gap-3 animate-fade-in">
          <div className="w-2 h-2 rounded-full bg-accent-dusk flex-shrink-0 animate-pulse" />
          <span className="text-sm text-[#6B6259] dark:text-[#A89F94]">
            Sleep · ongoing · {timeSince}
          </span>
        </div>
      )
    }

    if (lastSleep) {
      const { metadata, eventTime } = lastSleep
      const durationText = formatDuration(metadata?.duration_minutes || 0)
      const timeSince = formatTimeSince(eventTime)

      return (
        <div className="flex items-center gap-3 animate-fade-in">
          <div className="w-2 h-2 rounded-full bg-accent-dusk flex-shrink-0" />
          <span className="text-sm text-[#6B6259] dark:text-[#A89F94]">
            Last sleep · {durationText} · ended {timeSince}
          </span>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-accent-dusk flex-shrink-0" />
        <span className="text-sm text-[#A89F94] dark:text-[#6B6259]">
          No sleep logged yet
        </span>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col items-center">
      {renderHeroSection()}

      <div className="mt-4 space-y-2 w-full px-2">
        {renderNappyRow()}
        {renderSleepRow()}
      </div>
    </div>
  )
}

export default GlanceCard;
