import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { GhostButton } from '../components/buttons/GhostButton'
import { OfflineBanner } from '../components/layout/OfflineBanner'
import { StatusBar } from '../components/layout/StatusBar'
import { SleepBanner } from '../components/layout/SleepBanner'
import { GlanceCard } from '../components/cards/GlanceCard'
import { EmptyStateCard } from '../components/cards/EmptyStateCard'
import GlanceSkeleton from '../components/cards/GlanceSkeleton'
import { QuickLogRow } from '../components/layout/QuickLogRow'
import { useHousehold } from '../context/HouseholdContext'
import { useAuth } from '../context/AuthContext'
import { useGlanceData } from '../hooks/useGlanceData'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { useSync } from '../hooks/useSync'
import { trackEvent, setHouseholdGroup } from '../services/analytics'
import { useNotificationBadge, updateNotificationBadge } from '../hooks/useNotificationBadge'
import { InstallPromptBanner } from '../components/layout/InstallPromptBanner'
import { useLiveQuery } from 'dexie-react-hooks'
import db from '../db/dexie'
import { LogEntryCard } from '../components/cards/LogEntryCard'

export default function GlancePage() {
  const { user } = useAuth()
  const { household, baby, members = [] } = useHousehold()
  const navigate = useNavigate()
  const [isPartnerBannerDismissed, setIsPartnerBannerDismissed] = useState(false)
  
  const { 
    lastFeed, 
    lastNappy, 
    lastSleep, 
    activeSleep, 
    isLoading 
  } = useGlanceData(household?.id)
  
  const { isOnline } = useOnlineStatus()

  // Core Sync orchestrator hook
  const syncState = useSync(household?.id)

  // Get the 10 most recent entries across all types for this household
  const recentEntries = useLiveQuery(
    async () => {
      if (!household?.id) return [];
      const events = await db.events
        .where('householdId')
        .equals(household.id)
        .filter(e => !e.deletedAt)
        .toArray();
      return events
        .sort((a, b) => new Date(b.eventTime) - new Date(a.eventTime))
        .slice(0, 10);
    },
    [household?.id],
    []
  );

  // Track app opened and group analytics on mount/household resolution
  useEffect(() => {
    if (household?.id) {
      setHouseholdGroup(household.id)
      trackEvent('app_opened', { household_id: household.id })
    }
  }, [household?.id])

  const { isEnabled } = useNotificationBadge()

  // Update notification badge on lastFeed change or periodic tick
  useEffect(() => {
    if (isEnabled && lastFeed) {
      updateNotificationBadge(lastFeed)

      // Periodically update the badge every 60 seconds to keep the elapsed time ticking
      const interval = setInterval(() => {
        updateNotificationBadge(lastFeed)
      }, 60000)

      return () => clearInterval(interval)
    }
  }, [isEnabled, lastFeed])

  const hasEntries = !!(lastFeed || lastNappy || lastSleep || activeSleep)

  return (
    <div className="flex flex-col min-h-dvh bg-[#FBF8F4] dark:bg-[#1A1816] animate-fade-in">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Offline Alert Banner */}
      <OfflineBanner isOnline={isOnline} />

      {/* Sync Status Header Bar */}
      <StatusBar 
        babyName={baby?.name || 'Baby'} 
        isSyncing={syncState.isSyncing} 
        pendingCount={syncState.pendingCount} 
        syncError={syncState.syncError}
      />

      {/* Partner Not Joined Banner */}
      {members.length < 2 && !isPartnerBannerDismissed && (
        <div className="mx-4 mt-2 bg-surface-raised border border-surface-sunken rounded-xl px-4 py-3 flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs text-ink-secondary leading-normal">
              Your partner hasn't joined yet
            </span>
          </div>
          <div className="flex items-center gap-3">
            <GhostButton 
              onClick={() => navigate('/app/settings')}
              className="!py-1.5 !px-3 bg-accent-sage/10 text-accent-sage font-semibold text-xs rounded-lg active:brightness-95 hover:bg-accent-sage/20 transition-all w-auto"
            >
              Invite
            </GhostButton>
            <button 
              onClick={() => setIsPartnerBannerDismissed(true)}
              className="text-ink-tertiary hover:text-ink-primary transition-colors p-1 flex items-center justify-center"
              aria-label="Dismiss banner"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* PWA Install Prompt Banner */}
      <InstallPromptBanner hasLoggedEntry={!!(lastFeed || lastNappy || lastSleep)} />

      {/* Sleep Ongoing Notification Banner */}
      <SleepBanner activeSleep={activeSleep} onTap={() => {}} />

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto w-full max-w-md mx-auto">
        {/* Glance card — compact, at the top, not centered */}
        <div className="px-4 pt-4 pb-2">
          {isLoading ? (
            <GlanceSkeleton />
          ) : hasEntries ? (
            <GlanceCard 
              lastFeed={lastFeed} 
              lastNappy={lastNappy} 
              lastSleep={lastSleep} 
              activeSleep={activeSleep} 
            />
          ) : (
            <EmptyStateCard />
          )}
        </div>

        {/* Divider */}
        <div className="mx-4 border-t border-[#F2EDE6] dark:border-[#242220]" />

        {/* "Recent Activity" header */}
        <div className="px-4 py-3">
          <span className="text-xs font-semibold text-[#1F1B16] dark:text-[#F0ECE6] uppercase tracking-wider">Recent Activity</span>
        </div>

        {/* Recent log entries — same style as timeline */}
        <div className="px-2 pb-4">
          {recentEntries && recentEntries.length > 0 ? (
            <>
              {recentEntries.map((event, index) => (
                <LogEntryCard key={event.clientId || index} event={event} onTap={() => {}} />
              ))}
              
              {/* View more button at the bottom */}
              <Link 
                to="/app/timeline"
                className="block text-center py-4 mt-2 text-sm font-medium text-[#7A9B7E] dark:text-[#8FB89A] hover:underline"
              >
                View more logs →
              </Link>
            </>
          ) : (
            <p className="text-sm text-[#A89F94] dark:text-[#6B6259] text-center py-8">
              No activity yet. Tap below to log your first entry.
            </p>
          )}
        </div>
      </div>

      {/* Quick Logging Row buttons bar */}
      <QuickLogRow />
    </div>
  )
}
