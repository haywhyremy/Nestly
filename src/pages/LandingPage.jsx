import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PrimaryButton } from '../components/buttons/PrimaryButton'
import { Clock, WifiOff, Users, ChevronDown, Mail } from 'lucide-react'

export default function LandingPage() {
  const { user, isAuthenticated, signIn } = useAuth()
  const navigate = useNavigate()

  // Form State
  const [email, setEmail] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleSignUp = async (e) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsSending(true)
    setError('')
    try {
      await signIn(email.trim())
      setSent(true)
    } catch (err) {
      console.error('Failed to send sign-in link:', err)
      setError(err.message || 'Failed to send sign-in link. Please try again.')
    } finally {
      setIsSending(false)
    }
  };

  const handleGetStartedClick = () => {
    const signupElement = document.getElementById('signup')
    if (signupElement) {
      signupElement.scrollIntoView({ behavior: 'smooth' })
    }
  };

  return (
    <div className="max-w-md mx-auto bg-surface-base min-h-dvh flex flex-col shadow-sm">
      {/* 1. Hero Section */}
      <section className="min-h-dvh flex flex-col items-center justify-center px-6 text-center select-none relative">
        <div className="w-16 h-16 rounded-full bg-accent-sage/10 flex items-center justify-center text-accent-sage text-3xl font-semibold mb-6">
          N
        </div>
        <h1 className="text-4xl font-semibold text-ink-primary tracking-tight">Nestly</h1>
        <p className="text-lg text-ink-secondary mt-3 leading-relaxed max-w-[280px]">
          A calm, shared log for two parents.
        </p>
        <p className="text-sm text-ink-tertiary mt-2 max-w-xs leading-normal">
          Track feeds, nappies, and sleep together. Works offline. Nothing more.
        </p>
        
        <div className="mt-10 w-full max-w-xs px-4">
          <PrimaryButton onClick={handleGetStartedClick}>
            Get started — it's free
          </PrimaryButton>
        </div>

        <button 
          onClick={handleGetStartedClick}
          className="absolute bottom-10 flex flex-col items-center gap-1 text-ink-tertiary hover:text-ink-secondary transition-colors focus:outline-none"
          aria-label="Scroll to sign up"
        >
          <ChevronDown size={20} className="animate-bounce motion-reduce:animate-none" />
        </button>
      </section>

      {/* 2. Value Prop Section */}
      <section className="py-16 px-8 bg-surface-base border-t border-surface-sunken/40 space-y-12">
        <div className="flex flex-col items-center text-center">
          <div className="p-3 bg-accent-sage/5 rounded-xl text-accent-sage">
            <Clock size={24} />
          </div>
          <h3 className="text-base text-ink-primary font-medium mt-3">
            Log a feed in under 7 seconds
          </h3>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="p-3 bg-accent-sage/5 rounded-xl text-accent-sage">
            <WifiOff size={24} />
          </div>
          <h3 className="text-base text-ink-primary font-medium mt-3">
            Works offline, syncs when you reconnect
          </h3>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="p-3 bg-accent-sage/5 rounded-xl text-accent-sage">
            <Users size={24} />
          </div>
          <h3 className="text-base text-ink-primary font-medium mt-3">
            Both carers see the same log, always
          </h3>
        </div>
      </section>

      {/* 3. Sign-Up Section */}
      <section id="signup" className="py-16 px-8 bg-surface-base border-t border-surface-sunken/40 flex flex-col justify-center min-h-[350px]">
        {!sent ? (
          <div className="w-full text-center">
            <h2 className="text-xl font-semibold text-ink-primary tracking-tight mb-2">
              Sign in or Sign up
            </h2>
            <p className="text-sm text-ink-secondary mb-8">
              Enter your email to receive a secure sign-in link.
            </p>

            <form onSubmit={handleSignUp} className="space-y-4 max-w-xs mx-auto">
              <input
                type="email"
                required
                aria-label="Email address"
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
        ) : (
          <div className="flex flex-col items-center text-center py-6 animate-fade-in">
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
              <Mail size={32} strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-semibold text-ink-primary tracking-tight">Check your email</h2>
            <p className="text-sm text-ink-secondary mt-2 max-w-[280px] leading-relaxed">
              We sent a sign-in link to <span className="font-semibold text-ink-primary">{email}</span>. Click the link to launch Nestly.
            </p>
          </div>
        )}
      </section>

      {/* 4. Footer */}
      <footer className="py-8 px-6 bg-surface-base border-t border-surface-sunken flex justify-center gap-6 text-xs text-ink-tertiary">
        <a href="/privacy.html" target="_blank" rel="noopener noreferrer" className="hover:text-ink-secondary transition-colors">
          Privacy Policy
        </a>
        <a href="/terms.html" target="_blank" rel="noopener noreferrer" className="hover:text-ink-secondary transition-colors">
          Terms of Service
        </a>
      </footer>
    </div>
  );
}
