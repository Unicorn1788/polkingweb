"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import { TrendingUp } from "lucide-react"

export default function HeroSection() {
  // State to control when animations start (prevents animation on page refresh)
  const [animationReady, setAnimationReady] = useState(false)

  // Set animation ready after component mounts
  useEffect(() => {
    setAnimationReady(true)
  }, [])

  // Handle start staking action
  const handleStartStaking = () => {
    const stakingSection = document.getElementById("staking-section")
    if (stakingSection) {
      const offsetPosition = stakingSection.offsetTop - 80
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
    }
  }

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0a0118] via-[#120630] to-[#0e0424] text-white px-4 sm:px-6 md:px-8 py-8 sm:py-12">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        {/* Base gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0118] via-[#120630] to-[#0e0424]" />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(165,138,248,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(165,138,248,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Glowing orbs */}
        <div className="absolute top-[10%] right-[5%] w-[30vw] h-[30vw] rounded-full bg-[#a58af8]/10 blur-[80px] animate-pulse" />
        <div className="absolute bottom-[10%] left-[5%] w-[25vw] h-[25vw] rounded-full bg-[#facc15]/10 blur-[60px] animate-pulse" />
        <div className="absolute top-[40%] right-[15%] w-[20vw] h-[20vw] rounded-full bg-[#a58af8]/5 blur-[100px] animate-pulse" />
        
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0118]/50 to-[#0a0118] opacity-70" />
        
        {/* Bottom transition gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0118] to-transparent" />
      </div>

      <div className="relative z-10 max-w-5xl w-full grid md:grid-cols-2 items-center gap-8 md:gap-12">
        {/* Right Content (Image on top in mobile) */}
        <div className="order-1 md:order-2 flex justify-center">
          <div className="relative w-64 h-64 md:w-80 md:h-80">
            <Image
              src="/images/polking-logo.png"
              alt="Polking Hero"
              fill
              priority
              sizes="(max-width: 768px) 256px, 320px"
              className="object-contain drop-shadow-[0_0_15px_rgba(165,138,248,0.5)]"
            />
          </div>
        </div>

        {/* Left Content (Text & Button below image on mobile) */}
        <div className="order-2 md:order-1 space-y-6 text-center md:text-left">
          {/* Heading */}
          <div className="relative">
            {/* Brand name */}
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-4 bg-gradient-to-r from-white via-[#a58af8] to-[#facc15] text-transparent bg-clip-text">
              Polking
            </h1>

            {/* Tagline words */}
            <div className="flex flex-wrap gap-x-3 justify-center md:justify-start">
              <span className="text-2xl md:text-3xl font-bold text-white inline-block">Stake.</span>
              <span className="text-2xl md:text-3xl font-bold text-white inline-block">Earn.</span>
              <span className="text-2xl md:text-3xl font-bold text-white inline-block">Rule.</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-lg text-white/80">
            Stake like a king. Rise through the ranks. Reign with rewards. Built on Polygon, ruled by you.
          </p>

          {/* Start Staking Button */}
              <button
                onClick={handleStartStaking}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#a58af8] to-[#facc15] text-black font-semibold hover:opacity-90 transition-opacity"
          >
            <TrendingUp className="w-5 h-5" />
                    Start Staking
              </button>
        </div>
      </div>
    </section>
  )
}
