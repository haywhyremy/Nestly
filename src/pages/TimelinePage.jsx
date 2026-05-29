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
import { useAuth } from '../context/AuthContext'
import { useSync } from '../hooks/useSync'

import { LogFeedSheet } from '../components/sheets/LogFeedSheet'
import { LogNappySheet } from '../components/sheets/LogNappySheet'
import { LogSleepSheet } from '../components/sheets/LogSleepSheet'
import { ConflictSheet } from '../components/sheets/ConflictSheet'

export default function TimelinePage() {
  const { user } = useAuth()
  const { household } = useHousehold()
  const [activeFilter, setActiveFilter] = useState('all')

  const [editingEvent, setEditingEvent] = useState(null)
  const [editSheetType, setEditSheetType] = useState(null)
  const [conflictEvent, setConflictEvent] = useState(null)
  const [isConflictSheetOpen, setIsConflictSheetOpen] = useState(false)

  const syncState = useSync(household?.id)

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

  const handleCardTap = (event) => {
    if (!user || !event) return

    // Tapping a duplicate flags the Conflict Resolution Overlay
    if (event.conflictStatus === 'pending') {
      setConflictEvent(event)
      setIsConflictSheetOpen(true)
      return
    }

    // Allow editing only if the event was logged by the current user
    if (event.loggedBy === user.id) {
      setEditingEvent(event)
      setEditSheetType(event.eventType)
    } else {
      console.log('Read-only: Entry belongs to partner.')
    }
  }

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
          onClick={syncState.syncNow}
          className="text-ink-tertiary hover:text-ink-secondary active:text-ink-primary transition-colors p-1"
          aria-label="Synchronize data"
          disabled={syncState.isSyncing}
        >
          <RefreshCw size={18} className={syncState.isSyncing ? 'animate-spin' : ''} />
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
          <div className="text-center text-sm text-ink-tertiary py-12">
            Loading...
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center text-sm text-ink-tertiary py-12 font-medium">
            {(() => {
              switch (activeFilter) {
                case 'feed':
                  return 'No feeds logged today'
                case 'nappy':
                  return 'No nappies logged today'
                case 'sleep':
                  return 'No sleep logged today'
                default:
                  return 'Nothing logged today yet'
              }
            })()}
          </div>
        ) : (
          <div className="space-y-3 pb-20">
            {entries.map((event) => {
              const isConflict = event.conflictStatus === 'pending'
              return isConflict ? (
                <ConflictCard
                  key={event.clientId || event.id}
                  event={event}
                  onTap={() => handleCardTap(event)}
                />
              ) : (
                <LogEntryCard
                  key={event.clientId || event.id}
                  event={event}
                  onTap={() => handleCardTap(event)}
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

      {/* Edit Sheet Overlays */}
      <LogFeedSheet
        isOpen={editSheetType === 'feed'}
        onClose={() => {
          setEditingEvent(null)
          setEditSheetType(null)
        }}
        editEvent={editingEvent}
      />

      <LogNappySheet
        isOpen={editSheetType === 'nappy'}
        onClose={() => {
          setEditingEvent(null)
          setEditSheetType(null)
        }}
        editEvent={editingEvent}
      />

      <LogSleepSheet
        isOpen={editSheetType === 'sleep'}
        onClose={() => {
          setEditingEvent(null)
          setEditSheetType(null)
        }}
        editEvent={editingEvent}
      />

      <ConflictSheet
        isOpen={isConflictSheetOpen}
        onClose={() => {
          setConflictEvent(null)
          setIsConflictSheetOpen(false)
        }}
        conflictEvent={conflictEvent}
      />
    </div>
  )
}
