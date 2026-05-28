import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'

import { FilterChips } from '../components/timeline/FilterChips'
import { TimelineRibbon } from '../components/timeline/TimelineRibbon'
import { LogEntryCard } from '../components/cards/LogEntryCard'
import { ConflictCard } from '../components/cards/ConflictCard'
import { GhostButton } from '../components/buttons/GhostButton'
import { useTimeline } from '../hooks/useTimeline'
import { useHousehold } from '../context/HouseholdContext'

export default function TimelinePage() {
  const { household } = useHousehold()
  const [activeFilter, setActiveFilter] = useState('all')

  const { entries, loadMore, hasMore, isLoading } = useTimeline(household?.id, {
    eventType: activeFilter === 'all' ? null : activeFilter,
    pageSize: 20
  })

  // Filter events to represent only those that happened today for the Ribbon graph
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  const todayEvents = entries.filter((e) => {
    if (!e?.eventTime) return false
    const time = new Date(e.eventTime)
    return time >= todayStart && time <= todayEnd
  })

  return (
    <div className="flex flex-col min-h-dvh bg-surface-base select-none">
      {/* Top Bar Header Navigation */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-surface-sunken/40 bg-surface-raised/40">
        <Link
          to="/app"
          className="text-ink-tertiary hover:text-ink-secondary active:text-ink-primary transition-colors p-1"
          aria-label="Go back to glance screen"
        >
          <ChevronLeft size={24} />
        </Link>

        <div className="flex flex-col items-center">
          <span className="text-xs font-semibold text-ink-tertiary uppercase tracking-widest">
            Today
          </span>
          <span className="text-sm font-medium text-ink-primary">
            {format(new Date(), 'EEE, d MMM')}
          </span>
        </div>

        <button
          type="button"
          onClick={() => console.log('sync triggered')}
          className="text-ink-tertiary hover:text-ink-secondary active:text-ink-primary transition-colors p-1"
          aria-label="Synchronize data"
        >
          <RefreshCw size={18} />
        </button>
      </header>

      {/* Visual Timeline Ribbon Chart for Today */}
      <div className="mt-4">
        <TimelineRibbon events={todayEvents} />
      </div>

      {/* Event Category Filter Chips bar */}
      <div className="mt-2">
        <FilterChips
          options={[
            { value: 'all', label: 'All' },
            { value: 'feed', label: 'Feed' },
            { value: 'nappy', label: 'Nappy' },
            { value: 'sleep', label: 'Sleep' }
          ]}
          value={activeFilter}
          onChange={setActiveFilter}
        />
      </div>

      {/* Main Events Feed Section */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {isLoading ? (
          <div className="text-center text-sm text-ink-tertiary py-12 animate-pulse">
            Loading timeline events...
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center text-sm text-ink-tertiary py-12 font-medium">
            Nothing logged today yet
          </div>
        ) : (
          <div className="space-y-3 pb-20">
            {entries.map((event) => {
              const isConflict = event.conflictStatus === 'pending'
              return isConflict ? (
                <ConflictCard
                  key={event.clientId || event.id}
                  event={event}
                  onTap={() => console.log('conflict tap:', event.clientId)}
                />
              ) : (
                <LogEntryCard
                  key={event.clientId || event.id}
                  event={event}
                  onTap={() => console.log('entry tap:', event.clientId)}
                />
              )
            })}

            {hasMore && (
              <div className="pt-2 pb-6">
                <GhostButton onClick={loadMore}>
                  Load more
                </GhostButton>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
