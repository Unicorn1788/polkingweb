"use client"

import HeroSection from "@/components/hero-section"
import NFTBoosterSection from "@/components/nft-booster-section"
import AffiliateSection from "@/components/affiliate-section"
import GlobalPoolSection from "@/components/global-pool-section"
import Roadmap from "@/components/roadmap"
import FAQSection from "@/components/faq-section"
import RewardsOverview from "@/components/rewards-overview"
import StakeSection from "@/components/stake-section"
import FlagCounterSection from "@/components/flag-counter"
import { useEffect, useState } from "react"

export default function HomePage() {
  const [isMounted, setIsMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  return (
    <main className="bg-[#0a0118]">
        {/* Hero Section */}
      <section id="hero-section">
          <HeroSection />
        </section>

      {/* Staking Section */}
      <section id="staking-section">
        <StakeSection />
        </section>

      {/* Rewards Overview Section */}
      <section id="rewards-section" className="bg-[#0d0522]">
        <RewardsOverview />
        </section>

      {/* Affiliate Section */}
      <section id="affiliate-section" className="bg-[#0d0522]">
          <AffiliateSection />
      </section>

      {/* NFT Booster Section */}
      <section id="nft-booster-section">
          <NFTBoosterSection />
      </section>

      {/* Global Pool Section */}
      <section id="global-pool-section">
          <GlobalPoolSection />
      </section>

      {/* Roadmap Section */}
      <section id="roadmap-section" className="bg-[#0d0522]">
          <Roadmap />
          <FlagCounterSection />
      </section>

      {/* FAQ Section */}
      <section id="faq-section">
        <FAQSection />
      </section>
    </main>
  )
}
