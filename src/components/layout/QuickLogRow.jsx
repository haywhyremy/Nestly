import { useState } from 'react'
import { Droplets, Circle, Moon } from 'lucide-react'
import { LogFeedSheet } from '../sheets/LogFeedSheet'
import { LogNappySheet } from '../sheets/LogNappySheet'
import { LogSleepSheet } from '../sheets/LogSleepSheet'
import { useGlanceData } from '../../hooks/useGlanceData'
import { useHousehold } from '../../context/HouseholdContext'

export function QuickLogRow() {
  const { household } = useHousehold()
  // Guard: if no household yet, render buttons but don't try to query
  const { activeSleep } = useGlanceData(household?.id)

  const [isFeedOpen, setIsFeedOpen] = useState(false)
  const [isNappyOpen, setIsNappyOpen] = useState(false)
  const [isSleepOpen, setIsSleepOpen] = useState(false)

  return (
    <div
      className="sticky bottom-0 w-full px-4 pb-4 pt-2 bg-surface-base pb-safe border-t border-surface-sunken z-40"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
    >
      <div className="flex gap-3 max-w-md mx-auto">
        {/* Feed Button */}
        <button
          type="button"
          onClick={() => setIsFeedOpen(true)}
          className="flex-1 h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-medium bg-accent-sage/15 text-accent-sage active:brightness-95 hover:bg-accent-sage/20 transition-all select-none"
        >
          <Droplets size={18} strokeWidth={1.75} />
          <span>Feed</span>
        </button>

        {/* Nappy Button */}
        <button
          type="button"
          onClick={() => setIsNappyOpen(true)}
          className="flex-1 h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-medium bg-accent-clay/15 text-accent-clay active:brightness-95 hover:bg-accent-clay/20 transition-all select-none"
        >
          <Circle size={18} strokeWidth={1.75} />
          <span>Nappy</span>
        </button>

        {/* Sleep Button */}
        <button
          type="button"
          onClick={() => setIsSleepOpen(true)}
          className="flex-1 h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-medium bg-accent-dusk/15 text-accent-dusk active:brightness-95 hover:bg-accent-dusk/20 transition-all select-none"
        >
          <Moon size={18} strokeWidth={1.75} />
          <span>{activeSleep ? 'End sleep' : 'Sleep'}</span>
        </button>
      </div>

      {/* Sheet Components */}
      <LogFeedSheet
        isOpen={isFeedOpen}
        onClose={() => setIsFeedOpen(false)}
      />
      <LogNappySheet
        isOpen={isNappyOpen}
        onClose={() => setIsNappyOpen(false)}
      />
      <LogSleepSheet
        isOpen={isSleepOpen}
        onClose={() => setIsSleepOpen(false)}
        activeSleep={activeSleep}
      />
    </div>
  )
}

export default QuickLogRow;
