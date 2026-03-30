import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Casino Heist Calculator - GTA Online Crew Payout Guide',
  description: 'Calculate optimal crew payouts for the GTA Online Casino Heist. Find the best gunman, driver, hacker, and buyer combinations to maximize your earnings.',
  keywords: ['Casino Heist Calculator', 'GTA Online Casino', 'Crew Payout', 'Heist Guide', 'GTA Money', 'Lester Crest'],
  openGraph: {
    title: 'Casino Heist Calculator - GTA Online Crew Payouts',
    description: 'Optimize your Casino Heist crew setup and calculate maximum earnings instantly.',
    type: 'website',
    url: 'https://gta-tools.vercel.app/casino-calculator',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Casino Heist Calculator - GTA Online',
    description: 'Find the best crew setup for the Casino Heist and maximize your payout.',
  },
}

export default function CasinoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
