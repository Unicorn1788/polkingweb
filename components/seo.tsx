"use client"

import Head from "next/head"

interface SEOProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: "website" | "article"
  twitterHandle?: string
}

export function SEO({
  title = "Polking - Stake, Earn, Rule",
  description = "Join Polking's advanced staking platform with NFT rewards, referral system, and real-time tracking dashboard.",
  image = "/og-image.png",
  url = "https://polking.com",
  type = "website",
  twitterHandle = "@PolkingEmpire",
}: SEOProps) {
  const siteTitle = `${title} | Polking`

  return (
    <Head>
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />

      {/* Open Graph */}
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Polking" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#a58af8" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Polking",
            description: description,
            url: url,
            applicationCategory: "FinanceApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "POL",
            },
          }),
        }}
      />
    </Head>
  )
} 
