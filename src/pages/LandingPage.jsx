import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PrimaryButton } from '../components/buttons/PrimaryButton'
import { 
  WifiOff, 
  Users, 
  ChevronDown, 
  ChevronUp, 
  Mail, 
  MessageSquare, 
  HelpCircle, 
  Shield, 
  Moon, 
  Wifi 
} from 'lucide-react'

const faqItems = [
  {
    question: "Is Nestly really free?",
    answer: "Yes, Nestly is free. We might add paid premium integrations in the future, but core parent-sharing logs, offline mode, and data exports will always remain completely free."
  },
  {
    question: "Does it work without internet?",
    answer: "Yes. Nestly is built offline-first. Your entries save instantly to local database storage (IndexedDB) on your phone. When a network connection returns, the app automatically uploads queued logs and downloads new ones."
  },
  {
    question: "Can I use it with my nanny or grandparent?",
    answer: "Right now, Nestly is optimized specifically for a close duo of two main carers. We plan to add support for multiple household roles and wider carer circles in a future update."
  },
  {
    question: "Is my baby's data safe?",
    answer: "Absolutely. We secure your records in strict EU datacentres (London). There are no third-party advertisements or trackers inside Nestly. You can download your complete history in standard CSV format or delete your account instantly from Settings."
  },
  {
    question: "Do I need to download an app store package?",
    answer: "No. Nestly is a Progressive Web App (PWA). Just open the web address in your browser, select 'Add to Home Screen', and it installs ambiently as a full-screen, native-feeling app."
  },
  {
    question: "What if my partner and I log at the same time?",
    answer: "Nestly's offline sync engine detects potential duplicates logged within 10 minutes of each other. Instead of silently deleting entries, it flags them on the timeline so you can calmly resolve them together."
  }
]

