import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useReveal } from '../hooks/useReveal'
import NestlyLogo from '../components/layout/NestlyLogo'
import { 
  MessageSquare, 
  WifiOff, 
  HelpCircle, 
  Wifi, 
  Users, 
  Shield, 
  Moon, 
  Sun,
  Plus,
  Minus,
  Mail 
} from 'lucide-react'

const faqItems = [
  {
    question: "Is Nestly really free?",
    answer: "Yes. The core tracking features are completely free. We may add optional premium features in the future, but logging feeds, nappies, and sleep will always be free."
  },
  {
    question: "Does it work without internet?",
    answer: "Absolutely. Nestly saves everything to your phone first. When you get signal again, it syncs automatically with your partner's device. You'll never lose an entry."
  },
  {
    question: "Can I use it with my nanny or grandparent?",
    answer: "Right now Nestly supports two carers per household. We're working on adding more carers — it's coming soon."
  },
  {
    question: "Is my baby's data safe?",
    answer: "Your data is stored securely in London (EU). We never share or sell your data. You can export everything as a CSV file or delete your entire account from Settings at any time."
  },
  {
    question: "Do I need to download an app?",
    answer: "No app store needed. Nestly is a web app — open it in your phone's browser and add it to your home screen. It works just like a native app, with offline support."
  },
  {
    question: "What if we both log at the same time?",
    answer: "Nestly detects potential overlapping entries and gently asks you to confirm. Nothing is ever silently deleted — you stay in control."
  }
]

