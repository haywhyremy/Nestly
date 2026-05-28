import posthog from 'posthog-js'

export function initAnalytics() {
  if (!import.meta.env.PROD) return

  const key = import.meta.env.VITE_POSTHOG_KEY
  if (!key) {
    console.warn('PostHog key is missing. Analytics will not be initialized.')
    return
  }

  posthog.init(key, {
    api_host: 'https://eu.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: true,
    persistence: 'localStorage'
  })
}

export function identify(userId, properties) {
  if (!import.meta.env.PROD) {
    console.log('[Analytics Dev] Identify:', userId, properties)
    return
  }
  posthog.identify(userId, properties)
}

export function trackEvent(name, properties) {
  if (!import.meta.env.PROD) {
    console.log('[Analytics Dev] Track Event:', name, properties)
    return
  }
  posthog.capture(name, properties)
}

export function setHouseholdGroup(householdId) {
  if (!import.meta.env.PROD) {
    console.log('[Analytics Dev] Set Group (household):', householdId)
    return
  }
  posthog.group('household', householdId)
}
