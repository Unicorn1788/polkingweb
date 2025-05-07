"use client"
import { useState, useEffect, useRef } from "react"
import { motion, useAnimation, useInView } from "framer-motion"
import { ArrowUp, Github, Download, FileText } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { TelegramLogo } from "@/components/icons/telegram-logo"
import { XLogo } from "@/components/icons/x-logo"
import { Tooltip } from "@/components/ui/tooltip"

// Mock version for package.json
const packageVersion = "1.0.0"

const FooterSection = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)

  // Ref for the social icons container
  const socialIconsRef = useRef(null)
  const isInView = useInView(socialIconsRef, { once: true, amount: 0.3 })
  const controls = useAnimation()

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    },
  }

  // Trigger animation when in view
  useEffect(() => {
    if (isInView && !hasAnimated) {
      controls.start("visible")
      setHasAnimated(true)
    }
  }, [isInView, controls, hasAnimated])

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  // Social media links with brand colors and accurate logos
  const socialLinks = [
    {
      name: "Telegram Announcement",
      icon: <TelegramLogo size={20} />,
      url: "https://t.me/polkingannouncement",
      ariaLabel: "Join our Telegram Announcement channel",
      bgColor: "#0088cc", // Telegram blue
      hoverBgColor: "#0099dd",
      iconColor: "white",
    },
    {
      name: "Telegram Group",
      icon: <TelegramLogo size={20} />,
      url: "https://t.me/polkinggroup",
      ariaLabel: "Join our Telegram Group",
      bgColor: "#0088cc", // Telegram blue
      hoverBgColor: "#0099dd",
      iconColor: "white",
    },
    {
      name: "X",
      icon: <XLogo size={18} />,
      url: "https://x.com/polkingproject",
      ariaLabel: "Follow us on X",
      bgColor: "white", // X has white background
      hoverBgColor: "#f7f7f7",
      iconColor: "black", // with black icon
    },
    {
      name: "GitHub",
      icon: <Github size={18} />,
      url: "https://github.com/polking",
      ariaLabel: "View our GitHub repository",
      bgColor: "#181717", // GitHub dark
      hoverBgColor: "#2b2b2b",
      iconColor: "white",
    },
    {
      name: "Download",
      icon: <Download size={18} />,
      url: "https://polking.io/download",
      ariaLabel: "Download our app",
      bgColor: "#6e5494", // Purple shade
      hoverBgColor: "#7e64a4",
      iconColor: "white",
    },
    {
      name: "Document",
      icon: <FileText size={18} />,
      url: "https://docs.polking.io",
      ariaLabel: "Read our documentation",
      bgColor: "#facc15", // Gold from the site's color scheme
      hoverBgColor: "#eab308",
      iconColor: "#0f0c1a", // Dark background color
    },
  ]

  return (
    <footer className="relative bg-gradient-to-b from-[#0a0118] to-black text-white mt-auto">
      {/* Top border glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#a58af8]/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Simplified Footer Content */}
        <div className="flex flex-col items-center justify-center mb-10">
          {/* Logo and Description */}
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative w-10 h-10">
                {!imageError ? (
                  <Image
                    src="/images/polking-logo.png"
                    alt="Polking Logo"
                    width={40}
                    height={40}
                    className="object-contain"
                    onError={() => {
                      console.error("Footer logo failed to load")
                      setImageError(true)
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#0f0c1a] rounded-full border border-[#a58af8]">
                    <span className="text-[#facc15] text-xs font-bold">POL</span>
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#facc15] via-[#eab308] to-[#a58af8]">
                Polking
              </h3>
            </div>
            <p className="text-white/60 text-sm text-center max-w-xs">Built with Vision, Powered by Innovation.</p>
          </div>

          {/* Social Media Icons with Staggered Animation */}
          <motion.div
            ref={socialIconsRef}
            className="flex flex-row items-center gap-4 sm:gap-6 mb-6"
            variants={containerVariants}
            initial="hidden"
            animate={controls}
          >
            {socialLinks.map((social, index) => (
              <motion.div key={social.name} variants={itemVariants} custom={index}>
                <Tooltip content={social.name} position="top" delay={isMobile ? 0 : 300}>
                  <Link
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.ariaLabel}
                    className="group"
                  >
                    <motion.div
                      className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all duration-300"
                      style={{
                        backgroundColor: social.bgColor,
                        border: social.name === "X" ? "1px solid #e1e1e1" : "none",
                      }}
                      whileHover={{
                        scale: 1.1,
                        backgroundColor: social.hoverBgColor,
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span style={{ color: social.iconColor }} className="transition-colors duration-300">
                        {social.icon}
                      </span>
                    </motion.div>
                  </Link>
                </Tooltip>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Copyright and Version */}
        <div className="text-center">
          <p className="text-white/40 text-xs mb-1">
            Built with vision and powered by innovation — © {new Date().getFullYear()} Polking.
          </p>
          <p className="text-white/30 text-xs">Version {packageVersion}</p>
        </div>

        {/* Back to top button */}
        <motion.button
          onClick={scrollToTop}
          className={`fixed right-6 bottom-6 w-10 h-10 rounded-full bg-[#0f0c1a] border border-[#a58af8]/30 flex items-center justify-center shadow-lg z-50 ${
            isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          animate={{
            y: isVisible ? [0, -5, 0] : 0,
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5 text-[#a58af8]" />
        </motion.button>
      </div>
    </footer>
  )
}

export default FooterSection
