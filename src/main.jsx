import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App.jsx'
import { initSentry } from './services/sentry'
import { initAnalytics } from './services/analytics'

// Initialize Sentry and PostHog tracking in production before rendering
initSentry()
initAnalytics()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
