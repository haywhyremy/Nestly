import { Outlet } from 'react-router-dom'

export function AppShell() {
  return (
    <div className="max-w-md mx-auto min-h-dvh bg-surface-base relative">
      <Outlet />
    </div>
  )
}
