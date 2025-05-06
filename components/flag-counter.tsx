"use client"
import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Globe2, Users, TrendingUp, Flag } from "lucide-react"
// Remove analytics tracking for now
// import { track } from '@vercel/analytics'

export default function FlagCounter() {
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [iframeError, setIframeError] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Remove analytics tracking
  // useEffect(() => {
  //   track('Flag Counter View', {}, { flags: ['flag-counter'] })
  // }, [])

  // Check if iframe loaded successfully
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    const handleLoad = () => {
      setIframeLoaded(true)
      // track('Flag Counter Loaded', {}, { flags: ['flag-counter'] })
    }

    const handleError = () => {
      setIframeError(true)
      // track('Flag Counter Error', {}, { flags: ['flag-counter'] })
    }

    iframe.addEventListener("load", handleLoad)
    iframe.addEventListener("error", handleError)

    return () => {
      iframe.removeEventListener("load", handleLoad)
      iframe.removeEventListener("error", handleError)
    }
  }, [])

  const stats = [
    { icon: <Globe2 className="w-5 h-5 text-[#a58af8]" />, label: "Countries", value: "12" },
    { icon: <Users className="w-5 h-5 text-[#a58af8]" />, label: "Pageviews", value: "1,298" },
    { icon: <TrendingUp className="w-5 h-5 text-[#a58af8]" />, label: "Active Users", value: iframeLoaded ? "Live" : "Loading" },
    { icon: <Flag className="w-5 h-5 text-[#a58af8]" />, label: "Flags Collected", value: "12" },
  ]

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(165,138,248,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(165,138,248,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-[10%] right-[20%] w-[40vw] h-[40vw] rounded-full bg-[#a58af8]/10 blur-[120px]" />
        <div className="absolute bottom-[20%] left-[10%] w-[30vw] h-[30vw] rounded-full bg-[#facc15]/10 blur-[80px]" />
        <motion.div animate={{ x: ["5%", "-5%"], y: ["3%", "-3%"] }} transition={{ x: { duration: 22, repeat: Infinity, repeatType: "reverse" }, y: { duration: 18, repeat: Infinity, repeatType: "reverse" } }} className="absolute top-[30%] left-[30%] w-[25vw] h-[25vw] rounded-full bg-[#a58af8]/5 blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-12">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} className="text-4xl sm:text-5xl font-bold mb-4 relative inline-block">
            <span className="text-gradient-gold">Global Community</span>
            <motion.div animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0 -z-10 blur-xl bg-gradient-to-r from-[#a58af8]/20 via-[#facc15]/20 to-[#a58af8]/20 rounded-full" />
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }} className="max-w-2xl mx-auto text-white/70 text-sm">
            Join our growing global community of stakers and earn exclusive flags for your achievements.
          </motion.p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 * index }} className="bg-[#0f0c1a]/50 backdrop-blur-sm border border-[#a58af8] rounded-xl p-4 shadow-[0_0_15px_rgba(165,138,248,0.3)] relative overflow-hidden">
              <motion.div className="absolute inset-0 border border-[#a58af8] rounded-xl" animate={{ boxShadow: ["0 0 5px rgba(165,138,248,0.3)", "0 0 20px rgba(165,138,248,0.5)", "0 0 5px rgba(165,138,248,0.3)"] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[#0f0c1a] border border-[#a58af8]/30 flex items-center justify-center mb-3">
                  {stat.icon}
                </div>
                <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm text-white/60">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-[#0f0c1a]/50 backdrop-blur-sm border border-[#a58af8] rounded-2xl p-4 shadow-[0_0_15px_rgba(165,138,248,0.3)] relative overflow-hidden w-full max-w-[400px] mx-auto">
          <motion.div className="absolute inset-0 border border-[#a58af8] rounded-2xl" animate={{ boxShadow: ["0 0 5px rgba(165,138,248,0.3)", "0 0 20px rgba(165,138,248,0.5)", "0 0 5px rgba(165,138,248,0.3)"] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
          <div className="relative z-10 flex justify-center items-center min-h-[180px]">
            {iframeError ? (
              <div className="text-white/70 text-center">Failed to load flag counter. Please try again later.</div>
            ) : (
              <iframe ref={iframeRef} src="https://flagcounter.com/count/Polking/bg_0F0824/txt_FFFFFF/border_A58AF8/columns_3/maxflags_100/viewers_Polking+Community/labels_1/pageviews_1/flags_1/" className="w-[320px] h-[160px] sm:w-[360px] sm:h-[180px] md:w-[400px] md:h-[200px] border-0" style={{ maxWidth: '100%', display: 'block', margin: '0 auto' }} title="Flag Counter" />
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
