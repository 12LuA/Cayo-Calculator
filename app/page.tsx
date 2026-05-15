import type { Metadata } from 'next'
import CayoPericoCalculator from "@/components/cayo-perico/cayo-perico-client"

export const metadata: Metadata = {
  title: 'Cayo Perico Loot Calculator - Maximize Your GTA Online Heist Earnings',
  description: 'Free Cayo Perico heist loot calculator for GTA Online. Calculate optimal earnings with solo/co-op settings, elite challenge rewards, and crew cuts. Get the best loot strategy now.',
  keywords: ['Cayo Perico Calculator', 'GTA Online Heist', 'Loot Calculator', 'Earnings Guide', 'GTA Money Guide', 'Payout Calculator'],
  openGraph: {
    title: 'Cayo Perico Loot Calculator - GTA Online Heist Earnings',
    description: 'Calculate your Cayo Perico heist earnings instantly. Optimize loot, crew cuts, and strategies for maximum profit.',
    type: 'website',
    url: 'https://gta-tools.vercel.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cayo Perico Loot Calculator - GTA Online',
    description: 'Calculate your Cayo Perico heist earnings and find the best loot strategy.',
  },
}

export default function Page() {
  return <CayoPericoCalculator />
}
