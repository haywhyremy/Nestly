import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { HouseholdProvider } from './context/HouseholdContext'
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
      <HouseholdProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/join/:code" element={<JoinHouseholdPage />} />
            <Route path="/onboarding" element={<OnboardingFlow />} />

            {/* Protected Route Gate */}
            <Route element={<AuthGuard />}>
              {/* Authenticated App Shell */}
              <Route path="/app" element={<AppShell />}>
                <Route index element={<GlancePage />} />
                <Route path="timeline" element={<TimelinePage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </HouseholdProvider>
    </AuthProvider>
  );
}

export default App;
