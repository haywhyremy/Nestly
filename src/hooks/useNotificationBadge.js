import { useState } from 'react'

function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function useNotificationBadge() {
  const isSupported = typeof window !== 'undefined' && 'Notification' in window
  
  const [isEnabled, setIsEnabled] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('nestly-notification-badge') === 'true'
  })

  const enable = async () => {
    if (!isSupported) return false
    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        localStorage.setItem('nestly-notification-badge', 'true')
        setIsEnabled(true)
        return true
      }
    } catch (err) {
      console.error('Failed to request notification permission:', err)
    }
    return false
  }

  const disable = () => {
    localStorage.setItem('nestly-notification-badge', 'false')
    setIsEnabled(false)
  }

  return { isSupported, isEnabled, enable, disable }
}

export function updateNotificationBadge(lastFeed) {
  if (typeof window === 'undefined') return
  const isSupported = 'Notification' in window
  if (!isSupported) return

  const isEnabled = localStorage.getItem('nestly-notification-badge') === 'true'
  if (!isEnabled || Notification.permission !== 'granted' || !lastFeed) return

  try {
    const seconds = Math.floor((new Date() - new Date(lastFeed.eventTime)) / 1000)
    let timeSince = ''
    if (seconds < 60) {
      timeSince = 'Less than 1m'
    } else {
      const minutes = Math.floor(seconds / 60)
      if (minutes < 60) {
        timeSince = `${minutes}m`
      } else {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        timeSince = mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
      }
    }

    let details = ''
    if (lastFeed.eventSubtype === 'bottle') {
      details = `${lastFeed.metadata?.volume_ml || 0}ml`
    } else if (lastFeed.eventSubtype === 'breast') {
      const side = capitalize(lastFeed.metadata?.side || '')
      const duration = lastFeed.metadata?.duration_minutes || 0
      details = `${side} · ${duration}m`
    }

    const body = `Last feed: ${timeSince} ago · ${details}`

    new Notification('Nestly', {
      body,
      tag: 'nestly-badge',
      renotify: false,
      silent: true,
      icon: '/icons/icon-192.png'
    })
  } catch (err) {
    console.error('Failed to update notification badge:', err)
  }
}
