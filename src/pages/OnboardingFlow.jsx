import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useHousehold } from '../context/HouseholdContext'
import { PrimaryButton } from '../components/buttons/PrimaryButton'
import { GhostButton } from '../components/buttons/GhostButton'
import { Mail } from 'lucide-react'

const getTodayString = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function OnboardingFlow() {
  const { isAuthenticated, signIn } = useAuth()
  const { hasHousehold, createNewHousehold, isLoading: householdLoading } = useHousehold()
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

  useEffect(() => {
    if (isAuthenticated && !householdLoading) {
      if (hasHousehold) {
        navigate('/app', { replace: true })
      } else if (step === 'welcome') {
        setStep('createHousehold')
      }
    }
  }, [isAuthenticated, hasHousehold, householdLoading, step, navigate])

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

  // Placeholder for step 20
  if (step === 'invitePartner') {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh bg-surface-base p-8 text-center text-ink-primary">
        <h1 className="text-xl font-semibold mb-2">Invite Partner</h1>
        <p className="text-sm text-ink-secondary">This onboarding step will be completed in STEP 20.</p>
      </div>
    )
  }

  return null
}
