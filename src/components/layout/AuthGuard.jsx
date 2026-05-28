import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useHousehold } from '../../context/HouseholdContext'

export function AuthGuard() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { hasHousehold, isLoading: householdLoading } = useHousehold()
  const location = useLocation()

  if (authLoading || (isAuthenticated && householdLoading)) {
    return (
      <div className="bg-surface-base min-h-dvh flex items-center justify-center">
        <div className="text-ink-tertiary text-sm">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  // Redirect to onboarding if authenticated but has no household
  if (!hasHousehold && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}
