import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useHousehold } from '../context/HouseholdContext'
import { useTheme } from '../context/ThemeContext'
import { useSync } from '../hooks/useSync'
import { SegmentedToggle } from '../components/inputs/SegmentedToggle'
import { PrimaryButton } from '../components/buttons/PrimaryButton'
import { DestructiveButton } from '../components/buttons/DestructiveButton'
import { SecondaryButton } from '../components/buttons/SecondaryButton'
import { GhostButton } from '../components/buttons/GhostButton'
import { createInvite, updateProfile } from '../db/repositories'
import { exportToCSV } from '../utils/csvExport'
import db from '../db/dexie'
import { supabase } from '../services/supabase'
import { useNotificationBadge } from '../hooks/useNotificationBadge'
import { trackEvent } from '../services/analytics'
import { rehydrateFromServer } from '../db/syncQueue'

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const { household, baby, members, myProfile, refreshHousehold } = useHousehold()
  const { theme, setTheme } = useTheme()
  const syncState = useSync(household?.id)
  const navigate = useNavigate()
  const { isSupported, isEnabled, enable, disable } = useNotificationBadge()

  // Local state for profile form values
  const [displayName, setDisplayName] = useState('')
  const [displayLabel, setDisplayLabel] = useState('')
  const [displayNameError, setDisplayNameError] = useState('')
  
  // Local state for invitation code generation
  const [settingsInviteCode, setSettingsInviteCode] = useState('')
  const [settingsInviteLoading, setSettingsInviteLoading] = useState(false)
  const [settingsInviteCopied, setSettingsInviteCopied] = useState(false)
  
  // Local state for relative sync time
  const [relativeTime, setRelativeTime] = useState('Never')

  // Local state for CSV data export
  const [exportStatus, setExportStatus] = useState(null)
  const [exportError, setExportError] = useState('')

  const handleExportCSV = async () => {
    if (!household?.id) return
    setExportStatus('exporting')
    setExportError('')
    try {
      const count = await exportToCSV(household.id)
      trackEvent('csv_exported', { household_id: household.id, entry_count: count })
      setExportStatus('done')
      setTimeout(() => {
        setExportStatus(null)
      }, 2000)
    } catch (err) {
      console.error('Failed to export data:', err)
      setExportStatus('error')
      setExportError(err.message || 'Export failed')
    }
  }

  // Set profile form inputs when profile context finishes loading
  useEffect(() => {
    if (myProfile) {
      setDisplayName(myProfile.displayName || myProfile.display_name || '')
      setDisplayLabel(myProfile.displayLabel || myProfile.display_label || '')
    }
  }, [myProfile])

  // Real-time ticking relative time calculation
  useEffect(() => {
    const updateTime = () => {
      if (!syncState.lastSynced) {
        setRelativeTime('Never')
        return
      }
      const seconds = Math.floor((new Date() - syncState.lastSynced) / 1000)
      if (seconds < 5) {
        setRelativeTime('Just now')
      } else if (seconds < 60) {
        setRelativeTime(`${seconds}s ago`)
      } else {
        const minutes = Math.floor(seconds / 60)
        if (minutes < 60) {
          setRelativeTime(`${minutes}m ago`)
        } else {
          const hours = Math.floor(minutes / 60)
          if (hours < 24) {
            setRelativeTime(`${hours}h ago`)
          } else {
            setRelativeTime(syncState.lastSynced.toLocaleTimeString())
          }
        }
      }
    }

    updateTime()
    const interval = setInterval(updateTime, 5000)
    return () => clearInterval(interval)
  }, [syncState.lastSynced])

  // Profile Auto-saves on blur event
  const handleSaveProfile = async (field, value) => {
    if (!user?.id || !myProfile) return
    
    const cleanedVal = value.trim()
    
    if (field === 'displayName') {
      if (!cleanedVal) {
        setDisplayNameError("Name can't be empty")
        return
      }
      setDisplayNameError('')
    }
    
    const originalVal = field === 'displayName'
      ? (myProfile.displayName || myProfile.display_name || '')
      : (myProfile.displayLabel || myProfile.display_label || '')

    if (cleanedVal === originalVal) return

    try {
      const updates = field === 'displayName'
        ? { displayName: cleanedVal, displayLabel }
        : { displayName, displayLabel: cleanedVal }

      await updateProfile(user.id, updates)
      await refreshHousehold()
    } catch (error) {
      console.error('Failed to save profile changes:', error)
    }
  }

  // Generate invite code and invoke navigator.share if supported
  const handleSettingsInvite = async () => {
    if (!household?.id || !user?.id) return
    setSettingsInviteLoading(true)
    try {
      const invite = await createInvite(household.id, user.id)
      setSettingsInviteCode(invite.code)
    } catch (err) {
      console.error('Failed to generate settings invite code:', err)
    } finally {
      setSettingsInviteLoading(false)
    }
  }

  // Fallback and share invite
  const handleSettingsShare = async () => {
    if (!settingsInviteCode) return
    const inviteUrl = `${window.location.origin}/join/${settingsInviteCode}`
    const shareData = {
      title: 'Join my household on Nestly',
      text: 'Track our baby together',
      url: inviteUrl
    }

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
        return
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Web Share API failed:', err)
        } else {
          return
        }
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setSettingsInviteCopied(true)
      setTimeout(() => setSettingsInviteCopied(false), 2000)
    } catch (err) {
      console.error('Clipboard copy failed:', err)
    }
  }

  const handleSignOut = async () => {
    if (!window.confirm('Sign out of Nestly?')) return
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Failed to sign out session:', error)
    }
  }

  // Local state for account deletion
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const handleConfirmedDelete = async () => {
    if (deleteInput !== 'DELETE') return
    setIsDeleting(true)
    setDeleteError(null)
    try {
      const { error } = await supabase.functions.invoke('delete-account', { method: 'POST' })
      if (error) throw error

      await db.delete()
      await signOut()
      navigate('/')
    } catch (err) {
      console.error('Failed to delete account:', err)
      setDeleteError(err.message || 'Account deletion failed. Please try again.')
      setIsDeleting(false)
    }
  }

  const themeOptions = [
    { value: 'system', label: 'System' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' }
  ]

  return (
    <div className="flex flex-col min-h-dvh bg-surface-base pb-safe pb-8 animate-fade-in">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Header Bar */}
      <header className="flex items-center gap-2 px-4 py-3 border-b border-surface-sunken sticky top-0 bg-surface-base z-10 select-none">
        <Link to="/app" aria-label="Go back to glance screen" className="p-1 -ml-1 text-ink-primary hover:text-ink-secondary transition-colors flex items-center justify-center">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-lg font-semibold text-ink-primary">
          Settings
        </h1>
      </header>

      <main className="flex-1 space-y-2 max-w-md mx-auto w-full">
        {/* Section 1 — Household */}
        <div className="text-xs font-medium text-ink-tertiary uppercase tracking-wider px-4 pt-6 pb-2">
          Household
        </div>
        <div className="bg-surface-raised rounded-xl mx-4 divide-y divide-surface-sunken overflow-hidden shadow-sm">
          <div className="px-4 py-3 flex items-center justify-between text-sm">
            <span className="text-sm text-ink-primary">Baby</span>
            <span className="text-sm text-ink-secondary font-semibold">{baby?.name || 'Loading baby details...'}</span>
          </div>
          
          <div className="px-4 py-3 flex flex-col items-start gap-2.5">
            <span className="text-sm text-ink-primary">Members</span>
            <div className="w-full space-y-2">
              {members.map((member) => (
                <div key={member.id} className="flex justify-between items-center text-sm">
                  <span className="text-sm text-ink-secondary font-semibold">
                    {member.profiles?.display_name || member.profiles?.displayName || 'Unnamed Carer'}
                  </span>
                  <span className="text-xs text-ink-tertiary font-medium bg-surface-sunken px-2 py-0.5 rounded-full">
                    {member.profiles?.display_label || member.profiles?.displayLabel || (member.role === 'creator' ? 'Owner' : 'Carer')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {members.length < 2 && (
            <div className="px-4 py-3.5 flex flex-col gap-3">
              <SecondaryButton 
                onClick={handleSettingsInvite} 
                disabled={settingsInviteLoading}
              >
                {settingsInviteLoading ? 'Generating link...' : 'Invite partner'}
              </SecondaryButton>
              {settingsInviteCode && (
                <div className="flex flex-col gap-3">
                  <div className="bg-surface-sunken border border-surface-sunken rounded-xl p-4 mt-1">
                    <span className="block text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-2">Invite URL</span>
                    <p className="text-sm font-mono text-ink-primary break-all select-all">
                      {`${window.location.origin}/join/${settingsInviteCode}`}
                    </p>
                  </div>
                  <PrimaryButton
                    onClick={handleSettingsShare}
                    disabled={settingsInviteLoading || !settingsInviteCode}
                  >
                    {settingsInviteCopied ? 'Copied URL!' : 'Share invite'}
                  </PrimaryButton>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section 2 — Profile */}
        <div className="text-xs font-medium text-ink-tertiary uppercase tracking-wider px-4 pt-6 pb-2">
          Profile
        </div>
        <div className="bg-surface-raised rounded-xl mx-4 divide-y divide-surface-sunken overflow-hidden shadow-sm">
          <div className="px-4 py-3 flex flex-col gap-1.5 items-start">
            <label htmlFor="displayNameInput" className="text-sm text-ink-primary">
              Display name
            </label>
            <input
              id="displayNameInput"
              type="text"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value)
                if (e.target.value.trim()) {
                  setDisplayNameError('')
                }
              }}
              onBlur={() => handleSaveProfile('displayName', displayName)}
              placeholder="e.g. Papa, Mum"
              className="bg-surface-sunken rounded-lg px-3 py-2 text-sm text-ink-primary border-none w-full focus:outline-none focus:ring-1 focus:ring-accent-sage/30 transition-shadow"
            />
            {displayNameError && (
              <span className="text-xs text-accent-coral mt-1">
                {displayNameError}
              </span>
            )}
          </div>
          <div className="px-4 py-3 flex flex-col gap-1.5 items-start">
            <label htmlFor="displayLabelInput" className="text-sm text-ink-primary">
              Display label
            </label>
            <input
              id="displayLabelInput"
              type="text"
              maxLength={12}
              value={displayLabel}
              onChange={(e) => setDisplayLabel(e.target.value)}
              onBlur={() => handleSaveProfile('displayLabel', displayLabel)}
              placeholder="e.g. Dad, Mama"
              className="bg-surface-sunken rounded-lg px-3 py-2 text-sm text-ink-primary border-none w-full focus:outline-none focus:ring-1 focus:ring-accent-sage/30 transition-shadow"
            />
            <span className="text-xs text-ink-tertiary self-end mt-1">
              {displayLabel.length}/12
            </span>
          </div>
        </div>

        {/* Section 3 — Appearance */}
        <div className="text-xs font-medium text-ink-tertiary uppercase tracking-wider px-4 pt-6 pb-2">
          Appearance
        </div>
        <div className="bg-surface-raised rounded-xl mx-4 overflow-hidden shadow-sm">
          <div className="px-4 py-3">
            <SegmentedToggle 
              options={themeOptions}
              value={theme}
              onChange={setTheme}
              accentColor="bg-accent-sage"
            />
          </div>
        </div>

        {/* Section — Notifications */}
        {isSupported && (
          <>
            <div className="text-xs font-medium text-ink-tertiary uppercase tracking-wider px-4 pt-6 pb-2">
              Notifications
            </div>
            <div className="bg-surface-raised rounded-xl mx-4 overflow-hidden shadow-sm p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center text-sm font-medium text-ink-secondary mb-1">
                <span>Show last feed in notifications</span>
              </div>
              <SegmentedToggle
                options={[
                  { value: 'on', label: 'On' },
                  { value: 'off', label: 'Off' }
                ]}
                value={isEnabled ? 'on' : 'off'}
                onChange={(val) => {
                  if (val === 'on') {
                    enable()
                  } else {
                    disable()
                  }
                }}
                accentColor="bg-accent-sage"
              />
              <span className="text-xs text-ink-tertiary leading-normal mt-1">
                Shows a persistent notification with the last feed time. Works best on Android.
              </span>
            </div>
          </>
        )}

        {/* Section 4 — Data */}
        <div className="text-xs font-medium text-ink-tertiary uppercase tracking-wider px-4 pt-6 pb-2">
          Data & Sync
        </div>
        <div className="bg-surface-raised rounded-xl mx-4 divide-y divide-surface-sunken overflow-hidden shadow-sm">
          <div className="px-4 py-3 flex items-center justify-between text-sm">
            <span className="text-sm text-ink-primary">Last synced</span>
            <span className="text-sm text-ink-secondary font-semibold">{relativeTime}</span>
          </div>
          <div className="px-4 py-3 flex items-center justify-between text-sm">
            <span className="text-sm text-ink-primary">Pending uploads</span>
            <span className="text-sm text-ink-secondary font-semibold">{syncState.pendingCount}</span>
          </div>
          <div className="px-4 py-3.5 flex flex-col gap-3">
            <SecondaryButton 
              onClick={() => syncState.syncNow()}
              disabled={syncState.isSyncing}
            >
              {syncState.isSyncing ? 'Syncing...' : 'Sync now'}
            </SecondaryButton>

            <SecondaryButton
              onClick={async () => {
                if (!household?.id) return
                const confirmForce = window.confirm("Force sync from server? This will download all events and overwrite local cache.")
                if (!confirmForce) return
                try {
                  const count = await rehydrateFromServer(household.id)
                  alert(`Rehydrated ${count} events`)
                  window.location.reload()
                } catch (err) {
                  console.error('Force Sync failed:', err)
                  alert('Force Sync failed: ' + err.message)
                }
              }}
            >
              Force Sync
            </SecondaryButton>
            
            <SecondaryButton
              onClick={handleExportCSV}
              disabled={exportStatus === 'exporting' || !household?.id}
            >
              {exportStatus === 'exporting' ? 'Exporting...' : 'Export all data as CSV'}
            </SecondaryButton>
            
            {exportStatus === 'done' && (
              <div className="text-xs text-accent-sage font-medium text-center animate-pulse">
                Exported!
              </div>
            )}
            
            {exportStatus === 'error' && (
              <div className="text-xs text-accent-coral font-medium text-center">
                {exportError || 'Export failed'}
              </div>
            )}
          </div>
        </div>

        {/* Section 5 — About */}
        <div className="text-xs font-medium text-ink-tertiary uppercase tracking-wider px-4 pt-6 pb-2">
          About
        </div>
        <div className="bg-surface-raised rounded-xl mx-4 divide-y divide-surface-sunken overflow-hidden shadow-sm">
          <div className="px-4 py-3 flex items-center justify-between text-sm">
            <span className="text-sm text-ink-primary">Version</span>
            <span className="text-sm text-ink-secondary font-semibold">
              {typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.0'}
            </span>
          </div>
          <div className="px-4 py-3 flex items-center justify-between text-sm">
            <span className="text-sm text-ink-primary">Privacy Policy</span>
            <a 
              href="/privacy.html" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-accent-sage font-medium hover:underline text-sm"
            >
              View
            </a>
          </div>
          <div className="px-4 py-3 flex items-center justify-between text-sm">
            <span className="text-sm text-ink-primary">Terms of Service</span>
            <a 
              href="/terms.html" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-accent-sage font-medium hover:underline text-sm"
            >
              View
            </a>
          </div>
          <div className="px-4 py-3 flex items-center justify-between text-sm">
            <span className="text-sm text-ink-primary">Support</span>
            <a 
              href="mailto:support@nestly.app" 
              className="text-accent-sage font-medium hover:underline text-sm"
            >
              Contact support
            </a>
          </div>
        </div>

        {/* Section 6 — Account */}
        <div className="text-xs font-medium text-ink-tertiary uppercase tracking-wider px-4 pt-6 pb-2">
          Account
        </div>
        <div className="bg-surface-raised rounded-xl mx-4 overflow-hidden shadow-sm p-4 flex flex-col gap-3">
          <SecondaryButton onClick={handleSignOut} disabled={isDeleting}>
            Sign out
          </SecondaryButton>
          
          {!showDeleteConfirm ? (
            <DestructiveButton onClick={() => setShowDeleteConfirm(true)}>
              Delete account
            </DestructiveButton>
          ) : (
            <div className="bg-accent-coral/10 rounded-xl p-4 flex flex-col gap-3.5 border border-accent-coral/20">
              <p className="text-sm text-ink-secondary leading-normal">
                This will permanently delete your account and all your data. Your partner will remain in the household. Entries you logged will be anonymised. This cannot be undone.
              </p>
              
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder='Type "DELETE" to confirm'
                disabled={isDeleting}
                className="bg-surface-sunken rounded-lg px-3 py-2 text-sm text-ink-primary border-none w-full focus:outline-none focus:ring-1 focus:ring-accent-coral/30 transition-shadow"
              />
              
              {deleteError && (
                <div className="text-xs text-accent-coral font-medium">
                  {deleteError}
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                <DestructiveButton
                  onClick={handleConfirmedDelete}
                  disabled={deleteInput !== 'DELETE' || isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete my account'}
                </DestructiveButton>
                
                <GhostButton
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeleteInput('')
                    setDeleteError(null)
                  }}
                  disabled={isDeleting}
                >
                  Cancel
                </GhostButton>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
