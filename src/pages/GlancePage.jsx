import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { QuickLogRow } from '../components/layout/QuickLogRow'
import { useHousehold } from '../context/HouseholdContext'
import { useAuth } from '../context/AuthContext'
import { trackEvent, setHouseholdGroup } from '../services/analytics'

export default function GlancePage() {
  const { user } = useAuth()
  const { household, baby } = useHousehold()

  // Track app opened and group analytics on mount/household resolution
  useEffect(() => {
    if (household?.id) {
      setHouseholdGroup(household.id)
      trackEvent('app_opened', { household_id: household.id })
    }
  }, [household?.id])

  return (
    <div className="flex flex-col min-h-dvh bg-surface-base animate-fade-in">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-semibold text-ink-primary">
          {baby?.name || 'Baby'}
        </h1>
        <p className="text-sm text-ink-tertiary mt-1">
          Tap below to log a feed, nappy, or sleep
        </p>
      </main>

      <div className="text-center py-2">
        <Link 
          to="/app/timeline" 
          className="text-xs font-medium text-ink-tertiary tracking-wide hover:text-ink-secondary active:text-ink-primary transition-colors"
        >
          View today's timeline →
        </Link>
      </div>

      <QuickLogRow />
    </div>
  )
}
