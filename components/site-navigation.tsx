"use client"

import Link from "next/link"
import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"

import { useLanguage } from "@/components/language-context"
import { ModeToggle } from "@/components/cayo-perico/mode-toggle"
import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

const LanguageSelector = dynamic(
  () => import("@/components/language-selector").then((mod) => mod.LanguageSelector),
  { ssr: false }
)

export function SiteNavigation() {
  const { t } = useLanguage()
  const pathname = usePathname()

  const resolveLabel = (key: string, fallback: string): string => {
    const translated = t(key)
    return translated === key ? fallback : translated
  }

  const navItems = [
    {
      href: "/",
      label: resolveLabel("calculator.title", "Cayo Perico Rechner"),
    },
    {
      href: "/casino-calculator",
      label: "Diamond Casino Heist Profit Calculator",
    },
  ]

  return (
    <nav
      className="border-b bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/70"
      aria-label={resolveLabel("navigation.main", "Main navigation")}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-4 py-3 md:px-8">
        <span className="text-sm font-semibold tracking-wide text-muted-foreground">
          GTA Tools
        </span>

        <NavigationMenu>
          <NavigationMenuList>
            {navItems.map(({ href, label }) => {
              const isActive = pathname === href

              return (
                <NavigationMenuItem key={href}>
                  <NavigationMenuLink
                    asChild
                    active={isActive}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      isActive
                        ? "bg-transparent text-foreground hover:bg-transparent focus:bg-transparent data-[active=true]:bg-transparent data-[active=true]:hover:bg-transparent"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Link href={href} aria-current={isActive ? "page" : undefined}>
                      {label}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )
            })}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-2">
          <LanguageSelector />
          <ModeToggle />
        </div>
      </div>
    </nav>
  )
}
