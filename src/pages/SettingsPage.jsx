import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useHousehold } from '../context/HouseholdContext'
import { useTheme } from '../context/ThemeContext'
import { useSync } from '../hooks/useSync'
import { SegmentedToggle } from '../components/inputs/SegmentedToggle'
import { DestructiveButton } from '../components/buttons/DestructiveButton'
import { SecondaryButton } from '../components/buttons/SecondaryButton'
import { GhostButton } from '../components/buttons/GhostButton'
import { createInvite, updateProfile } from '../db/repositories'
import { exportToCSV } from '../utils/csvExport'
import db from '../db/dexie'
import { supabase } from '../services/supabase'
import { useNotificationBadge } from '../hooks/useNotificationBadge'

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
  
  // Local state for invitation code generation
  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [copied, setCopied] = useState(false)
  
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
      await exportToCSV(household.id)
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
  const handleInvitePartner = async () => {
    if (!household?.id || !user?.id) return
    setIsGeneratingInvite(true)
    try {
      const invite = await createInvite(household.id, user.id)
      setInviteCode(invite.code)
      
      const inviteUrl = `${window.location.origin}/join/${invite.code}`
      if (navigator.share) {
        await navigator.share({
          title: 'Join my Nestly household',
          text: `Join my carer household on Nestly using code ${invite.code}:`,
          url: inviteUrl
        })
      }
    } catch (error) {
      console.error('Failed to generate household invitation:', error)
    } finally {
      setIsGeneratingInvite(false)
    }
  }

  // Fallback copy invitation link to clipboard
  const handleCopyInvite = async () => {
    if (!inviteCode) return
    const inviteUrl = `${window.location.origin}/join/${inviteCode}`
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy invite code to clipboard:', err)
    }
  }

  const handleSignOut = async () => {
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
      <header className="px-4 py-4 flex items-center justify-between border-b border-surface-sunken sticky top-0 bg-surface-base z-10">
        <Link to="/app" className="p-2 -ml-2 text-ink-secondary hover:text-ink-primary transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-lg font-bold text-ink-primary absolute left-1/2 -translate-x-1/2 select-none">
          Settings
        </h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 space-y-2 max-w-md mx-auto w-full">
        {/* Section 1 — Household */}
        <div className="text-xs font-semibold text-ink-tertiary uppercase tracking-wider px-4 pt-6 pb-2">
          Household
        </div>
        <div className="bg-surface-raised rounded-xl mx-4 divide-y divide-surface-sunken overflow-hidden shadow-sm">
          <div className="px-4 py-3 flex items-center justify-between text-sm">
            <span className="font-medium text-ink-secondary">Baby</span>
            <span className="text-ink-primary font-semibold">{baby?.name || 'Loading baby details...'}</span>
          </div>
          
          <div className="px-4 py-3 flex flex-col items-start gap-2.5">
            <span className="text-sm font-medium text-ink-secondary">Members</span>
            <div className="w-full space-y-2">
              {members.map((member) => (
                <div key={member.id} className="flex justify-between items-center text-sm">
                  <span className="text-ink-primary font-semibold">
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
            <div className="px-4 py-3.5">
              <SecondaryButton 
                onClick={handleInvitePartner} 
                disabled={isGeneratingInvite}
              >
                {isGeneratingInvite ? 'Generating code...' : 'Invite partner'}
              </SecondaryButton>
              {inviteCode && (
                <div className="mt-3 p-3 bg-surface-sunken rounded-lg flex flex-col gap-2 transition-all">
                  <span className="text-xs text-ink-tertiary font-medium">Share invitation code:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-ink-primary flex-1 bg-surface-base px-2.5 py-1.5 rounded border border-surface-sunken select-all text-center">
                      {inviteCode}
                    </span>
                    <button 
                      onClick={handleCopyInvite} 
                      className="text-xs text-accent-sage font-semibold px-3 py-2 bg-accent-sage/10 rounded-lg hover:bg-accent-sage/20 transition-colors"
                    >
                      {copied ? 'Copied URL!' : 'Copy Link'}
                    </button>
                  </div>
                  <span className="text-[10px] text-ink-tertiary leading-normal">
                    Expires in 72 hours. Your partner can enter this code in the join screen or click the copied link.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section 2 — Profile */}
        <div className="text-xs font-semibold text-ink-tertiary uppercase tracking-wider px-4 pt-6 pb-2">
          Profile
        </div>
        <div className="bg-surface-raised rounded-xl mx-4 divide-y divide-surface-sunken overflow-hidden shadow-sm">
          <div className="px-4 py-3 flex flex-col gap-1.5 items-start">
            <label htmlFor="displayNameInput" className="text-sm font-medium text-ink-secondary">
              Display name
            </label>
            <input
              id="displayNameInput"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onBlur={() => handleSaveProfile('displayName', displayName)}
              placeholder="e.g. Papa, Mum"
              className="bg-surface-sunken rounded-lg px-3 py-2 text-sm text-ink-primary border-none w-full focus:outline-none focus:ring-1 focus:ring-accent-sage/30 transition-shadow"
            />
          </div>
          <div className="px-4 py-3 flex flex-col gap-1.5 items-start">
            <label htmlFor="displayLabelInput" className="text-sm font-medium text-ink-secondary">
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
          </div>
        </div>

        {/* Section 3 — Appearance */}
        <div className="text-xs font-semibold text-ink-tertiary uppercase tracking-wider px-4 pt-6 pb-2">
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
            <div className="text-xs font-semibold text-ink-tertiary uppercase tracking-wider px-4 pt-6 pb-2">
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
        <div className="text-xs font-semibold text-ink-tertiary uppercase tracking-wider px-4 pt-6 pb-2">
          Data & Sync
        </div>
        <div className="bg-surface-raised rounded-xl mx-4 divide-y divide-surface-sunken overflow-hidden shadow-sm">
          <div className="px-4 py-3 flex items-center justify-between text-sm">
            <span className="font-medium text-ink-secondary">Last synced</span>
            <span className="text-ink-primary font-semibold">{relativeTime}</span>
          </div>
          <div className="px-4 py-3 flex items-center justify-between text-sm">
            <span className="font-medium text-ink-secondary">Pending uploads</span>
            <span className="text-ink-primary font-semibold">{syncState.pendingCount}</span>
          </div>
          <div className="px-4 py-3.5 flex flex-col gap-3">
            <SecondaryButton 
              onClick={() => syncState.syncNow()}
              disabled={syncState.isSyncing}
            >
              {syncState.isSyncing ? 'Syncing...' : 'Sync now'}
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
        <div className="text-xs font-semibold text-ink-tertiary uppercase tracking-wider px-4 pt-6 pb-2">
          About
        </div>
        <div className="bg-surface-raised rounded-xl mx-4 divide-y divide-surface-sunken overflow-hidden shadow-sm">
          <div className="px-4 py-3 flex items-center justify-between text-sm">
            <span className="font-medium text-ink-secondary">Version</span>
            <span className="text-ink-primary font-semibold">
              {typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.0'}
            </span>
          </div>
          <div className="px-4 py-3 flex items-center justify-between text-sm">
            <span className="font-medium text-ink-secondary">Privacy Policy</span>
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
            <span className="font-medium text-ink-secondary">Terms of Service</span>
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
            <span className="font-medium text-ink-secondary">Support</span>
            <a 
              href="mailto:support@nestly.app" 
              className="text-accent-sage font-medium hover:underline text-sm"
            >
              Contact support
            </a>
          </div>
        </div>

        {/* Section 6 — Account */}
        <div className="text-xs font-semibold text-ink-tertiary uppercase tracking-wider px-4 pt-6 pb-2">
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
