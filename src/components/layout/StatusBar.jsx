import { Link } from 'react-router-dom'
import { RefreshCw, Settings } from 'lucide-react'

export function StatusBar({
  babyName,
  isSyncing,
  pendingCount = 0
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-surface-base select-none border-b border-surface-sunken/40">
      {/* Left side: Baby Name */}
      <span className="text-sm font-semibold text-ink-primary">
        {babyName || 'Baby'}
      </span>

      {/* Right side: Sync status indicator + Settings link */}
      <div className="flex items-center gap-3">
        {isSyncing ? (
          <RefreshCw 
            size={16} 
            className="text-signal-sync animate-spin flex-shrink-0" 
          />
        ) : pendingCount > 0 ? (
          <span className="text-xs text-signal-sync font-medium animate-pulse">
            {pendingCount} pending
          </span>
        ) : null}

        <Link
          to="/app/settings"
          className="text-ink-tertiary hover:text-ink-secondary active:text-ink-primary transition-colors p-1"
          aria-label="Settings"
        >
          <Settings size={18} />
        </Link>
      </div>
    </div>
  )
}

export default StatusBar;
