"use client"

import { useState, type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface TooltipProps {
  children: ReactNode
  content: string
  position?: "top" | "bottom" | "left" | "right"
  delay?: number
}

export function Tooltip({ children, content, position = "top", delay = 300 }: TooltipProps) {
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
  const positionStyles = {
    top: "bottom-full mb-2",
    bottom: "top-full mt-2",
    left: "right-full mr-2",
    right: "left-full ml-2",
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
            initial={{
              opacity: 0,
              y: position === "top" ? 10 : position === "bottom" ? -10 : 0,
              x: position === "left" ? 10 : position === "right" ? -10 : 0,
            }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`absolute z-50 whitespace-nowrap px-2 py-1 rounded text-xs font-medium ${positionStyles[position]} left-1/2 transform -translate-x-1/2 bg-[#1a1232] text-white border border-[#a58af8]/30 shadow-lg`}
            role="tooltip"
          >
            {content}
            {/* Arrow */}
            <div
              className={`absolute w-2 h-2 bg-[#1a1232] border-b border-r border-[#a58af8]/30 transform rotate-45 ${
                position === "top"
                  ? "top-full -translate-y-1/2"
                  : position === "bottom"
                    ? "bottom-full translate-y-1/2"
                    : position === "left"
                      ? "left-full -translate-x-1/2"
                      : "right-full translate-x-1/2"
              } left-1/2 -translate-x-1/2`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
