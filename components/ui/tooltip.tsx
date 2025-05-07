"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface TooltipProps {
  content: string
  position?: "top" | "bottom" | "left" | "right"
  delay?: number
  children: React.ReactNode
}

export const Tooltip: React.FC<TooltipProps> = ({ content, position = "top", delay = 300, children }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  const showTooltip = () => {
    const id = setTimeout(() => {
      setIsVisible(true)
    }, delay)
    setTimeoutId(id)
  }

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }
    setIsVisible(false)
  }

  // Position styles
  const getPositionStyles = () => {
    switch (position) {
      case "top":
        return { bottom: "100%", left: "50%", transform: "translateX(-50%)", marginBottom: "8px" }
      case "bottom":
        return { top: "100%", left: "50%", transform: "translateX(-50%)", marginTop: "8px" }
      case "left":
        return { right: "100%", top: "50%", transform: "translateY(-50%)", marginRight: "8px" }
      case "right":
        return { left: "100%", top: "50%", transform: "translateY(-50%)", marginLeft: "8px" }
      default:
        return { bottom: "100%", left: "50%", transform: "translateX(-50%)", marginBottom: "8px" }
    }
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 px-2 py-1 text-xs font-medium text-white bg-[#0f0c1a] rounded-md shadow-lg border border-[#a58af8]/30 whitespace-nowrap"
            style={getPositionStyles()}
          >
            {content}
            {/* Arrow */}
            <div
              className="absolute w-2 h-2 bg-[#0f0c1a] border-[#a58af8]/30"
              style={{
                ...(position === "top" && {
                  bottom: "-4px",
                  left: "50%",
                  transform: "translateX(-50%) rotate(45deg)",
                  borderRight: "1px solid",
                  borderBottom: "1px solid",
                }),
                ...(position === "bottom" && {
                  top: "-4px",
                  left: "50%",
                  transform: "translateX(-50%) rotate(45deg)",
                  borderLeft: "1px solid",
                  borderTop: "1px solid",
                }),
                ...(position === "left" && {
                  right: "-4px",
                  top: "50%",
                  transform: "translateY(-50%) rotate(45deg)",
                  borderRight: "1px solid",
                  borderTop: "1px solid",
                }),
                ...(position === "right" && {
                  left: "-4px",
                  top: "50%",
                  transform: "translateY(-50%) rotate(45deg)",
                  borderLeft: "1px solid",
                  borderBottom: "1px solid",
                }),
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
