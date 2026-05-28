import * as Sentry from '@sentry/react'

export function initSentry() {
  if (!import.meta.env.PROD) return

  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (!dsn) {
    console.warn('Sentry DSN is missing. Error tracking will not be initialized.')
    return
  }

  Sentry.init({
    dsn,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.1,
    environment: import.meta.env.MODE
  })
}
