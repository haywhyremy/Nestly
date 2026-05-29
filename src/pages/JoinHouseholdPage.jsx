import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useHousehold } from '../context/HouseholdContext'
import { getInvite, acceptInvite } from '../db/repositories'
import { PrimaryButton } from '../components/buttons/PrimaryButton'
import { GhostButton } from '../components/buttons/GhostButton'
import { Mail, AlertCircle } from 'lucide-react'
import { Toast } from '../components/layout/Toast'
import { trackEvent } from '../services/analytics'

export default function JoinHouseholdPage() {
  const { code } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated, signIn } = useAuth()
  const { 
    household, 
    baby: contextBaby, 
    hasHousehold, 
    refreshHousehold, 
    isLoading: householdLoading 
  } = useHousehold()

  const [invite, setInvite] = useState(null)
  const [baby, setBaby] = useState(null)
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [email, setEmail] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState('')

  // Toast State
  const [toastMessage, setToastMessage] = useState('')
  const [isToastVisible, setIsToastVisible] = useState(false)

  // 1. Process pending code from sessionStorage on mount (if user is returning from a magic link redirect)
  useEffect(() => {
    const pendingCode = sessionStorage.getItem('pendingInviteCode')
    if (pendingCode && isAuthenticated) {
      sessionStorage.removeItem('pendingInviteCode')
      if (pendingCode !== code) {
        navigate(`/join/${pendingCode}`, { replace: true })
      }
    }
  }, [code, isAuthenticated, navigate])

  // 2. Validate invitation link
  useEffect(() => {
    const validateInvite = async () => {
      setStatus('loading')
      setErrorMessage('')
      try {
        const inviteData = await getInvite(code)
        if (!inviteData) {
          setStatus('error')
          setErrorMessage("This invite link doesn't look right. Check with your partner.")
          return
        }

        const now = new Date()
        if (new Date(inviteData.expires_at) < now) {
          setStatus('error')
          setErrorMessage("This invite has expired. Ask your partner to send a new one.")
          return
        }

        if (inviteData.used_by) {
          setStatus('error')
          setErrorMessage("This invite has already been used.")
          return
        }

        setInvite(inviteData)
        setStatus('valid')
      } catch (err) {
        console.error('Failed to validate invite:', err)
        setStatus('error')
        setErrorMessage(err.message || 'Failed to check invite link. Please try again.')
      }
    }

    if (code) {
      validateInvite()
    }
  }, [code])

  // 3. Process join flow if invite is valid AND user is authenticated
  useEffect(() => {
    if (status === 'valid' && isAuthenticated && invite && !householdLoading) {
      const join = async () => {
        if (hasHousehold && household?.id === invite.household_id) {
          setStatus('success')
          setToastMessage("You're already in this household")
          setIsToastVisible(true)
          setTimeout(() => {
            navigate('/app', { replace: true })
          }, 2000)
          return
        }

        setStatus('joining')
        try {
          const result = await acceptInvite(code, user.id, user.email)
          await refreshHousehold()
          if (result?.member?.household_id) {
            trackEvent('partner_joined', { household_id: result.member.household_id })
          }
          setBaby(result.baby)
          setStatus('success')
        } catch (err) {
          console.error('Join household failed:', err)
          setStatus('error')
          setErrorMessage(err.message || 'Failed to join the household. Please check your invitation link.')
        }
      }
      join()
    }
  }, [status, isAuthenticated, invite, hasHousehold, household?.id, code, user?.id, user?.email, householdLoading, navigate, refreshHousehold])

  // 4. Auto-redirect on successful join after 3 seconds
  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        navigate('/app', { replace: true })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [status, navigate])

  const handleSendMagicLink = async (e) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsSending(true)
    setError('')
    try {
      const { error: signInError } = await signIn(email.trim())
      if (signInError) throw signInError
      
      // Store pending invite code in sessionStorage
      sessionStorage.setItem('pendingInviteCode', code)
      setStatus('waiting-for-link')
    } catch (err) {
      console.error('Magic link send failed:', err)
      setError(err.message || 'Failed to send sign-in link. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  const renderContent = () => {
    if (status === 'loading') {
      return (
        <div className="flex-1 flex items-center justify-center p-6 bg-surface-base">
          <div className="text-sm text-ink-tertiary animate-pulse select-none">Checking your invite...</div>
        </div>
      )
    }

    if (status === 'error') {
      return (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center bg-surface-base select-none">
          <AlertCircle className="w-10 h-10 text-ink-tertiary" />
          <p className="text-base text-ink-secondary mt-4 max-w-xs leading-relaxed">
            {errorMessage}
          </p>
          <div className="mt-6 w-full max-w-xs">
            <GhostButton onClick={() => navigate('/', { replace: true })}>
              Go to Nestly
            </GhostButton>
          </div>
        </div>
      )
    }

    if (status === 'valid' && !isAuthenticated) {
      return (
        <div className="flex-1 flex flex-col justify-center px-8 py-12 bg-surface-base">
          <div className="w-full text-center">
            <h1 className="text-xl font-semibold text-ink-primary tracking-tight mb-2">
              Join your partner's household
            </h1>
            <p className="text-sm text-ink-secondary mb-8">
              Sign in to join
            </p>

            <form onSubmit={handleSendMagicLink} className="space-y-4 max-w-xs mx-auto">
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
                className="w-full h-[52px] px-4 rounded-xl bg-surface-raised border border-surface-sunken text-base text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:ring-2 focus:ring-accent-sage/30 transition-shadow"
              />

              <PrimaryButton 
                type="submit"
                disabled={isSending || !email.trim()}
              >
                {isSending ? 'Sending link...' : 'Send magic link'}
              </PrimaryButton>
            </form>

            {error && (
              <div className="mt-4 text-sm text-accent-coral bg-accent-coral/10 p-3 rounded-xl border border-accent-coral/20 text-center animate-pulse max-w-xs mx-auto">
                {error}
              </div>
            )}

            <p className="text-xs text-ink-tertiary mt-4 leading-relaxed">
              No password needed. We'll email you a sign-in link.
            </p>
          </div>
        </div>
      )
    }

    if (status === 'waiting-for-link') {
      return (
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 text-center bg-surface-base">
          <div className="w-16 h-16 rounded-full bg-accent-sage/10 flex items-center justify-center text-accent-sage mb-6">
            <Mail size={48} strokeWidth={1.5} />
          </div>
          <h1 className="text-xl font-semibold text-ink-primary tracking-tight">Check your email</h1>
          <p className="text-sm text-ink-secondary mt-2 max-w-[280px] leading-relaxed">
            We sent a sign-in link to <span className="font-semibold text-ink-primary">{email}</span>. Click the link to launch Nestly and join the household.
          </p>
          
          <div className="mt-12 w-full max-w-xs">
            <GhostButton onClick={() => setStatus('valid')}>
              Use a different email
            </GhostButton>
          </div>
        </div>
      )
    }

    if (status === 'joining') {
      return (
        <div className="flex-1 flex items-center justify-center p-6 bg-surface-base">
          <div className="text-sm text-ink-tertiary animate-pulse select-none">Joining household...</div>
        </div>
      )
    }

    if (status === 'success') {
      const displayBabyName = baby?.name || contextBaby?.name || 'your baby'

      return (
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 text-center bg-surface-base">
          <h1 className="text-xl font-semibold text-ink-primary">You're in!</h1>
          <p className="text-base text-ink-secondary mt-2">
            You've joined {displayBabyName}'s household.
          </p>
          
          <div className="mt-12 w-full max-w-xs">
            <GhostButton onClick={() => navigate('/app', { replace: true })}>
              Go to app
            </GhostButton>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className="max-w-md mx-auto bg-surface-base min-h-dvh flex flex-col shadow-sm animate-fade-in">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      {renderContent()}
      <Toast 
        message={toastMessage} 
        isVisible={isToastVisible} 
        onClose={() => setIsToastVisible(false)} 
      />
    </div>
  )
}
