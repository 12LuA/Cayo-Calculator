"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useLanguage } from "@/components/language-context"

export default function GuidePage() {
  const { t } = useLanguage()

  const translate = (key: string, fallback: string): string => {
    const translated = t(key)
    return translated === key ? fallback : translated
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {translate(
                "casino-calculator.title",
                "How To Use The Calculator"
              )}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
