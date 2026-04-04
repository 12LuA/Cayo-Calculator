import { Geist_Mono, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import type { Metadata } from "next"
import Script from "next/script"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/components/language-context"
import { cn } from "@/lib/utils"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SiteNavigation } from "@/components/site-navigation"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Cayo Calculator - GTA Online Heist Earnings Calculator",
  description:
    "Free Cayo Perico heist calculator for GTA Online. Calculate optimal earnings, maximize loot, and profit from the best heist strategy. Simple and powerful calculator tool.",
  keywords: [
    "GTA Cayo",
    "Cayo Perico",
    "Cayo Perico Calculator",
    "Heist Calculator",
    "GTA Online Money",
    "Loot Guide",
  ],
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body>
        <Script
          defer
          data-domain="gta-tools.vercel.app"
          src="https://analytics.12lua.de/js/pa-49oXBgE1wurFRew90mj3k.js"
          strategy="afterInteractive"
        />
        <Script id="plausible-init" strategy="afterInteractive">
          {
            "window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()"
          }
        </Script>
        <LanguageProvider>
          <ThemeProvider>
            <TooltipProvider>
              <SiteNavigation />
              {children}
            </TooltipProvider>
          </ThemeProvider>
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  )
}
