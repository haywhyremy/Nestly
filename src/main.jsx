import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App.jsx'
import { initSentry } from './services/sentry'
import { initAnalytics } from './services/analytics'
import { registerSW } from 'virtual:pwa-register'

// Initialize Sentry and PostHog tracking in production before rendering
initSentry()
initAnalytics()

// Register with update callback
const updateSW = registerSW({
  onNeedRefresh() {
    // New content available — will activate on next navigation
    console.log('[SW] New content available, will update on next visit');
  },
  onOfflineReady() {
    console.log('[SW] App is ready for offline use');
  },
  onRegisteredSW(swUrl, registration) {
    // Check for updates every hour
    if (registration) {
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);
    }
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