export default function LandingPage() {
  const { isAuthenticated, signIn } = useAuth()
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const revealRef = useReveal()

  // Form State
  const [email, setEmail] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  // FAQ Accordion State
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

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index)
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  };

  return (
    <div className="w-full bg-[#FBF8F4] dark:bg-[#111110] text-[#1F1B16] dark:text-[#FAFAF8] font-system select-none overflow-x-hidden pt-20 transition-colors duration-200">
      
      {/* FIXED TOP NAVIGATION HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 py-4 px-6 bg-[#FBF8F4]/80 dark:bg-[#111110]/80 backdrop-blur-md border-b border-[#F2EDE6]/50 dark:border-[#2A2A28]/50 transition-all duration-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Left: Logo + Wordmark */}
          <a href="#" className="flex items-center gap-2 text-xl font-bold text-[#1F1B16] dark:text-[#FAFAF8]" style={{ fontFamily: "'DM Serif Display', serif" }}>
            <NestlyLogo size={28} className="text-[#7A9B7E] dark:text-[#8FB89A]" />
            <span>Nestly</span>
          </a>
          
          {/* Right: Nav links (desktop) + dark mode toggle + CTA */}
          <div className="flex items-center gap-6">
            {/* Desktop nav links - hidden on mobile */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#how-it-works" className="text-sm text-[#6B6259] dark:text-[#9C9C94] hover:text-[#1F1B16] dark:hover:text-[#FAFAF8] transition-colors duration-200">How it works</a>
              <a href="#features" className="text-sm text-[#6B6259] dark:text-[#9C9C94] hover:text-[#1F1B16] dark:hover:text-[#FAFAF8] transition-colors duration-200">Features</a>
              <a href="#faq" className="text-sm text-[#6B6259] dark:text-[#9C9C94] hover:text-[#1F1B16] dark:hover:text-[#FAFAF8] transition-colors duration-200">FAQ</a>
            </nav>
            
            {/* Dark mode toggle button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full bg-[#F2EDE6] dark:bg-[#1C1C1A] flex items-center justify-center hover:bg-[#E8E0D6] dark:hover:bg-[#2A2A28] text-[#1F1B16] dark:text-[#FAFAF8] transition-colors duration-200"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            
            {/* CTA button - desktop only */}
            <a 
              href="#signup" 
              className="hidden md:inline-flex h-10 px-5 rounded-xl bg-[#7A9B7E] dark:bg-[#8FB89A] text-white dark:text-[#111110] text-sm font-medium items-center hover:bg-[#6A8B6E] dark:hover:bg-[#7AA888] active:bg-[#5A7B5E] dark:active:bg-[#6A9878] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              Start free
            </a>
          </div>
        </div>
      </header>

      {/* SECTION 1: HERO */}
      <section className="min-h-dvh flex items-center bg-[#FBF8F4] dark:bg-[#111110] pt-20 pb-12 md:py-20 transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-6 w-full md:grid md:grid-cols-2 md:gap-12 md:items-center">
          
          {/* Left Column (Text) */}
          <div className="text-left flex flex-col items-start mb-12 md:mb-0">
            <span className="inline-block bg-[#7A9B7E]/10 dark:bg-[#8FB89A]/10 text-[#7A9B7E] dark:text-[#8FB89A] text-xs font-semibold px-4 py-1.5 rounded-full tracking-wide animate-fade-in-up">
              Baby tracking for parents who share the load
            </span>
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1F1B16] dark:text-[#FAFAF8] leading-[1.1] mt-6 tracking-tight animate-fade-in-up animation-delay-100"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              Never wonder when baby last ate.
            </h1>
            <p className="text-lg text-[#6B6259] dark:text-[#9C9C94] mt-6 leading-relaxed max-w-lg animate-fade-in-up animation-delay-200">
              A shared log for two parents. Track feeds, nappies, and sleep in seconds — always in sync, even without signal.
            </p>
            
            {/* Button list stacking on mobile, side-by-side on desktop */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8 w-full sm:w-auto animate-fade-in-up animation-delay-300">
              <a
                href="#signup"
                className="w-full sm:w-auto sm:px-8 h-[52px] rounded-xl font-semibold text-base text-white dark:text-[#111110] bg-[#7A9B7E] dark:bg-[#8FB89A] hover:bg-[#6A8B6E] dark:hover:bg-[#7AA888] active:bg-[#5A7B5E] dark:active:bg-[#6A9878] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg flex items-center justify-center shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A9B7E]"
              >
                Start tracking — it's free
              </a>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto px-6 h-[52px] rounded-xl border-2 border-[#1F1B16] dark:border-[#FAFAF8] text-[#1F1B16] dark:text-[#FAFAF8] text-sm font-semibold hover:bg-[#1F1B16] hover:text-[#FBF8F4] dark:hover:bg-[#FAFAF8] dark:hover:text-[#111110] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg flex items-center justify-center shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A9B7E]"
              >
                See how it works
              </a>
            </div>

            <p className="text-sm text-[#A89F94] dark:text-[#6C6C64] mt-8 animate-fade-in-up animation-delay-300">
              For parents who are tired of guessing and asking.
            </p>
          </div>

          {/* Right Column (iPhone Mockup) */}
          <div className="mt-10 md:mt-0 flex justify-center animate-fade-in-up animation-delay-400">
            <div className="relative animate-float">
              {/* Phone frame */}
              <div className="w-[260px] h-[520px] md:w-[280px] md:h-[560px] rounded-[50px] bg-[#1F1B16] p-[10px] shadow-[0_20px_60px_rgba(31,27,22,0.25)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_40px_rgba(143,184,154,0.12)]">
                {/* Screen */}
                <div className="w-full h-full rounded-[40px] bg-[#FBF8F4] dark:bg-[#1C1C1A] overflow-hidden relative">
                  {/* Dynamic Island */}
                  <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[80px] h-[22px] bg-[#1F1B16] rounded-full z-10" />
                  
                  {/* Screen content */}
                  <div className="pt-[44px] px-5 h-full flex flex-col">
                    {/* Status row */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-[#1F1B16] dark:text-[#FAFAF8]">Teeto</span>
                      <div className="w-[6px] h-[6px] rounded-full bg-[#7A9B7E]" />
                    </div>
                    
                    {/* Glance card */}
                    <div className="flex-1 flex flex-col items-center justify-center -mt-4">
                      <span className="text-[9px] uppercase tracking-[0.2em] text-[#A89F94] dark:text-[#6C6C64] font-medium">Last Feed</span>
                      <span className="text-[42px] font-bold text-[#1F1B16] dark:text-[#FAFAF8] leading-none mt-1" style={{ fontVariantNumeric: 'tabular-nums' }}>2h 14m</span>
                      <span className="text-[12px] text-[#6B6259] dark:text-[#9C9C94] mt-1">90ml · Mum</span>
                      
                      {/* Secondary rows */}
                      <div className="mt-5 w-full space-y-2 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-[6px] h-[6px] rounded-full bg-[#C49B7A]" />
                          <span className="text-[10px] text-[#6B6259] dark:text-[#9C9C94]">Last nappy · 45m · Wet</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-[6px] h-[6px] rounded-full bg-[#9B7E9B] animate-pulse" />
                          <span className="text-[10px] text-[#6B6259] dark:text-[#9C9C94]">Sleep · ongoing · 38m</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Bottom buttons */}
                    <div className="flex gap-2 pb-6 px-1">
                      <div className="flex-1 py-2 rounded-xl bg-[#7A9B7E]/15 text-center">
                        <span className="text-[10px] font-medium text-[#7A9B7E]">Feed</span>
                      </div>
                      <div className="flex-1 py-2 rounded-xl bg-[#C49B7A]/15 text-center">
                        <span className="text-[10px] font-medium text-[#C49B7A]">Nappy</span>
                      </div>
                      <div className="flex-1 py-2 rounded-xl bg-[#9B7E9B]/15 text-center">
                        <span className="text-[10px] font-medium text-[#9B7E9B]">Sleep</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SCROLL-REVEAL WRAPPER */}
      <div ref={revealRef}>
        
        {/* SECTION 2: PAIN POINTS */}
        <section id="pain-points" className="py-20 md:py-28 bg-[#FBF8F4] dark:bg-[#111110] border-t border-[#F2EDE6]/40 dark:border-[#2A2A28]/40 transition-colors duration-200">
          <div className="max-w-6xl mx-auto px-6">
            
            <h2 
              className="reveal text-3xl md:text-4xl font-bold text-[#1F1B16] dark:text-[#FAFAF8] text-center tracking-tight"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              Sound familiar?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14 stagger-children">
              
              <div className="reveal bg-white dark:bg-[#1C1C1A] rounded-2xl p-6 md:p-8 border border-[#F2EDE6] dark:border-[#2A2A28] hover:bg-[#FBF8F4]/80 dark:hover:bg-[#242422] hover:-translate-y-1 hover:shadow-xl hover:border-[#7A9B7E]/30 dark:hover:border-[#8FB89A]/30 transition-all duration-200 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-full bg-[#7A9B7E]/10 dark:bg-[#8FB89A]/10 flex items-center justify-center mb-6 text-[#7A9B7E] dark:text-[#8FB89A]">
                    <MessageSquare size={22} />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1F1B16] dark:text-[#FAFAF8]">"Wait — did you already feed her?"</h3>
                  <p className="text-sm text-[#6B6259] dark:text-[#9C9C94] mt-2.5 leading-relaxed">
                    When you're both running on two hours of sleep, it's impossible to remember who fed, how much, and when. Critical details slip through the cracks.
                  </p>
                </div>
              </div>

              <div className="reveal bg-white dark:bg-[#1C1C1A] rounded-2xl p-6 md:p-8 border border-[#F2EDE6] dark:border-[#2A2A28] hover:bg-[#FBF8F4]/80 dark:hover:bg-[#242422] hover:-translate-y-1 hover:shadow-xl hover:border-[#7A9B7E]/30 dark:hover:border-[#8FB89A]/30 transition-all duration-200 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-full bg-[#7A9B7E]/10 dark:bg-[#8FB89A]/10 flex items-center justify-center mb-6 text-[#7A9B7E] dark:text-[#8FB89A]">
                    <WifiOff size={22} />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1F1B16] dark:text-[#FAFAF8]">Logging feels like another chore</h3>
                  <p className="text-sm text-[#6B6259] dark:text-[#9C9C94] mt-2.5 leading-relaxed">
                    You're holding a baby in one arm, burping cloth on your shoulder, and somehow you're supposed to type notes with your free thumb? It needs to be faster than that.
                  </p>
                </div>
              </div>

              <div className="reveal bg-white dark:bg-[#1C1C1A] rounded-2xl p-6 md:p-8 border border-[#F2EDE6] dark:border-[#2A2A28] hover:bg-[#FBF8F4]/80 dark:hover:bg-[#242422] hover:-translate-y-1 hover:shadow-xl hover:border-[#7A9B7E]/30 dark:hover:border-[#8FB89A]/30 transition-all duration-200 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-full bg-[#7A9B7E]/10 dark:bg-[#8FB89A]/10 flex items-center justify-center mb-6 text-[#7A9B7E] dark:text-[#8FB89A]">
                    <HelpCircle size={22} />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1F1B16] dark:text-[#FAFAF8]">You're never quite sure what happened while you slept</h3>
                  <p className="text-sm text-[#6B6259] dark:text-[#9C9C94] mt-2.5 leading-relaxed">
                    You wake up for your shift. Was baby fed at 3am or 4am? How much? Was there a nappy change? You need answers without waking your partner.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 3: HOW IT WORKS */}
        <section id="how-it-works" className="py-20 md:py-28 bg-[#F2EDE6] dark:bg-[#0A0A09] transition-colors duration-200">
          <div className="max-w-6xl mx-auto px-6">
            
            <h2 
              className="reveal text-3xl md:text-4xl font-bold text-[#1F1B16] dark:text-[#FAFAF8] text-center tracking-tight"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              Three taps. Seven seconds. Done.
            </h2>
            <p className="reveal text-lg text-[#6B6259] dark:text-[#9C9C94] text-center mt-3 max-w-md mx-auto leading-relaxed">
              No typing. No forms. Just tap and confirm.
            </p>

            <div className="mt-16 space-y-24">
              
              {/* Step 1 */}
              <div className="md:grid md:grid-cols-2 md:gap-16 md:items-center">
                
                {/* Text */}
                <div className="reveal-left flex flex-col items-start text-left mb-8 md:mb-0">
                  <span className="text-6xl md:text-7xl font-bold text-[#7A9B7E]/20 dark:text-[#8FB89A]/20 tracking-tight leading-none">01</span>
                  <h3 className="text-2xl font-bold text-[#1F1B16] dark:text-[#FAFAF8] mt-2">Tap to log</h3>
                  <p className="text-base text-[#6B6259] dark:text-[#9C9C94] mt-3 leading-relaxed">
                    Feed, nappy, or sleep — one tap opens a pre-filled form. Smart defaults remember your last entry, so you usually just hit confirm.
                  </p>
                </div>

                {/* Visual Mockup */}
                <div className="reveal-scale relative w-[220px] h-[440px] mx-auto flex-shrink-0">
                  <div className="absolute inset-0 rounded-[40px] bg-[#1F1B16] shadow-xl border border-[#3A3530]/20">
                    <div className="absolute top-[10px] left-[10px] right-[10px] bottom-[10px] rounded-[32px] bg-[#FBF8F4] dark:bg-[#1C1C1A] overflow-hidden flex flex-col justify-between p-3.5 pb-5 transition-colors duration-200">
                      
                      {/* Notch */}
                      <div className="absolute top-[6px] left-1/2 -translate-x-1/2 w-[70px] h-[18px] bg-[#1F1B16] rounded-full z-10" />

                      <span className="font-bold text-[#1F1B16] dark:text-[#FAFAF8] text-[13px] px-2 pt-6 block text-left">Log feed</span>
                      
                      <div className="flex bg-[#F2EDE6] dark:bg-[#0A0A09] rounded-lg p-0.5 mt-2 transition-colors duration-200">
                        <div className="flex-1 text-center py-1 bg-[#7A9B7E] dark:bg-[#8FB89A] text-white dark:text-[#111110] rounded-md font-semibold text-[10px] shadow-sm">Bottle</div>
                        <div className="flex-1 text-center py-1 text-[#6B6259] dark:text-[#9C9C94] font-medium text-[10px]">Breast</div>
                      </div>

                      <div className="mt-4 space-y-1 px-1">
                        <span className="block text-[9px] font-bold text-[#6B6259] dark:text-[#9C9C94] uppercase tracking-wider">Volume</span>
                        <div className="flex justify-between items-center bg-white dark:bg-[#242422] border border-[#F2EDE6] dark:border-[#2A2A28] rounded-lg px-3 py-1.5 shadow-sm transition-colors duration-200">
                          <span className="font-bold text-[#6B6259] dark:text-[#9C9C94] text-xs">-</span>
                          <span className="font-bold text-[#1F1B16] dark:text-[#FAFAF8] text-sm">90ml</span>
                          <span className="font-bold text-[#6B6259] dark:text-[#9C9C94] text-xs">+</span>
                        </div>
                      </div>

                      <div className="mt-4 space-y-1 px-1">
                        <span className="block text-[9px] font-bold text-[#6B6259] dark:text-[#9C9C94] uppercase tracking-wider">Time</span>
                        <div className="flex justify-between items-center bg-white dark:bg-[#242422] border border-[#F2EDE6] dark:border-[#2A2A28] rounded-lg px-3 py-2 shadow-sm transition-colors duration-200">
                          <span className="text-[11px] text-[#1F1B16] dark:text-[#FAFAF8]">Now</span>
                          <span className="text-[10px] text-[#A89F94] dark:text-[#6C6C64]">Select</span>
                        </div>
                      </div>

                      <div className="mt-auto pt-3">
                        <div className="w-full py-2.5 bg-[#7A9B7E] dark:bg-[#8FB89A] text-white dark:text-[#111110] text-center font-bold rounded-xl tracking-wider uppercase text-[10px] shadow-sm">
                          Log feed
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

              </div>

              {/* Step 2 */}
              <div className="md:grid md:grid-cols-2 md:gap-16 md:items-center">
                
                {/* Text (Ordered 2 on Desktop) */}
                <div className="reveal-right flex flex-col items-start text-left mb-8 md:mb-0 md:order-2">
                  <span className="text-6xl md:text-7xl font-bold text-[#7A9B7E]/20 dark:text-[#8FB89A]/20 tracking-tight leading-none">02</span>
                  <h3 className="text-2xl font-bold text-[#1F1B16] dark:text-[#FAFAF8] mt-2">Your partner sees it instantly</h3>
                  <p className="text-base text-[#6B6259] dark:text-[#9C9C94] mt-3 leading-relaxed">
                    The entry appears on their phone automatically. Works fully offline too — logs save locally and sync the moment signal returns.
                  </p>
                </div>

                {/* Visual Mockup (Ordered 1 on Desktop) */}
                <div className="reveal-scale md:order-1 flex items-center justify-center gap-4 relative max-w-sm mx-auto w-full py-6">
                  
                  {/* Phone Left */}
                  <div className="relative w-[130px] h-[260px] flex-shrink-0">
                    <div className="absolute inset-0 rounded-[28px] bg-[#1F1B16] shadow-md border border-[#3A3530]/20">
                      <div className="absolute top-[6px] left-[6px] right-[6px] bottom-[6px] rounded-[22px] bg-[#FBF8F4] dark:bg-[#1C1C1A] overflow-hidden p-2 pt-5 transition-colors duration-200">
                        <div className="absolute top-[4px] left-1/2 -translate-x-1/2 w-[40px] h-[10px] bg-[#1F1B16] rounded-full z-10" />
                        
                        <div className="w-full h-full flex flex-col justify-between">
                          <div className="h-6 w-full flex items-center justify-between px-1">
                            <span className="text-[7px] font-bold text-[#A89F94] dark:text-[#6C6C64]">Nestly</span>
                            <div className="w-1 h-1 rounded-full bg-[#7A9B7E]" />
                          </div>
                          <div className="bg-white dark:bg-[#242422] rounded-lg p-2 border border-[#F2EDE6] dark:border-[#2A2A28] text-center shadow-xs my-auto transition-colors duration-200">
                            <span className="block text-[6px] uppercase tracking-wider text-[#A89F94] dark:text-[#6C6C64]">Logged by Mum</span>
                            <span className="block text-xs font-bold text-[#1F1B16] dark:text-[#FAFAF8] mt-0.5">90ml Feed</span>
                          </div>
                          <div className="h-5 w-full bg-[#7A9B7E]/10 border border-[#7A9B7E]/20 rounded-md flex items-center justify-center">
                            <span className="text-[6px] font-bold uppercase text-[#7A9B7E]">Success</span>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* Curved Arrow */}
                  <div className="text-[#7A9B7E] dark:text-[#8FB89A] flex-shrink-0 z-10">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="stroke-current animate-pulse">
                      <path d="M12 2a10 10 0 0 0-7.07 17.07L7 21" />
                      <path d="M2 17h5v5" />
                      <path d="M12 22a10 10 0 0 0 7.07-17.07L17 3" />
                      <path d="M22 7h-5V2" />
                    </svg>
                  </div>

                  {/* Phone Right */}
                  <div className="relative w-[130px] h-[260px] flex-shrink-0">
                    <div className="absolute inset-0 rounded-[28px] bg-[#1F1B16] shadow-md border border-[#3A3530]/20">
                      <div className="absolute top-[6px] left-[6px] right-[6px] bottom-[6px] rounded-[22px] bg-[#FBF8F4] dark:bg-[#1C1C1A] overflow-hidden p-2 pt-5 transition-colors duration-200">
                        <div className="absolute top-[4px] left-1/2 -translate-x-1/2 w-[40px] h-[10px] bg-[#1F1B16] rounded-full z-10" />
                        
                        <div className="w-full h-full flex flex-col justify-between">
                          <div className="h-6 w-full flex items-center justify-between px-1">
                            <span className="text-[7px] font-bold text-[#A89F94] dark:text-[#6C6C64]">Nestly</span>
                            <div className="w-1 h-1 rounded-full bg-[#7A9B7E]" />
                          </div>
                          <div className="bg-white dark:bg-[#242422] rounded-lg p-2 border border-[#F2EDE6] dark:border-[#2A2A28] text-center shadow-xs my-auto transition-colors duration-200">
                            <span className="block text-[6px] uppercase tracking-wider text-[#A89F94] dark:text-[#6C6C64]">Synced Now</span>
                            <span className="block text-xs font-bold text-[#1F1B16] dark:text-[#FAFAF8] mt-0.5">90ml Feed</span>
                          </div>
                          <div className="h-5 w-full bg-[#7A9B7E]/10 border border-[#7A9B7E]/20 rounded-md flex items-center justify-center">
                            <span className="text-[6px] font-bold uppercase text-[#7A9B7E]">Glance view</span>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* Step 3 */}
              <div className="md:grid md:grid-cols-2 md:gap-16 md:items-center">
                
                {/* Text */}
                <div className="reveal-left flex flex-col items-start text-left mb-8 md:mb-0">
                  <span className="text-6xl md:text-7xl font-bold text-[#7A9B7E]/20 dark:text-[#8FB89A]/20 tracking-tight leading-none">03</span>
                  <h3 className="text-2xl font-bold text-[#1F1B16] dark:text-[#FAFAF8] mt-2">Glance, don't search</h3>
                  <p className="text-base text-[#6B6259] dark:text-[#9C9C94] mt-3 leading-relaxed">
                    Open the app and immediately see when baby last ate, how much, and who logged it. No scrolling. No asking. Just answers.
                  </p>
                </div>

                {/* Visual Mockup */}
                <div className="reveal-scale relative w-[220px] h-[440px] mx-auto flex-shrink-0">
                  <div className="absolute inset-0 rounded-[40px] bg-[#1F1B16] shadow-xl border border-[#3A3530]/20">
                    <div className="absolute top-[10px] left-[10px] right-[10px] bottom-[10px] rounded-[32px] bg-[#FBF8F4] dark:bg-[#1C1C1A] overflow-hidden flex flex-col justify-between p-3.5 pb-5 transition-colors duration-200">
                      
                      {/* Notch */}
                      <div className="absolute top-[6px] left-1/2 -translate-x-1/2 w-[70px] h-[18px] bg-[#1F1B16] rounded-full z-10" />

                      <div className="px-3 pt-6 flex justify-between items-center w-full">
                        <span className="text-[8px] font-bold text-[#A89F94] dark:text-[#6C6C64] uppercase tracking-widest">Teeto</span>
                        <div className="w-1 h-1 rounded-full bg-[#7A9B7E]" />
                      </div>

                      <div className="flex-1 flex flex-col items-center justify-center text-center mt-3">
                        <span className="text-[7px] uppercase tracking-wider text-[#A89F94] dark:text-[#6C6C64] font-medium">Last Feed</span>
                        <span className="text-[28px] font-bold text-[#1F1B16] dark:text-[#FAFAF8] leading-none mt-0.5 tracking-tight">2h 14m</span>
                        <span className="text-[10px] text-[#6B6259] dark:text-[#9C9C94] mt-0.5">90ml · Mum</span>
                      </div>

                      {/* Simple Bottom Row */}
                      <div className="grid grid-cols-3 gap-1 pt-3">
                        <div className="h-8 rounded-lg bg-white dark:bg-[#242422] border border-[#F2EDE6] dark:border-[#2A2A28] text-[8px] flex items-center justify-center font-bold text-[#6B6259] dark:text-[#9C9C94] shadow-xs transition-colors duration-200">Feed</div>
                        <div className="h-8 rounded-lg bg-white dark:bg-[#242422] border border-[#F2EDE6] dark:border-[#2A2A28] text-[8px] flex items-center justify-center font-bold text-[#6B6259] dark:text-[#9C9C94] shadow-xs transition-colors duration-200">Nappy</div>
                        <div className="h-8 rounded-lg bg-white dark:bg-[#242422] border border-[#F2EDE6] dark:border-[#2A2A28] text-[8px] flex items-center justify-center font-bold text-[#6B6259] dark:text-[#9C9C94] shadow-xs transition-colors duration-200">Sleep</div>
                      </div>

                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* SECTION 4: KEY FEATURES */}
        <section id="features" className="py-20 md:py-28 bg-[#FBF8F4] dark:bg-[#111110] transition-colors duration-200">
          <div className="max-w-6xl mx-auto px-6">
            
            <h2 
              className="reveal text-3xl md:text-4xl font-bold text-[#1F1B16] dark:text-[#FAFAF8] text-center tracking-tight"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              Built for the hardest job you'll ever love.
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-14 stagger-children">
              
              <div className="reveal bg-white dark:bg-[#1C1C1A] rounded-2xl p-6 md:p-8 border border-[#F2EDE6] dark:border-[#2A2A28] flex gap-4 items-start shadow-xs hover:bg-[#FBF8F4]/80 dark:hover:bg-[#242422] hover:-translate-y-1 hover:shadow-xl hover:border-[#7A9B7E]/30 dark:hover:border-[#8FB89A]/30 transition-all duration-200">
                <div className="w-12 h-12 rounded-full bg-[#7A9B7E]/10 dark:bg-[#8FB89A]/10 flex items-center justify-center text-[#7A9B7E] dark:text-[#8FB89A] flex-shrink-0">
                  <Wifi size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#1F1B16] dark:text-[#FAFAF8]">Works without signal</h3>
                  <p className="text-sm text-[#6B6259] dark:text-[#9C9C94] mt-2 leading-relaxed">
                    Log entries in the nursery, on a flight, in a dead zone. Everything saves locally and syncs when connection returns.
                  </p>
                </div>
              </div>

              <div className="reveal bg-white dark:bg-[#1C1C1A] rounded-2xl p-6 md:p-8 border border-[#F2EDE6] dark:border-[#2A2A28] flex gap-4 items-start shadow-xs hover:bg-[#FBF8F4]/80 dark:hover:bg-[#242422] hover:-translate-y-1 hover:shadow-xl hover:border-[#7A9B7E]/30 dark:hover:border-[#8FB89A]/30 transition-all duration-200">
                <div className="w-12 h-12 rounded-full bg-[#7A9B7E]/10 dark:bg-[#8FB89A]/10 flex items-center justify-center text-[#7A9B7E] dark:text-[#8FB89A] flex-shrink-0">
                  <Users size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#1F1B16] dark:text-[#FAFAF8]">Shared between two carers</h3>
                  <p className="text-sm text-[#6B6259] dark:text-[#9C9C94] mt-2 leading-relaxed">
                    Both parents see the same log, always up to date. No more morning handover confusion or forgotten details.
                  </p>
                </div>
              </div>

              <div className="reveal bg-white dark:bg-[#1C1C1A] rounded-2xl p-6 md:p-8 border border-[#F2EDE6] dark:border-[#2A2A28] flex gap-4 items-start shadow-xs hover:bg-[#FBF8F4]/80 dark:hover:bg-[#242422] hover:-translate-y-1 hover:shadow-xl hover:border-[#7A9B7E]/30 dark:hover:border-[#8FB89A]/30 transition-all duration-200">
                <div className="w-12 h-12 rounded-full bg-[#7A9B7E]/10 dark:bg-[#8FB89A]/10 flex items-center justify-center text-[#7A9B7E] dark:text-[#8FB89A] flex-shrink-0">
                  <Shield size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#1F1B16] dark:text-[#FAFAF8]">Your data, your control</h3>
                  <p className="text-sm text-[#6B6259] dark:text-[#9C9C94] mt-2 leading-relaxed">
                    Stored securely in the EU. Export everything as CSV. Delete your account anytime. No ads. No tracking. No selling your data.
                  </p>
                </div>
              </div>

              <div className="reveal bg-white dark:bg-[#1C1C1A] rounded-2xl p-6 md:p-8 border border-[#F2EDE6] dark:border-[#2A2A28] flex gap-4 items-start shadow-xs hover:bg-[#FBF8F4]/80 dark:hover:bg-[#242422] hover:-translate-y-1 hover:shadow-xl hover:border-[#7A9B7E]/30 dark:hover:border-[#8FB89A]/30 transition-all duration-200">
                <div className="w-12 h-12 rounded-full bg-[#9B7E9B]/10 dark:bg-[#B399B3]/10 flex items-center justify-center text-[#9B7E9B] dark:text-[#B399B3] flex-shrink-0">
                  <Moon size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#1F1B16] dark:text-[#FAFAF8]">Designed for 3am</h3>
                  <p className="text-sm text-[#6B6259] dark:text-[#9C9C94] mt-2 leading-relaxed">
                    Dark mode. Large buttons. One-handed use. Nestly stays calm when everything else feels chaotic.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 5: FAQ (Dark section for contrast) */}
        <section id="faq" className="py-20 md:py-28 bg-[#1F1B16] dark:bg-[#0A0A09] transition-colors duration-200">
          <div className="max-w-6xl mx-auto px-6">
            
            <h2 
              className="reveal text-3xl md:text-4xl font-bold text-[#FAFAF8] text-center tracking-tight"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              Common questions from parents
            </h2>

            {/* Structured 2-column FAQ grid on desktop */}
            <div className="reveal grid grid-cols-1 md:grid-cols-2 gap-4 mt-14">
              {faqItems.map((item, index) => {
                const isOpen = openFaqIndex === index
                return (
                  <div 
                    key={index} 
                    onClick={() => toggleFaq(index)}
                    className={`bg-white dark:bg-[#1C1C1A] border ${isOpen ? 'border-[#7A9B7E] dark:border-[#8FB89A] border-l-4 border-l-[#7A9B7E] dark:border-l-[#8FB89A]' : 'border-[#F2EDE6] dark:border-[#2A2A28]'} rounded-xl p-5 cursor-pointer transition-all duration-200 hover:bg-[#FBF8F4]/80 dark:hover:bg-[#242422] flex flex-col justify-between`}
                  >
                    <div className="flex items-center justify-between gap-4 w-full">
                      <span className="text-sm font-semibold text-[#1F1B16] dark:text-[#FAFAF8]">{item.question}</span>
                      <button
                        type="button"
                        className="w-8 h-8 rounded-full bg-[#1F1B16] dark:bg-[#FAFAF8] flex items-center justify-center flex-shrink-0 transition-transform duration-300"
                        aria-label={isOpen ? "Collapse" : "Expand"}
                      >
                        {isOpen ? (
                          <Minus size={16} className="text-white dark:text-[#111110]" />
                        ) : (
                          <Plus size={16} className="text-white dark:text-[#111110]" />
                        )}
                      </button>
                    </div>
                    
                    {isOpen && (
                      <div className="mt-3 text-sm text-[#6B6259] dark:text-[#9C9C94] leading-relaxed select-text animate-fade-in border-t border-[#F2EDE6]/40 dark:border-[#2A2A28]/40 pt-3">
                        {item.answer}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* SECTION 6: FINAL CTA */}
        <section id="signup" className="py-20 md:py-28 bg-[#FBF8F4] dark:bg-[#111110] transition-colors duration-200">
          <div className="max-w-2xl mx-auto px-6 text-center">
            
            <h2 
              className="reveal text-3xl md:text-4xl font-bold text-[#1F1B16] dark:text-[#FAFAF8] tracking-tight"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              Start logging in 30 seconds.
            </h2>
            <p className="reveal text-lg text-[#6B6259] dark:text-[#9C9C94] mt-4 leading-relaxed max-w-md mx-auto">
              Free. No app store. No credit card. Just your email.
            </p>

            {!sent ? (
              <div className="reveal mt-10 max-w-md mx-auto">
                <form onSubmit={handleSignUp} className="flex flex-col sm:flex-row gap-3 w-full">
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
                    className="w-full sm:flex-1 h-[52px] px-4 rounded-xl bg-white dark:bg-[#1C1C1A] border border-[#F2EDE6] dark:border-[#2A2A28] text-base text-[#1F1B16] dark:text-[#FAFAF8] placeholder:text-[#A89F94] dark:placeholder:text-[#6C6C64] focus:outline-none focus:ring-2 focus:ring-[#7A9B7E] transition-all duration-200 shadow-xs"
                  />
                  
                  <button 
                    type="submit" 
                    disabled={isSending || !email.trim()}
                    className="w-full sm:w-auto sm:px-8 h-[52px] rounded-xl bg-[#7A9B7E] dark:bg-[#8FB89A] hover:bg-[#6A8B6E] dark:hover:bg-[#7AA888] active:bg-[#5A7B5E] dark:active:bg-[#6A9878] disabled:opacity-50 text-white dark:text-[#111110] font-semibold text-base shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg flex items-center justify-center"
                  >
                    {isSending ? 'Sending link...' : 'Start free'}
                  </button>
                </form>

                {error && (
                  <div className="mt-4 text-sm text-[#C97064] bg-[#C97064]/10 p-3 rounded-xl border border-[#C97064]/20 text-center animate-pulse">
                    {error}
                  </div>
                )}

                <p className="text-xs text-[#A89F94] dark:text-[#6C6C64] mt-4 leading-normal">
                  No password needed. We'll email you a secure sign-in link.
                </p>
              </div>
            ) : (
              <div className="mt-10 flex flex-col items-center text-center py-6 animate-fade-in">
                <style>{`
                  @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                  }
                  .animate-fade-in {
                    animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                  }
                `}</style>
                <div className="w-16 h-16 rounded-full bg-[#7A9B7E]/10 dark:bg-[#8FB89A]/10 flex items-center justify-center text-[#7A9B7E] dark:text-[#8FB89A] mb-6">
                  <Mail size={32} strokeWidth={1.5} />
                </div>
                <h3 
                  className="text-xl font-semibold text-[#1F1B16] dark:text-[#FAFAF8] tracking-tight"
                  style={{ fontFamily: "'DM Serif Display', serif" }}
                >
                  Check your email
                </h3>
                <p className="text-sm text-[#6B6259] dark:text-[#9C9C94] mt-2 max-w-[280px] leading-relaxed">
                  We sent a sign-in link to <span className="font-semibold text-[#1F1B16] dark:text-[#FAFAF8]">{email}</span>. Click the link to launch Nestly.
                </p>
              </div>
            )}

          </div>
        </section>

        {/* SECTION 7: FOOTER */}
        <footer className="border-t border-[#F2EDE6] dark:border-[#2A2A28] py-8 px-6 bg-[#FBF8F4] dark:bg-[#111110] transition-colors duration-200">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left select-text">
            {/* Left: Logo + Wordmark */}
            <a href="#" className="flex items-center gap-2 text-sm font-semibold text-[#1F1B16] dark:text-[#FAFAF8] tracking-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>
              <NestlyLogo size={24} className="text-[#7A9B7E] dark:text-[#8FB89A]" />
              <span>Nestly</span>
            </a>
            
            <div className="flex gap-6">
              <a 
                href="/privacy.html" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs text-[#A89F94] dark:text-[#6C6C64] hover:text-[#1F1B16] dark:hover:text-[#FAFAF8] transition-colors duration-200"
              >
                Privacy Policy
              </a>
              <a 
                href="/terms.html" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs text-[#A89F94] dark:text-[#6C6C64] hover:text-[#1F1B16] dark:hover:text-[#FAFAF8] transition-colors duration-200"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </footer>

      </div>

    </div>
  );
}
