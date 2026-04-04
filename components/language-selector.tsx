'use client'

import { useLanguage } from '@/components/language-context'
import type { Locale } from '@/lib/i18n'
import "flag-icons/css/flag-icons.min.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { trackPlausibleGoal } from '@/lib/plausible'

export function LanguageSelector() {
  const { locale, setLocale, t } = useLanguage()

  const handleLanguageChange = (nextLocale: string) => {
    const selectedLocale = nextLocale as Locale

    setLocale(selectedLocale)
    trackPlausibleGoal("Change Language", { locale: selectedLocale })
  }

  return (
    <Select value={locale} onValueChange={handleLanguageChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">
          <span className="fi fi-us rounded-xs" />
          {t('language.english')}
        </SelectItem>
        <SelectItem value="de">
          <span className="fi fi-de rounded-xs" />
          {t('language.german')}
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
