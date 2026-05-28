import { formatTimeSince, formatTimeOfDay } from '../../utils/time'

export function LogEntryCard({ event, onTap }) {
  if (!event) return null

  const { eventType, eventSubtype, metadata, loggedByName, eventTime, syncStatus } = event

  // 1. Resolve left dot color
  let dotColorClass = 'bg-ink-tertiary'
  if (event.conflictStatus === 'resolved') {
    dotColorClass = 'bg-ink-tertiary'
  } else {
    switch (eventType) {
      case 'feed':
        dotColorClass = 'bg-accent-sage'
        break
      case 'nappy':
        dotColorClass = 'bg-accent-clay'
        break
      case 'sleep':
        dotColorClass = 'bg-accent-dusk'
        break
    }
  }

  // 2. Resolve title label
  let titleLabel = ''
  switch (eventType) {
    case 'feed':
      titleLabel = 'Feed'
      break
    case 'nappy':
      titleLabel = 'Nappy'
      break
    case 'sleep':
      titleLabel = eventSubtype === 'start' ? 'Sleep started' : 'Sleep ended'
      break
    default:
      titleLabel = eventType ? eventType.charAt(0).toUpperCase() + eventType.slice(1) : ''
  }

  // 3. Resolve right-side key metric
  let keyMetric = ''
  if (eventType === 'feed') {
    if (eventSubtype === 'bottle') {
      keyMetric = `${metadata?.volume_ml || 0}ml`
    } else if (eventSubtype === 'breast') {
      keyMetric = `${metadata?.side || ''} · ${metadata?.duration_minutes || 0}m`
    }
  } else if (eventType === 'nappy') {
    const sub = eventSubtype || 'wet'
    keyMetric = sub.charAt(0).toUpperCase() + sub.slice(1)
  } else if (eventType === 'sleep') {
    if (eventSubtype === 'start') {
      keyMetric = formatTimeOfDay(eventTime)
    } else {
      keyMetric = metadata?.duration_minutes !== undefined 
        ? `${metadata.duration_minutes}m` 
        : formatTimeOfDay(eventTime)
    }
  }

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && onTap) {
      e.preventDefault()
      onTap()
    }
  }

  const isPendingSync = syncStatus !== 'synced'

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onTap}
      onKeyDown={handleKeyDown}
      className="relative flex items-start gap-3 px-4 py-3 min-h-[64px] cursor-pointer active:bg-surface-sunken/50 transition-colors rounded-xl select-none animate-fade-in"
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Left Type Coloured Indicator Dot */}
      <div className={`w-2 h-2 rounded-full ${dotColorClass} mt-2 flex-shrink-0`} />

      {/* Middle Context Area */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-ink-primary truncate">
          {titleLabel}
        </h3>
        <p className="text-xs text-ink-tertiary mt-0.5 truncate">
          by {loggedByName || 'Parent'} · {formatTimeSince(eventTime)}
        </p>
      </div>

      {/* Right Metric Area */}
      <div className="text-right flex-shrink-0 pl-2">
        <div
          className="text-sm font-mono tabular-nums text-ink-primary font-medium"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {keyMetric}
        </div>
        <div className="text-xs text-ink-tertiary mt-0.5">
          {formatTimeOfDay(eventTime)}
        </div>
      </div>

      {/* Pending Synchronization Indicator Dot */}
      {isPendingSync && (
        <div className="w-1.5 h-1.5 rounded-full bg-signal-sync absolute top-2.5 right-2.5" />
      )}
    </div>
  )
}

export default LogEntryCard;
