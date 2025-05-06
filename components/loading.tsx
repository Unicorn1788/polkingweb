"use client"

import { motion } from "framer-motion"

export function Loading() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="w-12 h-12 border-4 border-[#a58af8] border-t-transparent rounded-full"
      />
    </div>
  )
}

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  }

  return (
    <motion.div
      animate={{
        rotate: 360,
      }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear",
      }}
      className={`${sizeClasses[size]} border-[#a58af8] border-t-transparent rounded-full`}
    />
  )
}

export function LoadingDots() {
  return (
    <div className="flex space-x-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{
            y: ["0%", "-50%", "0%"],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.2,
          }}
          className="w-2 h-2 bg-[#a58af8] rounded-full"
        />
      ))}
    </div>
  )
} 
