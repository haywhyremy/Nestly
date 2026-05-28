import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useHousehold } from '../context/HouseholdContext'
import { PrimaryButton } from '../components/buttons/PrimaryButton'
import { GhostButton } from '../components/buttons/GhostButton'
import { Mail, Loader2 } from 'lucide-react'
import { createInvite } from '../db/repositories'

const getTodayString = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function OnboardingFlow() {
  const { user, isAuthenticated, signIn } = useAuth()
  const { household, hasHousehold, createNewHousehold, isLoading: householdLoading } = useHousehold()
  const navigate = useNavigate()

  const [step, setStep] = useState('welcome')
  const [email, setEmail] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState('')

  // Create Household State
  const [babyName, setBabyName] = useState('')
  const [babyDob, setBabyDob] = useState(getTodayString())
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState(null)

  // Invite Partner State
  const [inviteCode, setInviteCode] = useState(null)
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteError, setInviteError] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (isAuthenticated && !householdLoading) {
      if (hasHousehold) {
        // If user already has household, they shouldn't do onboarding, but we want to let them invite
        // if they are currently on the invite step
        if (step !== 'invitePartner') {
          navigate('/app', { replace: true })
        }
      } else if (step === 'welcome') {
        setStep('createHousehold')
      }
    }
  }, [isAuthenticated, hasHousehold, householdLoading, step, navigate])

  useEffect(() => {
    if (step === 'invitePartner' && household?.id && user?.id) {
      const generateInvite = async () => {
        setInviteLoading(true)
        setInviteError(null)
        try {
          const invite = await createInvite(household.id, user.id)
          setInviteCode(invite.code)
        } catch (err) {
          console.error('Failed to create invite:', err)
          setInviteError('Failed to generate invite code. Please try again.')
        } finally {
          setInviteLoading(false)
        }
      }
      generateInvite()
    }
  }, [step, household?.id, user?.id])

  const handleSendMagicLink = async (e) => {
    e.preventDefault()
    if (!email) return

    setIsSending(true)
    setError('')
    try {
      const { error: signInError } = await signIn(email)
      if (signInError) throw signInError
      setStep('waiting')
    } catch (err) {
      console.error('Magic link send failed:', err)
      setError(err.message || 'Failed to send sign-in link. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  const handleCreateHousehold = async (e) => {
    e.preventDefault()
    if (!babyName.trim()) return

    setIsCreating(true)
    setCreateError(null)
    try {
      await createNewHousehold(babyName.trim(), babyDob)
      setStep('invitePartner')
    } catch (err) {
      console.error('Failed to create household:', err)
      setCreateError(err.message || 'Failed to create household. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleShareInvite = async () => {
    if (!inviteCode) return
    const inviteUrl = `${window.location.origin}/join/${inviteCode}`

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
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Clipboard copy failed:', err)
    }
  }

  if (step === 'welcome') {
    return (
      <div className="flex flex-col justify-between min-h-dvh bg-surface-base p-8 max-w-md mx-auto text-ink-primary select-none animate-fade-in">
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}</style>
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-accent-sage/10 flex items-center justify-center text-accent-sage text-2xl font-semibold mb-8">
            N
          </div>
          <h1 className="text-4xl font-semibold text-ink-primary tracking-tight">Nestly</h1>
          <p className="text-base text-ink-secondary mt-3 max-w-[260px] leading-relaxed">
            A calm, shared log for two parents.
          </p>
          <p className="text-sm text-ink-tertiary mt-2 font-light italic">
            Nothing more.
          </p>
        </div>
        <div className="mt-12 w-full max-w-xs mx-auto pb-8">
          <PrimaryButton onClick={() => setStep('signin')}>
            Get started
          </PrimaryButton>
        </div>
      </div>
    )
  }

  if (step === 'signin') {
    return (
      <div className="flex flex-col justify-center min-h-dvh bg-surface-base p-8 max-w-md mx-auto text-ink-primary animate-fade-in">
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}</style>
        <div className="w-full">
          <h1 className="text-xl font-semibold text-ink-primary tracking-tight mb-2">Sign in</h1>
          <p className="text-sm text-ink-secondary mb-8">
            Enter your email to receive a secure sign-in link.
          </p>
          
          <form onSubmit={handleSendMagicLink} className="space-y-4">
            <div>
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
                disabled={isSending}
                className="w-full h-[52px] px-4 rounded-xl bg-surface-raised border border-surface-sunken text-base text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:ring-2 focus:ring-accent-sage transition-all"
              />
            </div>

            <PrimaryButton 
              type="submit"
              disabled={isSending || !email}
              className="mt-6"
            >
              {isSending ? 'Sending link...' : 'Send magic link'}
            </PrimaryButton>
          </form>

          {error && (
            <div className="mt-4 text-sm text-red-500 bg-red-500/10 p-3 rounded-xl border border-red-500/20 text-center animate-fade-in">
              {error}
            </div>
          )}

          <p className="text-xs text-ink-tertiary mt-3 text-center leading-relaxed">
            No password needed. We'll email you a sign-in link.
          </p>
        </div>
      </div>
    )
  }

  if (step === 'waiting') {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh bg-surface-base p-8 max-w-md mx-auto text-ink-primary text-center animate-fade-in">
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}</style>
        <div className="w-16 h-16 rounded-full bg-accent-sage/10 flex items-center justify-center text-accent-sage mb-6">
          <Mail size={48} strokeWidth={1.75} className="text-accent-sage" />
        </div>
        <h1 className="text-xl font-semibold text-ink-primary tracking-tight">Check your email</h1>
        <p className="text-sm text-ink-secondary mt-2 max-w-[280px] leading-relaxed">
          We sent a sign-in link to <span className="font-medium text-ink-primary">{email}</span>
        </p>
        
        <div className="mt-12 w-full max-w-xs">
          <GhostButton onClick={() => setStep('signin')}>
            Use a different email
          </GhostButton>
        </div>
      </div>
    )
  }

  if (step === 'createHousehold') {
    return (
      <div className="flex flex-col justify-center min-h-dvh bg-surface-base p-8 max-w-md mx-auto text-ink-primary animate-fade-in">
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}</style>
        <div className="w-full">
          <h1 className="text-xl font-semibold text-ink-primary">Name your baby</h1>
          <p className="text-sm text-ink-tertiary mt-1 mb-8">You can always change this later.</p>

          <form onSubmit={handleCreateHousehold} className="space-y-6">
            <div>
              <input
                type="text"
                required
                placeholder="Baby's name"
                value={babyName}
                onChange={(e) => {
                  setBabyName(e.target.value)
                  setCreateError(null)
                }}
                disabled={isCreating}
                className="w-full h-[52px] px-4 rounded-xl bg-surface-raised border border-surface-sunken text-base text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:ring-2 focus:ring-accent-sage transition-all"
              />
            </div>

            <div>
              <label htmlFor="babyDob" className="block text-sm text-ink-secondary mb-1">
                Date of birth (optional)
              </label>
              <input
                id="babyDob"
                type="date"
                value={babyDob}
                onChange={(e) => setBabyDob(e.target.value)}
                disabled={isCreating}
                className="w-full h-[52px] px-4 rounded-xl bg-surface-raised border border-surface-sunken text-base text-ink-primary focus:outline-none focus:ring-2 focus:ring-accent-sage transition-all"
              />
            </div>

            <PrimaryButton
              type="submit"
              disabled={isCreating || !babyName.trim()}
              className="mt-6"
            >
              {isCreating ? 'Creating...' : 'Continue'}
            </PrimaryButton>
          </form>

          {createError && (
            <div className="text-sm text-accent-coral mt-2 text-center animate-fade-in">
              {createError}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (step === 'invitePartner') {
    const inviteUrl = inviteCode ? `${window.location.origin}/join/${inviteCode}` : ''

    return (
      <div className="flex flex-col justify-center min-h-dvh bg-surface-base p-8 max-w-md mx-auto text-ink-primary animate-fade-in">
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}</style>
        <div className="w-full">
          <h1 className="text-xl font-semibold text-ink-primary">Invite your partner</h1>
          <p className="text-sm text-ink-secondary mt-1">
            Share this link with your partner. They'll join your household automatically.
          </p>

          {inviteLoading ? (
            <div className="flex flex-col items-center justify-center bg-surface-raised border border-surface-sunken rounded-xl p-8 mt-6 h-28">
              <Loader2 className="w-6 h-6 text-accent-sage animate-spin" />
              <span className="text-xs text-ink-tertiary mt-2">Generating secure code...</span>
            </div>
          ) : inviteError ? (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-4 mt-6 text-sm text-center">
              {inviteError}
            </div>
          ) : (
            <div className="bg-surface-raised border border-surface-sunken rounded-xl p-4 mt-6">
              <span className="block text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-2">Invite URL</span>
              <p className="text-sm font-mono text-ink-primary break-all">
                {inviteUrl || 'Loading secure link...'}
              </p>
            </div>
          )}

          <PrimaryButton
            onClick={handleShareInvite}
            disabled={inviteLoading || !!inviteError || !inviteCode}
            className="mt-4"
          >
            {copied ? 'Copied!' : 'Share invite'}
          </PrimaryButton>

          <GhostButton
            onClick={() => navigate('/app', { replace: true })}
            className="mt-2"
          >
            Skip for now
          </GhostButton>
        </div>
      </div>
    )
  }

  return null
}
