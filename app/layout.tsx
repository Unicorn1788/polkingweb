import { Providers } from "./providers"
import { cookies } from 'next/headers'
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Polking Protocols",
  description: "Built with vision, secured by smart contracts.",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const cookieString = cookieStore.getAll()
    .map((cookie: { name: string; value: string }) => `${cookie.name}=${cookie.value}`)
    .join('; ')

  return (
    <html lang="en" suppressHydrationWarning className="h-full overflow-x-hidden">
      <body className={`${inter.className} bg-black text-white antialiased flex flex-col min-h-screen overflow-x-hidden`}>
        <Providers cookies={cookieString}>
          {children}
        </Providers>
      </body>
    </html>
  )
}
