import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AuthGuard } from './components/layout/AuthGuard'
import { AppShell } from './components/layout/AppShell'

// Page Components
import LandingPage from './pages/LandingPage'
import JoinHouseholdPage from './pages/JoinHouseholdPage'
import OnboardingFlow from './pages/OnboardingFlow'
import GlancePage from './pages/GlancePage'
import TimelinePage from './pages/TimelinePage'
import SettingsPage from './pages/SettingsPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/join/:code" element={<JoinHouseholdPage />} />

          {/* Protected Route Gate */}
          <Route element={<AuthGuard />}>
            <Route path="/onboarding" element={<OnboardingFlow />} />

            {/* Authenticated App Shell */}
            <Route element={<AppShell />}>
              <Route path="/app" element={<GlancePage />} />
              <Route path="/app/timeline" element={<TimelinePage />} />
              <Route path="/app/settings" element={<SettingsPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
