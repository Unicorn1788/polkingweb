"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const faqs = [
  {
    question: "What is POLKING and how does it work?",
    answer:
      "POLKING is a revolutionary staking platform built on Polygon that combines traditional staking with a unique rank-based rewards system. Users stake POL tokens to earn daily rewards and climb the ranks for additional benefits. The platform features a global pool distribution system and weekly rewards.",
  },
  {
    question: "How does the rank system work?",
    answer: "The rank system is based on your total staked amount. Higher ranks unlock better rewards and bonuses. Ranks are updated in real-time, and you can track your progress in the dashboard. Each rank comes with unique benefits and increased reward multipliers.",
  },
  {
    question: "What are the staking requirements?",
    answer: "The minimum staking amount is 100 POL tokens. There's no maximum limit - you can stake as much as you want. Staking periods are flexible, and you can increase your stake at any time. Early withdrawals are not allowed to maintain platform stability.",
  },
  {
    question: "How are rewards distributed?",
    answer: "Rewards are distributed weekly every Saturday at 11:00 UTC. The distribution includes both rank-based rewards and global pool rewards. You can track your rewards in real-time through the dashboard. Rewards are automatically calculated based on your stake amount and rank.",
  },
  {
    question: "What is the Global Pool?",
    answer: "The Global Pool is a shared reward pool that distributes rewards to all stakers. The pool size grows with platform activity and is distributed proportionally based on stake amounts and ranks. This ensures fair distribution and incentivizes long-term participation.",
  },
  {
    question: "How does the referral system work?",
    answer: "Our referral system offers up to 10 levels of rewards. When someone you refer stakes, you earn a percentage of their rewards. The percentage varies by level, with higher levels offering smaller but still valuable rewards. <a href='#' class='text-[#a58af8] hover:underline inline-flex items-center gap-1'>View referral rates <span>→</span></a>",
  },
  {
    question: "Is my stake safe?",
    answer: "Yes, your stake is secured by smart contracts on the Polygon network. The platform has undergone multiple security audits, and the contracts are immutable once deployed. We also implement various security measures to protect user funds.",
  },
  {
    question: "How do I track my earnings?",
    answer: "You can track your earnings in real-time through the dashboard. It shows your current stake, rank, rewards, and referral earnings. The dashboard also provides historical data and analytics to help you optimize your staking strategy.",
  },
]

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="relative py-20 bg-gradient-to-b from-[#0c0717] to-black px-4 sm:px-6 md:px-8 text-white">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        {/* Grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(165,138,248,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(165,138,248,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Blurred shapes */}
        <div className="absolute top-[20%] right-[10%] w-[30vw] h-[30vw] rounded-full bg-[#a58af8]/5 blur-[80px]" />
        <div className="absolute bottom-[10%] left-[5%] w-[25vw] h-[25vw] rounded-full bg-[#facc15]/5 blur-[60px]" />

        {/* Animated elements */}
        <motion.div
          animate={{
            x: ["5%", "-5%"],
            y: ["3%", "-3%"],
          }}
          transition={{
            x: { duration: 22, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
            y: { duration: 18, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
          }}
          className="absolute top-[30%] left-[30%] w-[25vw] h-[25vw] rounded-full bg-[#a58af8]/5 blur-[100px]"
        />

        {/* Connecting gradient lines */}
        <div className="absolute inset-0">
          {/* Top connecting line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#a58af8]/30 to-transparent" />
          
          {/* Bottom connecting line */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#a58af8]/30 to-transparent" />
          
          {/* Left connecting line */}
          <div className="absolute top-0 bottom-0 left-0 w-[1px] bg-gradient-to-b from-transparent via-[#a58af8]/30 to-transparent" />
          
          {/* Right connecting line */}
          <div className="absolute top-0 bottom-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-[#a58af8]/30 to-transparent" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header with glowing gradient effect */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 relative inline-block">
            <span className="text-gradient-gold">Frequently Asked Questions</span>
            <motion.div
              animate={{
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              className="absolute inset-0 -z-10 blur-xl bg-gradient-to-r from-[#a58af8]/20 via-[#facc15]/20 to-[#a58af8]/20 rounded-full"
            />
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto text-sm">
            Everything you need to know about staking with Polking
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`rounded-2xl bg-[#0f0c1a]/70 backdrop-blur-sm border transition-all duration-300 ${
                  isOpen
                    ? "border-[#a58af8] shadow-[0_0_30px_rgba(165,138,248,0.25)]"
                    : "border-[#a58af8]/30 hover:border-[#a58af8]/60"
                }`}
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full px-4 sm:px-5 py-4 flex items-center justify-between text-left group"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={
                        isOpen
                          ? {
                              boxShadow: [
                                "0 0 0px rgba(165,138,248,0.5)",
                                "0 0 10px rgba(165,138,248,0.8)",
                                "0 0 0px rgba(165,138,248,0.5)",
                              ],
                            }
                          : {}
                      }
                      transition={{ duration: 2, repeat: isOpen ? Number.POSITIVE_INFINITY : 0, ease: "easeInOut" }}
                      className={`relative flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center overflow-hidden ${
                        isOpen
                          ? "bg-gradient-to-br from-[#a58af8] to-[#facc15]"
                          : "bg-[#0f0c1a] border border-[#a58af8]/40"
                      }`}
                    >
                      {/* Animated background for inactive state */}
                      {!isOpen && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-[#a58af8]/0 via-[#a58af8]/20 to-[#a58af8]/0"
                          animate={{
                            x: ["-100%", "100%"],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                          }}
                        />
                      )}

                      {/* Stylized question mark */}
                      <span
                        className={`text-lg font-bold relative ${isOpen ? "text-black" : "text-[#a58af8]"}`}
                        style={{
                          textShadow: isOpen ? "0 0 5px rgba(0,0,0,0.3)" : "0 0 5px rgba(165,138,248,0.5)",
                          fontFamily: "var(--font-space-grotesk)",
                        }}
                      >
                        ?
                      </span>

                      {/* Subtle glow effect */}
                      <motion.div
                        className={`absolute inset-0 rounded-full ${isOpen ? "bg-white/20" : "bg-[#a58af8]/10"}`}
                        animate={{ opacity: [0, 0.5, 0] }}
                        transition={{
                          duration: 1.5,
                          repeat: Number.POSITIVE_INFINITY,
                          repeatType: "reverse",
                          ease: "easeInOut",
                        }}
                      />
                    </motion.div>
                    <span
                      className={`text-sm sm:text-base font-semibold transition-colors ${
                        isOpen ? "text-white" : "text-white/90 group-hover:text-white"
                      }`}
                    >
                      {faq.question}
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                      isOpen ? "bg-[#a58af8]/20 text-[#a58af8]" : "text-white/60 group-hover:text-white/80"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <motion.div
                        initial={{ y: -10 }}
                        animate={{ y: 0 }}
                        exit={{ y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="px-4 sm:px-5 pb-4 pt-0 sm:pl-16"
                      >
                        <div className="bg-[#0f0c1a]/50 backdrop-blur-sm rounded-xl p-3 border border-[#a58af8]/20">
                          <div className="text-sm text-white/70" dangerouslySetInnerHTML={{ __html: faq.answer }} />
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default FAQSection
