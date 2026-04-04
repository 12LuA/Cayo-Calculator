'use client'

import { useEffect } from 'react'
import { init } from '@plausible-analytics/tracker'

export function PlausibleProvider() {
  useEffect(() => {
    const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || window.location.hostname
    const endpoint = process.env.NEXT_PUBLIC_PLAUSIBLE_ENDPOINT || 'https://analytics.12lua.de/api/event'

    init({
      domain,
      endpoint,
      autoCapturePageviews: true,
    })
  }, [])

  return null
}