import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ReWear - Sustainable Fashion Exchange",
  description:
    "Community-driven platform for exchanging pre-loved clothing. Reduce textile waste and build a sustainable wardrobe through swaps and points.",
  keywords: "sustainable fashion, clothing exchange, textile waste, eco-friendly, wardrobe swap",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
