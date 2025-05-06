"use client"

import { forwardRef, type HTMLAttributes, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ScrollableAreaProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  maxHeight?: string
  className?: string
}

const ScrollableArea = forwardRef<HTMLDivElement, ScrollableAreaProps>(
  ({ children, maxHeight = "60vh", className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "overflow-y-auto scrollbar-thin scrollbar-thumb-[#a58af8]/20 scrollbar-track-transparent -webkit-overflow-scrolling-touch",
          className,
        )}
        style={{ maxHeight }}
        {...props}
      >
        {children}
      </div>
    )
  },
)

ScrollableArea.displayName = "ScrollableArea"

export { ScrollableArea }
