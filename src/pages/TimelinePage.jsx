import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { format, isToday } from 'date-fns'

import { FilterChips } from '../components/timeline/FilterChips'
import { TimelineRibbon } from '../components/timeline/TimelineRibbon'
import { LogEntryCard } from '../components/cards/LogEntryCard'
import { ConflictCard } from '../components/cards/ConflictCard'
import { GhostButton } from '../components/buttons/GhostButton'
import { useTimeline } from '../hooks/useTimeline'
import { useHousehold } from '../context/HouseholdContext'
import { useAuth } from '../context/AuthContext'
import { useSync } from '../hooks/useSync'
import { trackEvent } from '../services/analytics'

import { LogFeedSheet } from '../components/sheets/LogFeedSheet'
import { LogNappySheet } from '../components/sheets/LogNappySheet'
import { LogSleepSheet } from '../components/sheets/LogSleepSheet'
import { ConflictSheet } from '../components/sheets/ConflictSheet'

export default function TimelinePage() {
  const { user } = useAuth()
  const { household } = useHousehold()
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedDate, setSelectedDate] = useState(new Date())

  const [editingEvent, setEditingEvent] = useState(null)
  const [editSheetType, setEditSheetType] = useState(null)
  const [conflictEvent, setConflictEvent] = useState(null)
  const [isConflictSheetOpen, setIsConflictSheetOpen] = useState(false)

  const syncState = useSync(household?.id)

  const { entries, loadMore, hasMore, isLoading } = useTimeline(household?.id, {
    eventType: activeFilter === 'all' ? null : activeFilter,
    pageSize: 20,
    selectedDate: selectedDate
  })

  useEffect(() => {
    if (household?.id) {
      trackEvent('timeline_viewed', { household_id: household.id })
    }
  }, [household?.id])

  // Filter events to represent only those that happened on the selected date for the Ribbon graph
  const dayStart = new Date(selectedDate)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(selectedDate)
  dayEnd.setHours(23, 59, 59, 999)

  const selectedDateEvents = entries.filter((e) => {
    if (!e?.eventTime) return false
    const time = new Date(e.eventTime)
    return time >= dayStart && time <= dayEnd
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

        <h1 className="text-base font-semibold text-ink-primary">
          Timeline
        </h1>

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

      {/* Date Navigator */}
      <div className="flex items-center justify-between px-4 py-3 bg-surface-base border-b border-surface-sunken/20">
        {/* Previous day */}
        <button
          onClick={() => setSelectedDate(prev => {
            const d = new Date(prev)
            d.setDate(d.getDate() - 1)
            return d
          })}
          className="w-10 h-10 rounded-full bg-[#F2EDE6] dark:bg-[#242220] flex items-center justify-center active:brightness-95 transition-colors"
          aria-label="Previous day"
        >
          <ChevronLeft size={18} className="text-[#1F1B16] dark:text-[#F0ECE6]" />
        </button>

        {/* Current date display */}
        <button
          onClick={() => setSelectedDate(new Date())}
          className="text-center focus:outline-none"
        >
          <p className="text-sm font-semibold text-[#1F1B16] dark:text-[#F0ECE6]">
            {isToday(selectedDate) ? 'Today' : format(selectedDate, 'EEEE')}
          </p>
          <p className="text-xs text-[#6B6259] dark:text-[#9C9C94] mt-0.5">
            {format(selectedDate, 'd MMM yyyy')}
          </p>
        </button>

        {/* Next day — disabled if already on today */}
        <button
          onClick={() => setSelectedDate(prev => {
            const d = new Date(prev)
            d.setDate(d.getDate() + 1)
            return d
          })}
          disabled={isToday(selectedDate)}
          className="w-10 h-10 rounded-full bg-[#F2EDE6] dark:bg-[#242220] flex items-center justify-center active:brightness-95 transition-colors disabled:opacity-30"
          aria-label="Next day"
        >
          <ChevronRight size={18} className="text-[#1F1B16] dark:text-[#F0ECE6]" />
        </button>
      </div>

      {/* Visual Timeline Ribbon Chart for Selected Date */}
      <div className="mt-4">
        <TimelineRibbon events={selectedDateEvents} />
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
              if (isToday(selectedDate)) {
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
              } else {
                const formattedDate = format(selectedDate, 'd MMM')
                switch (activeFilter) {
                  case 'feed':
                    return `No feeds on ${formattedDate}`
                  case 'nappy':
                    return `No nappies on ${formattedDate}`
                  case 'sleep':
                    return `No sleep on ${formattedDate}`
                  default:
                    return `Nothing logged on ${formattedDate}`
                }
              }
            })()}
          </div>
        ) : (
          <div className="space-y-3 pb-20">
            {entries.map((event, index) => {
              const isConflict = event.conflictStatus === 'pending'
              const keyVal = event.clientId || event.id || `timeline-card-${index}`;
              return isConflict ? (
                <ConflictCard
                  key={keyVal}
                  event={event}
                  onTap={() => handleCardTap(event)}
                />
              ) : (
                <LogEntryCard
                  key={keyVal}
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
