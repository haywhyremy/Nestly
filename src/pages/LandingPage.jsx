import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PrimaryButton } from '../components/buttons/PrimaryButton'
import { 
  MessageSquare, 
  WifiOff, 
  HelpCircle, 
  Wifi, 
  Users, 
  Shield, 
  Moon, 
  ChevronDown, 
  ChevronUp, 
  Mail 
} from 'lucide-react'

const faqItems = [
  {
    question: "Is Nestly really free?",
    answer: "Yes. Nestly is free. We may add premium features later, but the core logging will always be free."
  },
  {
    question: "Does it work without internet?",
    answer: "Yes. Nestly saves everything locally on your phone. When you reconnect, it syncs automatically with your partner's device."
  },
  {
    question: "Can I use it with my nanny or grandparent?",
    answer: "Right now, Nestly supports two carers per household. We're adding support for more carers soon."
  },
  {
    question: "Is my data safe?",
    answer: "Your data is stored securely in the EU (London). We never sell your data. You can export or delete everything from Settings."
  },
  {
    question: "Do I need to download an app?",
    answer: "No app store needed. Nestly is a web app — open it in your browser and add it to your home screen for the best experience."
  },
  {
    question: "What if we both log at the same time?",
    answer: "Nestly detects potential duplicates and lets you calmly resolve them. No data is ever silently deleted."
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
    <div className="w-full bg-[#FBF8F4] text-[#1F1B16] font-system select-none overflow-x-hidden">
      
      {/* SECTION 1: HERO */}
      <section className="min-h-dvh flex items-center bg-[#FBF8F4] py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-6 w-full md:grid md:grid-cols-2 md:gap-12 md:items-center">
          
          {/* Left Column (Text) */}
          <div className="text-left flex flex-col items-start mb-12 md:mb-0">
            <span className="inline-block bg-[#7A9B7E]/10 text-[#7A9B7E] text-xs font-semibold px-4 py-1.5 rounded-full tracking-wide">
              Simple baby tracking for two
            </span>
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1F1B16] leading-[1.1] mt-6 tracking-tight"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              The feed log that never gets lost.
            </h1>
            <p className="text-lg text-[#6B6259] mt-6 leading-relaxed max-w-lg">
              You and your partner. One calm, shared log. Feeds, nappies, sleep — always in sync, even offline.
            </p>
            
            <div className="flex flex-wrap gap-3 mt-8 w-full sm:w-auto">
              <PrimaryButton 
                onClick={(e) => handleScrollToSection(e, 'signup')}
                className="w-full sm:w-auto sm:px-8 shadow-sm font-semibold !h-12"
              >
                Start free →
              </PrimaryButton>
              <a
                href="#how-it-works"
                onClick={(e) => handleScrollToSection(e, 'how-it-works')}
                className="px-6 py-3 rounded-xl border-2 border-[#1F1B16] text-[#1F1B16] text-sm font-semibold hover:bg-[#1F1B16] hover:text-[#FBF8F4] transition-colors flex items-center justify-center shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A9B7E]"
              >
                See how it works
              </a>
            </div>

            <p className="text-sm text-[#A89F94] mt-8">
              Trusted by parents who retired the WhatsApp group.
            </p>
          </div>

          {/* Right Column (iPhone Mockup) */}
          <div className="relative w-[280px] h-[560px] md:w-[300px] md:h-[600px] mx-auto flex-shrink-0">
            {/* Phone outer frame */}
            <div className="absolute inset-0 rounded-[50px] bg-[#1F1B16] shadow-[0_20px_60px_rgba(31,27,22,0.3)] border border-[#3A3530]/20">
              
              {/* Screen area */}
              <div className="absolute top-[12px] left-[12px] right-[12px] bottom-[12px] rounded-[40px] bg-[#FBF8F4] overflow-hidden flex flex-col justify-between p-4 pb-6">
                
                {/* Dynamic island */}
                <div className="absolute top-[8px] left-1/2 -translate-x-1/2 w-[90px] h-[25px] bg-[#1F1B16] rounded-full z-10 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-black/60 mr-1" />
                </div>

                {/* Status area */}
                <div className="px-5 pt-10 flex justify-between items-center w-full">
                  <span className="text-[10px] font-bold text-[#A89F94] uppercase tracking-widest">Teeto</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#7A9B7E] animate-pulse" />
                </div>

                {/* Spacer */}
                <div className="mt-8 flex-1 flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-[#A89F94] font-medium">Last Feed</span>
                  <span className="text-[40px] font-bold text-[#1F1B16] leading-none mt-1 tracking-tight" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    2h 14m
                  </span>
                  <span className="text-[13px] text-[#6B6259] mt-1 font-medium">90ml · Mum</span>

                  {/* Secondary rows */}
                  <div className="w-full mt-8 px-5 space-y-2.5">
                    <div className="flex items-center justify-between bg-white border border-[#F2EDE6] rounded-xl px-3 py-2.5 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#C49B7A]" />
                        <span className="text-[11px] text-[#6B6259]">Last nappy</span>
                      </div>
                      <span className="text-[11px] font-semibold text-[#1F1B16]">45m · Wet</span>
                    </div>

                    <div className="flex items-center justify-between bg-white border border-[#F2EDE6] rounded-xl px-3 py-2.5 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#9B7E9B]" />
                        <span className="text-[11px] text-[#6B6259]">Sleep</span>
                      </div>
                      <span className="text-[11px] font-semibold text-[#9B7E9B] animate-pulse">Ongoing · 38m</span>
                    </div>
                  </div>
                </div>

                {/* Bottom buttons */}
                <div className="absolute bottom-6 left-4 right-4 flex gap-2">
                  <div className="flex-1 py-2.5 rounded-xl text-[11px] font-bold text-center uppercase tracking-wider bg-[#7A9B7E]/15 text-[#7A9B7E] border border-[#7A9B7E]/10">
                    Feed
                  </div>
                  <div className="flex-1 py-2.5 rounded-xl text-[11px] font-bold text-center uppercase tracking-wider bg-[#C49B7A]/15 text-[#C49B7A] border border-[#C49B7A]/10">
                    Nappy
                  </div>
                  <div className="flex-1 py-2.5 rounded-xl text-[11px] font-bold text-center uppercase tracking-wider bg-[#9B7E9B]/15 text-[#9B7E9B] border border-[#9B7E9B]/10">
                    Sleep
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 2: PAIN POINTS */}
      <section id="pain-points" className="py-20 md:py-28 bg-[#FBF8F4] border-t border-[#F2EDE6]/40">
        <div className="max-w-6xl mx-auto px-6">
          
          <h2 
            className="text-3xl md:text-4xl font-bold text-[#1F1B16] text-center tracking-tight"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            WhatsApp wasn't built for this.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
            
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#F2EDE6] hover:shadow-lg transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-full bg-[#7A9B7E]/10 flex items-center justify-center mb-6 text-[#7A9B7E]">
                  <MessageSquare size={22} />
                </div>
                <h3 className="text-lg font-semibold text-[#1F1B16]">Messages get buried</h3>
                <p className="text-sm text-[#6B6259] mt-2.5 leading-relaxed">
                  "Baby fed and slept" — but how much? When was the last nappy? You're scrolling through 47 messages in a busy conversation thread to find out.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#F2EDE6] hover:shadow-lg transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-full bg-[#7A9B7E]/10 flex items-center justify-center mb-6 text-[#7A9B7E]">
                  <WifiOff size={22} />
                </div>
                <h3 className="text-lg font-semibold text-[#1F1B16]">Signal drops out</h3>
                <p className="text-sm text-[#6B6259] mt-2.5 leading-relaxed">
                  The nursery. A long drive. The clinic waiting room. Right when you need to log, the connection dies and standard chats freeze. Signal shouldn't block baby care.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#F2EDE6] hover:shadow-lg transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-full bg-[#7A9B7E]/10 flex items-center justify-center mb-6 text-[#7A9B7E]">
                  <HelpCircle size={22} />
                </div>
                <h3 className="text-lg font-semibold text-[#1F1B16]">"Did you already feed her?"</h3>
                <p className="text-sm text-[#6B6259] mt-2.5 leading-relaxed">
                  The 3am question that no exhausted parent should have to ask or answer. Baby's records should be visible ambiently, without requiring conversation.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS */}
      <section id="how-it-works" className="py-20 md:py-28 bg-[#F2EDE6]">
        <div className="max-w-6xl mx-auto px-6">
          
          <h2 
            className="text-3xl md:text-4xl font-bold text-[#1F1B16] text-center tracking-tight"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Three taps. Seven seconds.
          </h2>
          <p className="text-lg text-[#6B6259] text-center mt-3 max-w-md mx-auto leading-relaxed">
            No typing. No scrolling. Just tap and go.
          </p>

          <div className="mt-16 space-y-24">
            
            {/* Step 1 */}
            <div className="md:grid md:grid-cols-2 md:gap-16 md:items-center">
              
              {/* Text */}
              <div className="flex flex-col items-start text-left mb-8 md:mb-0">
                <span className="text-6xl md:text-7xl font-bold text-[#7A9B7E]/20 tracking-tight leading-none">01</span>
                <h3 className="text-2xl font-bold text-[#1F1B16] mt-2">Tap to log</h3>
                <p className="text-base text-[#6B6259] mt-3 leading-relaxed">
                  Feed, nappy, or sleep — one tap opens a pre-filled form. Smart defaults dynamically estimate volumes and times so you usually just hit confirm.
                </p>
              </div>

              {/* Visual Mockup */}
              <div className="relative w-[220px] h-[440px] mx-auto flex-shrink-0">
                <div className="absolute inset-0 rounded-[40px] bg-[#1F1B16] shadow-xl border border-[#3A3530]/20">
                  <div className="absolute top-[10px] left-[10px] right-[10px] bottom-[10px] rounded-[32px] bg-[#FBF8F4] overflow-hidden flex flex-col justify-between p-3.5 pb-5">
                    
                    {/* Notch */}
                    <div className="absolute top-[6px] left-1/2 -translate-x-1/2 w-[70px] h-[18px] bg-[#1F1B16] rounded-full z-10" />

                    <span className="font-bold text-[#1F1B16] text-[13px] px-2 pt-6 block text-left">Log feed</span>
                    
                    <div className="flex bg-[#F2EDE6] rounded-lg p-0.5 mt-2">
                      <div className="flex-1 text-center py-1 bg-[#7A9B7E] text-white rounded-md font-semibold text-[10px] shadow-sm">Bottle</div>
                      <div className="flex-1 text-center py-1 text-[#6B6259] font-medium text-[10px]">Breast</div>
                    </div>

                    <div className="mt-4 space-y-1 px-1">
                      <span className="block text-[9px] font-bold text-[#6B6259] uppercase tracking-wider">Volume</span>
                      <div className="flex justify-between items-center bg-white border border-[#F2EDE6] rounded-lg px-3 py-1.5 shadow-sm">
                        <span className="font-bold text-[#6B6259] text-xs">-</span>
                        <span className="font-bold text-[#1F1B16] text-sm">90ml</span>
                        <span className="font-bold text-[#6B6259] text-xs">+</span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-1 px-1">
                      <span className="block text-[9px] font-bold text-[#6B6259] uppercase tracking-wider">Time</span>
                      <div className="flex justify-between items-center bg-white border border-[#F2EDE6] rounded-lg px-3 py-2 shadow-sm">
                        <span className="text-[11px] text-[#1F1B16]">Now</span>
                        <span className="text-[10px] text-[#A89F94]">Select</span>
                      </div>
                    </div>

                    <div className="mt-auto pt-3">
                      <div className="w-full py-2.5 bg-[#7A9B7E] text-white text-center font-bold rounded-xl tracking-wider uppercase text-[10px] shadow-sm">
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
              <div className="flex flex-col items-start text-left mb-8 md:mb-0 md:order-2">
                <span className="text-6xl md:text-7xl font-bold text-[#7A9B7E]/20 tracking-tight leading-none">02</span>
                <h3 className="text-2xl font-bold text-[#1F1B16] mt-2">It syncs automatically</h3>
                <p className="text-base text-[#6B6259] mt-3 leading-relaxed">
                  Your partner sees the entry on their phone instantly. Works fully offline — logs save locally in database storage and auto-sync when network returns.
                </p>
              </div>

              {/* Visual Mockup (Ordered 1 on Desktop) */}
              <div className="md:order-1 flex items-center justify-center gap-4 relative max-w-sm mx-auto w-full py-6">
                
                {/* Phone Left */}
                <div className="relative w-[130px] h-[260px] flex-shrink-0">
                  <div className="absolute inset-0 rounded-[28px] bg-[#1F1B16] shadow-md border border-[#3A3530]/20">
                    <div className="absolute top-[6px] left-[6px] right-[6px] bottom-[6px] rounded-[22px] bg-[#FBF8F4] overflow-hidden p-2 pt-5">
                      <div className="absolute top-[4px] left-1/2 -translate-x-1/2 w-[40px] h-[10px] bg-[#1F1B16] rounded-full z-10" />
                      
                      <div className="w-full h-full flex flex-col justify-between">
                        <div className="h-6 w-full flex items-center justify-between px-1">
                          <span className="text-[7px] font-bold text-[#A89F94]">Nestly</span>
                          <div className="w-1 h-1 rounded-full bg-[#7A9B7E]" />
                        </div>
                        <div className="bg-white rounded-lg p-2 border border-[#F2EDE6] text-center shadow-xs my-auto">
                          <span className="block text-[6px] uppercase tracking-wider text-[#A89F94]">Logged by Mum</span>
                          <span className="block text-xs font-bold text-[#1F1B16] mt-0.5">90ml Feed</span>
                        </div>
                        <div className="h-5 w-full bg-[#7A9B7E]/10 border border-[#7A9B7E]/20 rounded-md flex items-center justify-center">
                          <span className="text-[6px] font-bold uppercase text-[#7A9B7E]">Success</span>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Curved Arrow */}
                <div className="text-[#7A9B7E] flex-shrink-0 z-10">
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
                    <div className="absolute top-[6px] left-[6px] right-[6px] bottom-[6px] rounded-[22px] bg-[#FBF8F4] overflow-hidden p-2 pt-5">
                      <div className="absolute top-[4px] left-1/2 -translate-x-1/2 w-[40px] h-[10px] bg-[#1F1B16] rounded-full z-10" />
                      
                      <div className="w-full h-full flex flex-col justify-between">
                        <div className="h-6 w-full flex items-center justify-between px-1">
                          <span className="text-[7px] font-bold text-[#A89F94]">Nestly</span>
                          <div className="w-1 h-1 rounded-full bg-[#7A9B7E]" />
                        </div>
                        <div className="bg-white rounded-lg p-2 border border-[#F2EDE6] text-center shadow-xs my-auto">
                          <span className="block text-[6px] uppercase tracking-wider text-[#A89F94]">Synced Now</span>
                          <span className="block text-xs font-bold text-[#1F1B16] mt-0.5">90ml Feed</span>
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
              <div className="flex flex-col items-start text-left mb-8 md:mb-0">
                <span className="text-6xl md:text-7xl font-bold text-[#7A9B7E]/20 tracking-tight leading-none">03</span>
                <h3 className="text-2xl font-bold text-[#1F1B16] mt-2">Glance, don't search</h3>
                <p className="text-base text-[#6B6259] mt-3 leading-relaxed">
                  Open the app — instantly view when baby last fed, how much was consumed, and who logged it. No scroll search through messaging threads.
                </p>
              </div>

              {/* Visual Mockup */}
              <div className="relative w-[220px] h-[440px] mx-auto flex-shrink-0">
                <div className="absolute inset-0 rounded-[40px] bg-[#1F1B16] shadow-xl border border-[#3A3530]/20">
                  <div className="absolute top-[10px] left-[10px] right-[10px] bottom-[10px] rounded-[32px] bg-[#FBF8F4] overflow-hidden flex flex-col justify-between p-3.5 pb-5">
                    
                    {/* Notch */}
                    <div className="absolute top-[6px] left-1/2 -translate-x-1/2 w-[70px] h-[18px] bg-[#1F1B16] rounded-full z-10" />

                    <div className="px-3 pt-6 flex justify-between items-center w-full">
                      <span className="text-[8px] font-bold text-[#A89F94] uppercase tracking-widest">Teeto</span>
                      <div className="w-1 h-1 rounded-full bg-[#7A9B7E]" />
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center text-center mt-3">
                      <span className="text-[7px] uppercase tracking-wider text-[#A89F94] font-medium">Last Feed</span>
                      <span className="text-[28px] font-bold text-[#1F1B16] leading-none mt-0.5 tracking-tight">2h 14m</span>
                      <span className="text-[10px] text-[#6B6259] mt-0.5">90ml · Mum</span>
                    </div>

                    {/* Simple Bottom Row */}
                    <div className="grid grid-cols-3 gap-1 pt-3">
                      <div className="h-8 rounded-lg bg-white border border-[#F2EDE6] text-[8px] flex items-center justify-center font-bold text-[#6B6259] shadow-xs">Feed</div>
                      <div className="h-8 rounded-lg bg-white border border-[#F2EDE6] text-[8px] flex items-center justify-center font-bold text-[#6B6259] shadow-xs">Nappy</div>
                      <div className="h-8 rounded-lg bg-white border border-[#F2EDE6] text-[8px] flex items-center justify-center font-bold text-[#6B6259] shadow-xs">Sleep</div>
                    </div>

                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* SECTION 4: KEY FEATURES */}
      <section className="py-20 md:py-28 bg-[#FBF8F4]">
        <div className="max-w-6xl mx-auto px-6">
          
          <h2 
            className="text-3xl md:text-4xl font-bold text-[#1F1B16] text-center tracking-tight"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Built for exhausted parents.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-14">
            
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#F2EDE6] flex gap-4 items-start shadow-xs">
              <div className="w-12 h-12 rounded-full bg-[#7A9B7E]/10 flex items-center justify-center text-[#7A9B7E] flex-shrink-0">
                <Wifi size={22} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#1F1B16]">Works offline</h3>
                <p className="text-sm text-[#6B6259] mt-2 leading-relaxed">
                  Log entries with zero signal. Everything saves locally and automatically syncs the second you reconnect.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#F2EDE6] flex gap-4 items-start shadow-xs">
              <div className="w-12 h-12 rounded-full bg-[#7A9B7E]/10 flex items-center justify-center text-[#7A9B7E] flex-shrink-0">
                <Users size={22} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#1F1B16]">Shared by two</h3>
                <p className="text-sm text-[#6B6259] mt-2 leading-relaxed">
                  Both carers see the same log, always synchronized. No more conflicting messages or timestamp thread searches.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#F2EDE6] flex gap-4 items-start shadow-xs">
              <div className="w-12 h-12 rounded-full bg-[#7A9B7E]/10 flex items-center justify-center text-[#7A9B7E] flex-shrink-0">
                <Shield size={22} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#1F1B16]">Your data stays yours</h3>
                <p className="text-sm text-[#6B6259] mt-2 leading-relaxed">
                  Stored securely in the EU. Export your complete data as a CSV file or delete your account instantly from Settings. No ads. No tracking.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#F2EDE6] flex gap-4 items-start shadow-xs">
              <div className="w-12 h-12 rounded-full bg-[#9B7E9B]/10 flex items-center justify-center text-[#9B7E9B] flex-shrink-0">
                <Moon size={22} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#1F1B16]">Designed for 3am</h3>
                <p className="text-sm text-[#6B6259] mt-2 leading-relaxed">
                  Calming visual theme variables, large safe tap targets, offline indicators, and silent browser badges. Nestly is calm when you need it most.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 5: FAQ (Dark section for contrast) */}
      <section className="py-20 md:py-28 bg-[#1F1B16]">
        <div className="max-w-3xl mx-auto px-6">
          
          <h2 
            className="text-3xl md:text-4xl font-bold text-[#FBF8F4] text-center tracking-tight"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Questions parents ask.
          </h2>

          <div className="mt-14 space-y-3">
            {faqItems.map((item, index) => {
              const isOpen = openFaqIndex === index
              return (
                <div 
                  key={index} 
                  className="border border-[#3A3530] rounded-xl overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left text-[#FBF8F4] text-sm font-medium hover:bg-[#2A2520] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#7A9B7E]/50"
                  >
                    <span>{item.question}</span>
                    {isOpen ? (
                      <ChevronUp size={16} className="text-[#A89F94] transition-transform ml-2 shrink-0" />
                    ) : (
                      <ChevronDown size={16} className="text-[#A89F94] transition-transform ml-2 shrink-0" />
                    )}
                  </button>
                  
                  {isOpen && (
                    <div className="px-5 pb-4 text-sm text-[#A89F94] leading-relaxed select-text animate-fade-in border-t border-[#3A3530]/40 pt-2">
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
      <section id="signup" className="py-20 md:py-28 bg-[#FBF8F4]">
        <div className="max-w-2xl mx-auto px-6 text-center">
          
          <h2 
            className="text-3xl md:text-4xl font-bold text-[#1F1B16] tracking-tight"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Ready to ditch the WhatsApp group?
          </h2>
          <p className="text-lg text-[#6B6259] mt-4 leading-relaxed max-w-md mx-auto">
            Set up takes 30 seconds. No credit card. No app store.
          </p>

          {!sent ? (
            <div className="mt-10 max-w-md mx-auto">
              <form onSubmit={handleSignUp} className="flex flex-col sm:flex-row gap-3">
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
                  className="flex-1 h-[52px] px-4 rounded-xl bg-white border border-[#F2EDE6] text-base text-[#1F1B16] placeholder:text-[#A89F94] focus:outline-none focus:ring-2 focus:ring-[#7A9B7E] transition-shadow shadow-xs"
                />
                
                <PrimaryButton 
                  type="submit" 
                  disabled={isSending || !email.trim()}
                  className="sm:w-auto sm:px-8 font-semibold shadow-sm"
                >
                  {isSending ? 'Sending link...' : 'Start free'}
                </PrimaryButton>
              </form>

              {error && (
                <div className="mt-4 text-sm text-[#C97064] bg-[#C97064]/10 p-3 rounded-xl border border-[#C97064]/20 text-center animate-pulse">
                  {error}
                </div>
              )}

              <p className="text-xs text-[#A89F94] mt-4 leading-normal">
                No password needed. We'll email you a secure sign-in magic link.
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
              <div className="w-16 h-16 rounded-full bg-[#7A9B7E]/10 flex items-center justify-center text-[#7A9B7E] mb-6">
                <Mail size={32} strokeWidth={1.5} />
              </div>
              <h3 
                className="text-xl font-semibold text-[#1F1B16] tracking-tight"
                style={{ fontFamily: "'DM Serif Display', serif" }}
              >
                Check your email
              </h3>
              <p className="text-sm text-[#6B6259] mt-2 max-w-[280px] leading-relaxed">
                We sent a sign-in link to <span className="font-semibold text-[#1F1B16]">{email}</span>. Click the link to launch Nestly.
              </p>
            </div>
          )}

        </div>
      </section>

      {/* SECTION 7: FOOTER */}
      <footer className="border-t border-[#F2EDE6] py-8 px-6 bg-[#FBF8F4]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left select-text">
          <span className="text-sm font-semibold text-[#1F1B16] tracking-tight">Nestly</span>
          <div className="flex gap-6">
            <a 
              href="/privacy.html" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-xs text-[#A89F94] hover:text-[#1F1B16] transition-colors"
            >
              Privacy Policy
            </a>
            <a 
              href="/terms.html" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-xs text-[#A89F94] hover:text-[#1F1B16] transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
