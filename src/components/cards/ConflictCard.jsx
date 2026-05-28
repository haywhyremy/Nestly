import { AlertCircle } from 'lucide-react'
import { LogEntryCard } from './LogEntryCard'

export function ConflictCard({ event, onTap }) {
  if (!event) return null

  return (
    <div className="border border-signal-conflict rounded-xl overflow-hidden bg-surface-raised/40 select-none animate-fade-in">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      
      {/* Underlying Log Entry Card */}
      <LogEntryCard event={event} onTap={onTap} />
      
      {/* Flagged Duplicate Alert Badge */}
      <div className="flex items-center gap-1.5 px-4 py-1.5 bg-signal-conflict/10 border-t border-signal-conflict/10">
        <AlertCircle size={14} className="text-signal-conflict flex-shrink-0" />
        <span className="text-xs text-signal-conflict font-medium">
          Possible duplicate
        </span>
      </div>
    </div>
  )
}

export default ConflictCard;
