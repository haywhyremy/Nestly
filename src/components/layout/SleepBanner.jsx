import { useEffect, useState } from 'react'
import { formatTimeSince } from '../../utils/time'

export function SleepBanner({ activeSleep, onTap }) {
  const [tick, setTick] = useState(0)

  // Force re-render every 60 seconds to keep the ongoing duration label current
  useEffect(() => {
    if (!activeSleep) return
    const interval = setInterval(() => {
      setTick((t) => t + 1)
    }, 60000)
    return () => clearInterval(interval)
  }, [activeSleep])

  if (!activeSleep) return null

  const duration = formatTimeSince(activeSleep.eventTime)
  const name = activeSleep.loggedByName || 'Parent'

  return (
    <div
      onClick={onTap}
      className="bg-accent-dusk/10 rounded-xl px-4 py-3 mx-4 mt-2 cursor-pointer active:brightness-95 hover:bg-accent-dusk/15 transition-all select-none animate-fade-in"
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      <p className="text-sm font-medium text-ink-secondary">
        Sleep ongoing · {duration} · started by {name}
      </p>
    </div>
  )
}

export default SleepBanner;
