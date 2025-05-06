"use client"

import type { ReactNode } from "react"
import { Providers } from "./providers"
import SkipLink from "@/components/skip-link"
import Footer from "@/components/footer"
import { Suspense } from "react"
import Navbar from "@/components/navbar"

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <SkipLink />
      <div className="flex flex-col flex-grow w-full">
        <Navbar />
        <main id="main-content" className="flex-grow w-full pt-16">
          <Suspense>{children}</Suspense>
        </main>
        <Footer />
      </div>
    </Providers>
  )
} 
