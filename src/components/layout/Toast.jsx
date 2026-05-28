import { useEffect } from 'react'

export function Toast({ message, isVisible, onClose }) {
  useEffect(() => {
    if (isVisible && onClose) {
      const timer = setTimeout(() => {
        onClose()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-ink-primary text-surface-base text-sm px-4 py-3 rounded-xl shadow-lg z-50 animate-fade-in transition-opacity duration-300">
      <style>{`
        @keyframes fadeInToast {
          from { opacity: 0; transform: translate(-50%, 10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fade-in {
          animation: fadeInToast 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      {message}
    </div>
  )
}

export default Toast;
