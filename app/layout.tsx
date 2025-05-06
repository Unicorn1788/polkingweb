import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import ClientLayout from "./client-layout"
import { metadata } from "./metadata"

const inter = Inter({ subsets: ["latin"] })

export { metadata }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full overflow-x-hidden">
      <body
        className={`${inter.className} bg-black text-white antialiased flex flex-col min-h-screen overflow-x-hidden`}
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
