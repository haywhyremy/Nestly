export function TimelineRibbon({ events = [] }) {
  // Filter events to ensure they have valid eventTime
  const validEvents = events.filter((e) => e && e.eventTime && !e.deletedAt)

  const renderDots = () => {
    return validEvents.map((event) => {
      const date = new Date(event.eventTime)
      const eventHour = date.getHours()
      const eventMinutes = date.getMinutes()
      const leftPercent = ((eventHour * 60 + eventMinutes) / 1440) * 100

      let dotColorClass = 'bg-ink-tertiary'
      if (event.conflictStatus === 'resolved') {
        dotColorClass = 'bg-ink-tertiary'
      } else {
        switch (event.eventType) {
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

      return (
        <div
          key={event.clientId || event.id}
          className={`absolute w-2 h-2 rounded-full top-1/2 -translate-y-1/2 ${dotColorClass} shadow-sm transition-all duration-300 hover:scale-125`}
          style={{ left: `${leftPercent}%`, transform: 'translate(-50%, -50%)' }}
          title={`${event.eventType} at ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`}
        />
      )
    })
  }

  return (
    <div className="h-10 bg-surface-sunken rounded-xl mx-4 relative overflow-hidden select-none border border-surface-sunken/60 shadow-inner">
      {/* 24-Hour Markers/Grid subtle indicators (optional premium touch) */}
      <div className="absolute inset-0 flex justify-between px-6 pointer-events-none opacity-10">
        <div className="w-[1px] h-full bg-ink-primary" />
        <div className="w-[1px] h-full bg-ink-primary" />
        <div className="w-[1px] h-full bg-ink-primary" />
      </div>

      {/* Render Event Color Dots */}
      {renderDots()}

      {/* "Now" Marker on far right edge representing current time window bounds */}
      <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-ink-tertiary/40" />
    </div>
  )
}

export default TimelineRibbon;
