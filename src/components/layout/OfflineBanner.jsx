export function OfflineBanner({ isOnline }) {
  if (isOnline) return null

  return (
    <div className="bg-surface-sunken px-4 py-2 text-center border-b border-surface-sunken/60 select-none animate-fade-in">
      <style>{`
        @keyframes fadeInHeader {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeInHeader 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      <p className="text-xs font-medium text-ink-secondary">
        You're offline — logs are saved and will sync when you reconnect.
      </p>
    </div>
  )
}

export default OfflineBanner;
