import { useState, useEffect } from 'react'
import { Smartphone } from 'lucide-react'
import { useInstallPrompt } from '../../hooks/useInstallPrompt'
import { SecondaryButton } from '../buttons/SecondaryButton'
import { GhostButton } from '../buttons/GhostButton'
import { Sheet } from '../sheets/Sheet'
import { trackEvent } from '../../services/analytics'

export function InstallPromptBanner({ hasLoggedEntry = false }) {
  const { canPrompt, platform, promptInstall, dismiss } = useInstallPrompt(hasLoggedEntry)
  const [showIOSGuide, setShowIOSGuide] = useState(false)

  // Track analytics event when the banner successfully appears
  useEffect(() => {
    if (canPrompt && hasLoggedEntry) {
      trackEvent('pwa_install_prompted', { platform })
    }
  }, [canPrompt, hasLoggedEntry, platform])

  const handleShowMeHow = async () => {
    if (platform === 'ios') {
      setShowIOSGuide(true)
    } else {
      await promptInstall()
    }
  }

  if (!canPrompt || !hasLoggedEntry) return null

  return (
    <>
      <div className="mx-4 mt-2 bg-surface-raised border border-surface-sunken rounded-2xl p-4 shadow-sm animate-fade-in flex flex-col gap-3">
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}</style>

        {/* Row 1: Header/Prompt copy */}
        <div className="flex items-start">
          <div className="p-2 bg-accent-sage/10 rounded-xl text-accent-sage mt-0.5 flex-shrink-0">
            <Smartphone size={20} />
          </div>
          <span className="text-sm text-ink-primary font-medium ml-3 leading-normal">
            Add Nestly to your home screen for quick access
          </span>
        </div>

        {/* Row 2: Action buttons stacked horizontally */}
        <div className="flex gap-2">
          <SecondaryButton 
            onClick={handleShowMeHow} 
            className="flex-1 !h-11 text-sm font-semibold rounded-xl bg-accent-sage/10 text-accent-sage hover:bg-accent-sage/20 active:brightness-95 transition-all"
          >
            Show me how
          </SecondaryButton>
          <GhostButton 
            onClick={dismiss} 
            className="flex-1 !py-2.5 text-xs text-ink-tertiary font-medium bg-transparent hover:text-ink-secondary active:text-ink-primary transition-all text-center flex items-center justify-center"
          >
            Maybe later
          </GhostButton>
        </div>
      </div>

      {/* iOS Manual Installation Guide Overlay */}
      <Sheet
        isOpen={showIOSGuide}
        onClose={() => setShowIOSGuide(false)}
        title="Add to Home Screen"
        snapPoints={[0.55]}
        footer={
          <GhostButton 
            onClick={() => setShowIOSGuide(false)}
            className="w-full !py-3 text-sm font-semibold text-accent-sage hover:text-accent-sage hover:bg-accent-sage/5 rounded-xl transition-all"
          >
            Got it
          </GhostButton>
        }
      >
        <div className="space-y-6 mt-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-accent-sage/10 text-accent-sage font-bold flex items-center justify-center flex-shrink-0 text-sm">
              1
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-ink-primary">Tap the Share button</h4>
              <p className="text-xs text-ink-secondary mt-0.5 leading-relaxed">
                Tap the Safari toolbar Share icon at the bottom of the screen.
              </p>
              <div className="mt-2.5 text-accent-sage flex items-center justify-start">
                <div className="p-2 bg-accent-sage/5 rounded-lg border border-accent-sage/10">
                  <svg width="20" height="20" viewBox="0 0 20 20" className="stroke-current fill-none">
                    <path d="M10 2v10M6 6l4-4 4 4M4 10v6a2 2 0 002 2h8a2 2 0 002-2v-6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-accent-sage/10 text-accent-sage font-bold flex items-center justify-center flex-shrink-0 text-sm">
              2
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-ink-primary">Scroll down and tap 'Add to Home Screen'</h4>
              <p className="text-xs text-ink-secondary mt-0.5 leading-relaxed">
                Scroll through the actions list and select Add to Home Screen.
              </p>
            </div>
          </div>
        </div>
      </Sheet>
    </>
  )
}

export default InstallPromptBanner;
