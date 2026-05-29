import { useState, useEffect, useRef } from 'react'
import { trackEvent } from '../services/analytics'

export function useInstallPrompt(hasLoggedEntry = false) {
  const [canPrompt, setCanPrompt] = useState(false)
  const [platform, setPlatform] = useState('other')
  const deferredPrompt = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // 1. Standalone check
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    if (isStandalone) {
      setCanPrompt(false)
      return
    }

    // 2. Dismissed check
    const isDismissed = localStorage.getItem('nestly-install-dismissed') === 'true'
    if (isDismissed) {
      setCanPrompt(false)
      return
    }

    // 3. Platform detection
    const ua = window.navigator.userAgent
    const isIOS = /iPhone|iPad|iPod/.test(ua) && /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|mercury/.test(ua)
    
    if (isIOS) {
      setPlatform('ios')
    } else if (deferredPrompt.current) {
      setPlatform('android')
    } else {
      setPlatform('other')
    }

    // 4. Update canPrompt based on checks + hasLoggedEntry
    setCanPrompt(!isStandalone && !isDismissed && hasLoggedEntry)
  }, [hasLoggedEntry])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      deferredPrompt.current = e
      setPlatform('android')
      
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isDismissed = localStorage.getItem('nestly-install-dismissed') === 'true'
      setCanPrompt(!isStandalone && !isDismissed && hasLoggedEntry)
    }

    const handleAppInstalled = () => {
      setCanPrompt(false)
      trackEvent('pwa_installed', { platform })
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [hasLoggedEntry, platform])

  const promptInstall = async () => {
    if (platform === 'android' && deferredPrompt.current) {
      try {
        deferredPrompt.current.prompt()
        const { outcome } = await deferredPrompt.current.userChoice
        if (outcome === 'accepted') {
          trackEvent('pwa_installed', { platform: 'android' })
          setCanPrompt(false)
        }
      } catch (err) {
        console.error('PWA install prompt failed:', err)
      }
      deferredPrompt.current = null
    }
  };

  const dismiss = () => {
    localStorage.setItem('nestly-install-dismissed', 'true')
    setCanPrompt(false)
    trackEvent('pwa_install_dismissed')
  };

  return { canPrompt, platform, promptInstall, dismiss }
}
