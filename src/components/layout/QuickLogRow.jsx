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
      className="sticky bottom-0 w-full px-4 pb-4 pt-2 bg-[#FBF8F4] dark:bg-[#1A1816] pb-safe border-t border-[#F2EDE6] dark:border-[#131110] z-40"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
    >
      <div className="flex gap-3 max-w-md mx-auto">
        {/* Feed Button */}
        <button
          type="button"
          onClick={() => setIsFeedOpen(true)}
          className="flex-1 h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-medium bg-[#7A9B7E]/15 text-[#7A9B7E] dark:text-[#8FB393] active:brightness-95 hover:bg-[#7A9B7E]/20 transition-all select-none"
        >
          <Droplets size={18} strokeWidth={1.75} />
          <span>Feed</span>
        </button>

        {/* Nappy Button */}
        <button
          type="button"
          onClick={() => setIsNappyOpen(true)}
          className="flex-1 h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-medium bg-[#C49B7A]/15 text-[#C49B7A] dark:text-[#D4AB8A] active:brightness-95 hover:bg-[#C49B7A]/20 transition-all select-none"
        >
          <Circle size={18} strokeWidth={1.75} />
          <span>Nappy</span>
        </button>

        {/* Sleep Button */}
        <button
          type="button"
          onClick={() => setIsSleepOpen(true)}
          className="flex-1 h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-medium bg-[#9B7E9B]/15 text-[#9B7E9B] dark:text-[#B399B3] active:brightness-95 hover:bg-[#9B7E9B]/20 transition-all select-none"
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
