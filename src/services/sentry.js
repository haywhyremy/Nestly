import { init, browserTracingIntegration } from '@sentry/react'

export function initSentry() {
  if (!import.meta.env.PROD) return

  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (!dsn) {
    console.warn('Sentry DSN is missing. Error tracking will not be initialized.')
    return
  }

  init({
    dsn,
    integrations: [browserTracingIntegration()],
    tracesSampleRate: 0.1,
    environment: import.meta.env.MODE
  })
}