export default function LandingPage() {
  const { isAuthenticated, signIn } = useAuth()
  const navigate = useNavigate()

  // Form State
  const [email, setEmail] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  // FAQ State
  const [openFaqIndex, setOpenFaqIndex] = useState(null)

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

  const handleScrollToSection = (e, targetId) => {
    e.preventDefault()
    const targetElement = document.getElementById(targetId)
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' })
    }
  };

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index)
  };

  return (
    <div className="max-w-md mx-auto bg-surface-base min-h-dvh flex flex-col shadow-sm text-ink-primary font-system">
      
      {/* SECTION 1: HERO */}
      <section className="min-h-dvh flex flex-col items-center justify-center px-6 text-center select-none relative bg-gradient-to-b from-surface-base to-[#F0EBE3] pt-12 pb-16">
        
        {/* Pill Badge */}
        <div className="bg-accent-sage/10 text-accent-sage text-xs font-semibold px-3.5 py-1 rounded-full tracking-wide shadow-sm animate-fade-in">
          Simple baby tracking for two
        </div>

        {/* Headline */}
        <h1 
          className="text-4xl font-bold text-ink-primary tracking-tight mt-6 leading-tight max-w-[320px] mx-auto animate-fade-in"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          The feed log that never gets lost.
        </h1>

        {/* Sub-headline */}
        <p className="text-base text-ink-secondary mt-4 leading-relaxed max-w-[310px] mx-auto animate-fade-in">
          You and your partner. One calm, shared log. Feeds, nappies, sleep — always in sync, even offline.
        </p>
        
        {/* Two CTAs */}
        <div className="mt-8 flex gap-3 w-full max-w-xs px-4 animate-fade-in">
          <PrimaryButton 
            onClick={(e) => handleScrollToSection(e, 'signup')}
            className="flex-1 text-sm font-semibold !h-12 shadow-sm"
          >
            Start free
          </PrimaryButton>
          <a
            href="#how-it-works"
            onClick={(e) => handleScrollToSection(e, 'how-it-works')}
            className="flex-1 !h-12 border border-ink-secondary/30 rounded-xl text-sm font-semibold text-ink-primary bg-surface-raised/40 hover:bg-surface-raised/80 active:brightness-95 flex items-center justify-center transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage/60"
            aria-label="See how Nestly works"
          >
            See how it works
          </a>
        </div>

        {/* Social Proof */}
        <p className="text-[11px] text-ink-tertiary mt-6 italic select-none animate-fade-in">
          Used by parents who ditched the WhatsApp thread
        </p>

        {/* Phone Mockup */}
        <div className="w-[260px] h-[520px] rounded-[40px] bg-ink-primary p-[8px] shadow-2xl mx-auto mt-8 border border-ink-secondary/20 relative animate-fade-in">
          {/* Notch / Dynamic Island */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-4 rounded-full bg-ink-primary z-10 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-black/60 mr-1" />
          </div>

          {/* Screen */}
          <div className="rounded-[32px] bg-surface-base overflow-hidden h-full flex flex-col justify-between p-4 pt-8 text-left border border-ink-secondary/10 relative select-none">
            {/* Top Header */}
            <div className="flex justify-between items-center px-2 py-1">
              <span className="text-[10px] font-semibold text-ink-secondary uppercase tracking-widest">Teeto</span>
              <div className="w-1.5 h-1.5 rounded-full bg-accent-sage animate-pulse" />
            </div>

            {/* Glance Card Content */}
            <div className="flex-1 flex flex-col justify-center items-center text-center px-2">
              <span className="text-[10px] font-bold text-accent-sage uppercase tracking-wider mb-1">Last Feed</span>
              <span className="text-4xl font-extrabold text-ink-primary tracking-tight">2h 14m</span>
              <span className="text-xs text-ink-secondary mt-1">90ml · Mum</span>
              
              {/* Secondary rows */}
              <div className="w-full mt-6 space-y-2.5 text-xs text-ink-secondary">
                <div className="flex items-center justify-between bg-surface-raised/60 backdrop-blur-sm rounded-xl px-3 py-2 border border-surface-sunken">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-accent-clay" />
                    <span>Last nappy</span>
                  </div>
                  <span className="font-semibold text-ink-primary">45m · Wet</span>
                </div>
                <div className="flex items-center justify-between bg-surface-raised/60 backdrop-blur-sm rounded-xl px-3 py-2 border border-surface-sunken">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-accent-dusk" />
                    <span>Sleep</span>
                  </div>
                  <span className="font-semibold text-accent-dusk animate-pulse">Ongoing · 38m</span>
                </div>
              </div>
            </div>

            {/* Quick Log Visual Buttons */}
            <div className="grid grid-cols-3 gap-1.5 pt-4">
              <div className="h-10 rounded-xl bg-accent-sage/10 text-accent-sage border border-accent-sage/20 font-bold text-[10px] flex items-center justify-center tracking-wider uppercase shadow-sm">
                Feed
              </div>
              <div className="h-10 rounded-xl bg-accent-clay/10 text-accent-clay border border-accent-clay/20 font-bold text-[10px] flex items-center justify-center tracking-wider uppercase shadow-sm">
                Nappy
              </div>
              <div className="h-10 rounded-xl bg-accent-dusk/10 text-accent-dusk border border-accent-dusk/20 font-bold text-[10px] flex items-center justify-center tracking-wider uppercase shadow-sm">
                Sleep
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={(e) => handleScrollToSection(e, 'pain-points')}
          className="absolute bottom-6 flex flex-col items-center gap-1 text-ink-tertiary hover:text-ink-secondary transition-colors focus:outline-none"
          aria-label="Scroll to pain points"
        >
          <ChevronDown size={18} className="animate-bounce motion-reduce:animate-none" />
        </button>
      </section>

      {/* SECTION 2: PAIN POINTS */}
      <section id="pain-points" className="py-20 px-6 bg-surface-base border-t border-surface-sunken/40 select-none">
        <h2 
          className="text-2xl font-bold text-ink-primary text-center tracking-tight"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          WhatsApp wasn't built for this.
        </h2>

        <div className="space-y-4 mt-10 max-w-md mx-auto">
          <div className="bg-surface-raised rounded-2xl p-5 border border-surface-sunken flex gap-4 items-start shadow-sm">
            <div className="p-2.5 bg-accent-coral/10 rounded-xl text-accent-coral flex-shrink-0 mt-0.5">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink-primary">Messages get buried</h3>
              <p className="text-xs text-ink-secondary mt-1.5 leading-relaxed">
                "Baby fed and slept" — but how much? Exactly when? Chat messages disappear in the middle of standard conversation. The scroll never ends.
              </p>
            </div>
          </div>

          <div className="bg-surface-raised rounded-2xl p-5 border border-surface-sunken flex gap-4 items-start shadow-sm">
            <div className="p-2.5 bg-accent-coral/10 rounded-xl text-accent-coral flex-shrink-0 mt-0.5">
              <WifiOff size={20} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink-primary">Signal drops at the worst time</h3>
              <p className="text-xs text-ink-secondary mt-1.5 leading-relaxed">
                In the nursery. On a drive. At the clinic. Right when you need to log, loading circles spinner breaks normal workflows. Signal shouldn't stand in your way.
              </p>
            </div>
          </div>

          <div className="bg-surface-raised rounded-2xl p-5 border border-surface-sunken flex gap-4 items-start shadow-sm">
            <div className="p-2.5 bg-accent-coral/10 rounded-xl text-accent-coral flex-shrink-0 mt-0.5">
              <HelpCircle size={20} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink-primary">"Did you feed her already?"</h3>
              <p className="text-xs text-ink-secondary mt-1.5 leading-relaxed">
                The redundant question that triggers every argument at 3am.ambient parenting metrics should be clear and accessible without calling.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS */}
      <section id="how-it-works" className="py-20 px-6 bg-[#F0EBE3] border-t border-surface-sunken/40 select-none">
        <h2 
          className="text-2xl font-bold text-ink-primary text-center tracking-tight"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          Three taps. Seven seconds. Done.
        </h2>
        <p className="text-sm text-ink-secondary text-center mt-2">
          No typing. No scrolling. Just tap and confirm.
        </p>

        <div className="space-y-12 mt-12 max-w-md mx-auto">
          
          {/* Step 1 */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold text-accent-sage/30 tracking-tight leading-none">01</span>
              <h3 className="text-base font-semibold text-ink-primary">Tap to log</h3>
            </div>
            <p className="text-xs text-ink-secondary leading-relaxed -mt-1">
              Feed, nappy, or sleep — one tap opens a pre-filled sheet. Smart defaults dynamically estimate parameters so you usually just hit confirm.
            </p>
            
            {/* Small Mockup 1 */}
            <div className="w-[180px] h-[280px] rounded-[30px] bg-ink-primary p-[5px] shadow-xl mx-auto mt-4 border border-ink-secondary/15 relative">
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-12 h-3 rounded-full bg-ink-primary z-10" />
              <div className="rounded-[25px] bg-surface-base overflow-hidden h-full flex flex-col justify-between p-3.5 pt-6 text-left relative text-[10px]">
                <span className="font-semibold text-ink-primary text-xs">Log feed</span>
                
                <div className="flex bg-surface-sunken rounded-lg p-0.5 mt-2.5">
                  <div className="flex-1 text-center py-1 bg-accent-sage text-white rounded-md font-semibold text-[8px] shadow-sm">Bottle</div>
                  <div className="flex-1 text-center py-1 text-ink-secondary font-medium text-[8px]">Breast</div>
                </div>

                <div className="mt-4 space-y-1">
                  <span className="block text-[8px] font-bold text-ink-secondary uppercase tracking-wider">Volume</span>
                  <div className="flex justify-between items-center bg-surface-raised border border-surface-sunken rounded-lg px-2.5 py-1">
                    <span className="font-bold text-ink-secondary">-</span>
                    <span className="font-bold text-ink-primary text-xs">90ml</span>
                    <span className="font-bold text-ink-secondary">+</span>
                  </div>
                </div>

                <div className="mt-auto pt-3">
                  <div className="w-full py-2 bg-accent-sage text-white text-center font-bold rounded-lg tracking-wide uppercase text-[8px] shadow-sm">
                    Log feed
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold text-accent-sage/30 tracking-tight leading-none">02</span>
              <h3 className="text-base font-semibold text-ink-primary">It syncs automatically</h3>
            </div>
            <p className="text-xs text-ink-secondary leading-relaxed -mt-1">
              Your partner sees the entry instantly on their phone. Works fully offline — logs save locally and update on Supabase when signal returns.
            </p>

            {/* Sync Illustration */}
            <div className="flex items-center justify-center gap-4 mt-4 h-28 select-none">
              {/* Phone Left */}
              <div className="w-12 h-20 rounded-xl bg-surface-raised border border-surface-sunken shadow-sm p-1.5 relative">
                <div className="w-4 h-0.5 rounded-full bg-ink-tertiary/40 mx-auto mb-1.5" />
                <div className="w-full h-11 rounded bg-accent-sage/10 relative overflow-hidden">
                  <div className="absolute inset-x-1.5 top-2 h-1 rounded bg-accent-sage/40" />
                  <div className="absolute inset-x-1.5 top-4.5 h-1 rounded bg-accent-sage/20" />
                  <div className="absolute inset-x-1.5 top-7 h-1 rounded bg-accent-sage/20" />
                </div>
              </div>
              
              {/* Sync Arrows */}
              <div className="flex flex-col items-center justify-center text-accent-sage animate-pulse">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="stroke-current">
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                  <path d="M16 16h5v5" />
                </svg>
              </div>

              {/* Phone Right */}
              <div className="w-12 h-20 rounded-xl bg-surface-raised border border-surface-sunken shadow-sm p-1.5 relative">
                <div className="w-4 h-0.5 rounded-full bg-ink-tertiary/40 mx-auto mb-1.5" />
                <div className="w-full h-11 rounded bg-accent-sage/10 relative overflow-hidden">
                  <div className="absolute inset-x-1.5 top-2 h-1 rounded bg-accent-sage/40" />
                  <div className="absolute inset-x-1.5 top-4.5 h-1 rounded bg-accent-sage/20" />
                  <div className="absolute inset-x-1.5 top-7 h-1 rounded bg-accent-sage/20" />
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold text-accent-sage/30 tracking-tight leading-none">03</span>
              <h3 className="text-base font-semibold text-ink-primary">Glance, don't search</h3>
            </div>
            <p className="text-xs text-ink-secondary leading-relaxed -mt-1">
              Simply open the app — instantly view how long ago baby was fed, nappy status, and ongoing sleep counters in one centered card.
            </p>

            {/* Small Mockup 3 */}
            <div className="w-[180px] h-[280px] rounded-[30px] bg-ink-primary p-[5px] shadow-xl mx-auto mt-4 border border-ink-secondary/15 relative">
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-12 h-3 rounded-full bg-ink-primary z-10" />
              <div className="rounded-[25px] bg-surface-base overflow-hidden h-full flex flex-col justify-between p-3.5 pt-6 text-left relative text-[9px]">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[8px] font-bold text-ink-secondary tracking-widest uppercase">Teeto</span>
                  <div className="w-1 h-1 rounded-full bg-accent-sage" />
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <span className="text-[8px] font-bold text-accent-sage uppercase tracking-wider mb-0.5">Last Feed</span>
                  <span className="text-2xl font-black text-ink-primary">2h 14m</span>
                  <span className="text-[9px] text-ink-secondary mt-0.5">90ml · Mum</span>
                </div>

                <div className="grid grid-cols-3 gap-1 pt-2">
                  <div className="h-7 rounded-lg bg-surface-raised border border-surface-sunken text-[8px] flex items-center justify-center font-bold text-ink-secondary">Feed</div>
                  <div className="h-7 rounded-lg bg-surface-raised border border-surface-sunken text-[8px] flex items-center justify-center font-bold text-ink-secondary">Nappy</div>
                  <div className="h-7 rounded-lg bg-surface-raised border border-surface-sunken text-[8px] flex items-center justify-center font-bold text-ink-secondary">Sleep</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 4: KEY FEATURES */}
      <section className="py-20 px-6 bg-surface-base select-none">
        <h2 
          className="text-2xl font-bold text-ink-primary text-center tracking-tight"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          Built for exhausted parents.
        </h2>

        <div className="space-y-4 mt-10 max-w-md mx-auto">
          <div className="bg-surface-raised rounded-2xl p-5 border border-surface-sunken flex gap-4 items-start shadow-sm">
            <div className="p-2.5 bg-accent-sage/10 rounded-xl text-accent-sage flex-shrink-0 mt-0.5">
              <Wifi size={20} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink-primary">Works offline</h3>
              <p className="text-xs text-ink-secondary mt-1.5 leading-relaxed">
                Log entries seamlessly with zero network signals. Everything safely cascades and merges on Supabase the second you connect.
              </p>
            </div>
          </div>

          <div className="bg-surface-raised rounded-2xl p-5 border border-surface-sunken flex gap-4 items-start shadow-sm">
            <div className="p-2.5 bg-accent-sage/10 rounded-xl text-accent-sage flex-shrink-0 mt-0.5">
              <Users size={20} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink-primary">Shared by two</h3>
              <p className="text-xs text-ink-secondary mt-1.5 leading-relaxed">
                Both carers reflect the exact same synchronized real-time state. Say goodbye to repetitive questions and timestamp texts.
              </p>
            </div>
          </div>

          <div className="bg-surface-raised rounded-2xl p-5 border border-surface-sunken flex gap-4 items-start shadow-sm">
            <div className="p-2.5 bg-accent-sage/10 rounded-xl text-accent-sage flex-shrink-0 mt-0.5">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink-primary">Your data stays yours</h3>
              <p className="text-xs text-ink-secondary mt-1.5 leading-relaxed">
                Securely encrypted in London (EU). Programmatic CSV downloads and single-click full account deletions from Settings. Zero trackers or third-party ads.
              </p>
            </div>
          </div>

          <div className="bg-surface-raised rounded-2xl p-5 border border-surface-sunken flex gap-4 items-start shadow-sm">
            <div className="p-2.5 bg-accent-sage/10 rounded-xl text-accent-sage flex-shrink-0 mt-0.5">
              <Moon size={20} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink-primary">Designed for 3am</h3>
              <p className="text-xs text-ink-secondary mt-1.5 leading-relaxed">
                Serene variable themes, large safe tap targets, offline banners, and silent browser status bars. Nestly is calm exactly when you need it most.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: FAQ */}
      <section className="py-20 px-6 bg-surface-sunken">
        <h2 
          className="text-2xl font-bold text-ink-primary text-center tracking-tight mb-10"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          Questions parents ask.
        </h2>

        <div className="space-y-3.5 max-w-md mx-auto">
          {faqItems.map((item, index) => {
            const isOpen = openFaqIndex === index
            return (
              <div 
                key={index} 
                className="bg-surface-raised border border-surface-sunken/60 rounded-xl overflow-hidden shadow-sm transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left font-medium text-sm text-ink-primary hover:text-ink-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-sage/40 transition-colors"
                >
                  <span>{item.question}</span>
                  {isOpen ? (
                    <ChevronUp size={16} className="text-ink-tertiary shrink-0 ml-2" />
                  ) : (
                    <ChevronDown size={16} className="text-ink-tertiary shrink-0 ml-2" />
                  )}
                </button>
                
                {isOpen && (
                  <div className="px-5 pb-4 pt-0 text-xs text-ink-secondary leading-relaxed border-t border-surface-sunken/20 select-text animate-fade-in">
                    {item.answer}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* SECTION 6: FINAL CTA + SIGN UP */}
      <section id="signup" className="py-20 px-8 bg-surface-base border-t border-surface-sunken/40 flex flex-col justify-center min-h-[350px]">
        {!sent ? (
          <div className="w-full text-center">
            <h2 
              className="text-2xl font-bold text-ink-primary tracking-tight mb-2"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              Ready to ditch the WhatsApp group?
            </h2>
            <p className="text-sm text-ink-secondary mb-8 leading-relaxed max-w-[280px] mx-auto">
              Set up takes 30 seconds. No credit card. No app store downloads.
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
                {isSending ? 'Sending link...' : 'Start free'}
              </PrimaryButton>
            </form>

            {error && (
              <div className="mt-4 text-sm text-accent-coral bg-accent-coral/10 p-3 rounded-xl border border-accent-coral/20 text-center animate-pulse max-w-xs mx-auto">
                {error}
              </div>
            )}

            <p className="text-xs text-ink-tertiary mt-4 leading-relaxed">
              No password needed. We'll email you a secure magic link.
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
            <h2 
              className="text-xl font-semibold text-ink-primary tracking-tight"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              Check your email
            </h2>
            <p className="text-sm text-ink-secondary mt-2 max-w-[280px] leading-relaxed">
              We sent a sign-in link to <span className="font-semibold text-ink-primary">{email}</span>. Click the link to launch Nestly.
            </p>
          </div>
        )}
      </section>

      {/* SECTION 7: FOOTER */}
      <footer className="py-8 px-6 bg-surface-base border-t border-surface-sunken flex justify-between items-center text-xs text-ink-tertiary">
        <span className="font-semibold text-sm tracking-tight text-ink-secondary">Nestly</span>
        <div className="flex gap-4">
          <a href="/privacy.html" target="_blank" rel="noopener noreferrer" className="hover:text-ink-secondary transition-colors">
            Privacy Policy
          </a>
          <a href="/terms.html" target="_blank" rel="noopener noreferrer" className="hover:text-ink-secondary transition-colors">
            Terms of Service
          </a>
        </div>
      </footer>
      
    </div>
  );
}
