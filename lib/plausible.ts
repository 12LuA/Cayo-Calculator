type PlausibleProps = Record<string, string | number | boolean | null | undefined>

type PlausibleOptions = {
  props?: PlausibleProps
  url?: string
  callback?: (result?: { status?: string; error?: unknown }) => void
  interactive?: boolean
  revenue?: number
}

type PlausibleFn = (eventName: string, options?: PlausibleOptions) => void

declare global {
  interface Window {
    plausible?: PlausibleFn
  }
}

export function trackPlausibleGoal(eventName: string, props?: PlausibleProps) {
  if (typeof window === "undefined" || typeof window.plausible !== "function") {
    return
  }

  window.plausible(eventName, props ? { props } : undefined)
}