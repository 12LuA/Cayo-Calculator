export type Locale = 'en' | 'de'

export const DEFAULT_LOCALE: Locale = 'en'
export const LOCALES: Locale[] = ['en', 'de']

export interface Translation {
  [key: string]: string | Translation
}

let translations: { [key in Locale]: Translation } = {
  en: {},
  de: {},
}

async function loadTranslations() {
  try {
    const enMessages = await import('@/messages/en.json')
    const deMessages = await import('@/messages/de.json')
    
    translations = {
      en: enMessages.default,
      de: deMessages.default,
    }
  } catch (error) {
    console.error('Failed to load translations:', error)
  }
}

export function getTranslations(): { [key in Locale]: Translation } {
  return translations
}

export function setTranslations(newTranslations: { [key in Locale]: Translation }) {
  translations = newTranslations
}

export function t(key: string, locale: Locale): string {
  const keys = key.split('.')
  let value: Translation | string | undefined = translations[locale]
  
  for (const k of keys) {
    if (typeof value === 'object' && value !== null && k in value) {
      value = value[k as keyof Translation]
    } else {
      return key
    }
  }
  
  if (typeof value !== 'string') {
    return key
  }
  
  return value
}

export { loadTranslations }
