"use client"

import { useMemo, useState } from "react"
import { Separator } from "@/components/ui/separator"
import { useLanguage } from "@/components/language-context"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableRow,
} from "@/components/ui/table"

type VaultValue = "cash" | "artwork" | "gold" | "diamond"
type GunmanValue = "karl" | "charlie" | "packie"
type DriverValue = "karim" | "taliana" | "eddie" | "chester"
type HackerValue = "rickie" | "christian" | "avi" | "paige"
type BuyerValue = "high" | "middle" | "low"

const VAULT_VALUES: Record<VaultValue, number> = {
  cash: 2_115_000,
  artwork: 2_350_000,
  gold: 2_585_000,
  diamond: 3_290_000,
}

const GUNMAN_RATE: Record<GunmanValue, number> = {
  karl: 0.05,
  charlie: 0.07,
  packie: 0.08,
}

const DRIVER_RATE: Record<DriverValue, number> = {
  karim: 0.05,
  taliana: 0.07,
  eddie: 0.08,
  chester: 0.1,
}

const HACKER_RATE: Record<HackerValue, number> = {
  rickie: 0.03,
  christian: 0.07,
  avi: 0.1,
  paige: 0.09,
}

const BUYER_RATE: Record<BuyerValue, number> = {
  high: 0,
  middle: 0.05,
  low: 0.1,
}

const BUYER_LABEL_KEY: Record<BuyerValue, string> = {
  high: "buyerLevels.high",
  middle: "buyerLevels.middle",
  low: "buyerLevels.low",
}

const GUNMAN_LABEL: Record<GunmanValue, string> = {
  karl: "Karl Aboujali",
  charlie: "Charlie Reed",
  packie: "Packie McReary",
}

const DRIVER_LABEL: Record<DriverValue, string> = {
  karim: "Karim Denz",
  taliana: "Taliana Martinez",
  eddie: "Eddie Toh",
  chester: "Chester McCoy",
}

const HACKER_LABEL: Record<HackerValue, string> = {
  rickie: "Rickie Lukens",
  christian: "Christian Feltz",
  avi: "Avi Schwartzman",
  paige: "Paige Harris",
}

const formatMoney = (amount: number, locale: "en" | "de"): string => {
  return new Intl.NumberFormat(locale === "de" ? "de-DE" : "en-US", {
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatPercent = (value: number, locale: "en" | "de"): string => {
  const percent = value * 100
  return new Intl.NumberFormat(locale === "de" ? "de-DE" : "en-US", {
    minimumFractionDigits: Number.isInteger(percent) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(percent)
}

export function CasinoCalculatorForm() {
  const { t, locale } = useLanguage()

  const [vault, setVault] = useState<VaultValue>("cash")
  const [gunman, setGunman] = useState<GunmanValue>("karl")
  const [driver, setDriver] = useState<DriverValue>("karim")
  const [hacker, setHacker] = useState<HackerValue>("rickie")
  const [buyer, setBuyer] = useState<BuyerValue>("high")
  const [hardMode, setHardMode] = useState(false)

  const currentVaultValue = useMemo(() => {
    const base = VAULT_VALUES[vault]
    return hardMode ? Math.round(base * 1.1) : base
  }, [vault, hardMode])

  const plannerRate = 0.05
  const plannerTake = Math.round(currentVaultValue * plannerRate)
  const gunmanTake = Math.round(currentVaultValue * GUNMAN_RATE[gunman])
  const driverTake = Math.round(currentVaultValue * DRIVER_RATE[driver])
  const hackerTake = Math.round(currentVaultValue * HACKER_RATE[hacker])
  const totalSupportTake = plannerTake + gunmanTake + driverTake + hackerTake
  const remainingAfterSupport = currentVaultValue - totalSupportTake
  const buyerTake = Math.round(remainingAfterSupport * BUYER_RATE[buyer])
  const remainingAfterBuyer = remainingAfterSupport - buyerTake

  const result = useMemo(() => {
    const supportRateRaw =
      0.05 + GUNMAN_RATE[gunman] + DRIVER_RATE[driver] + HACKER_RATE[hacker]
    const supportRate = Math.round(supportRateRaw * 100) / 100

    const buyerRate = BUYER_RATE[buyer]
    const playerRate = remainingAfterBuyer / currentVaultValue
    const playerEarnings = remainingAfterBuyer

    return { supportRate, buyerRate, playerRate, playerEarnings }
  }, [gunman, driver, hacker, buyer, remainingAfterBuyer, currentVaultValue])

  return (
    <div className="relative mx-auto w-full max-w-6xl">
      <div className="relative grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle>{t("casino-calculator.calculatorTitle")}</CardTitle>
            <CardDescription>
              {t("casino-calculator.calculatorDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="vault">{t("casino-calculator.vaultContent")}</FieldLabel>
                  <Select
                    value={vault}
                    onValueChange={(value) => setVault(value as VaultValue)}
                  >
                    <SelectTrigger id="vault" className="w-full">
                      <SelectValue placeholder={t("casino-calculator.selectVaultContent")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">
                        {t("casino-calculator.vault.cash")} (2,115,000 GTA$)
                      </SelectItem>
                      <SelectItem value="artwork">
                        {t("casino-calculator.vault.artwork")} (2,350,000 GTA$)
                      </SelectItem>
                      <SelectItem value="gold">
                        {t("casino-calculator.vault.gold")} (2,585,000 GTA$)
                      </SelectItem>
                      <SelectItem value="diamond">
                        {t("casino-calculator.vault.diamonds")} (3,290,000 GTA$)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel htmlFor="planifier">{t("casino-calculator.planner")}</FieldLabel>
                  <Select value="lester" disabled>
                    <SelectTrigger id="planifier" className="w-full">
                      <SelectValue placeholder={t("casino-calculator.lesterTake")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lester">{t("casino-calculator.lesterTake")}</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel htmlFor="gunman">{t("casino-calculator.gunman")}</FieldLabel>
                  <Select
                    value={gunman}
                    onValueChange={(value) => setGunman(value as GunmanValue)}
                  >
                    <SelectTrigger id="gunman" className="w-full">
                      <SelectValue placeholder={t("casino-calculator.selectGunman")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="karl">Karl Aboujali (5%)</SelectItem>
                      <SelectItem value="charlie">Charlie Reed (7%)</SelectItem>
                      <SelectItem value="packie">
                        Packie McReary (8%)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel htmlFor="driver">{t("casino-calculator.driver")}</FieldLabel>
                  <Select
                    value={driver}
                    onValueChange={(value) => setDriver(value as DriverValue)}
                  >
                    <SelectTrigger id="driver" className="w-full">
                      <SelectValue placeholder={t("casino-calculator.selectDriver")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="karim">Karim Denz (5%)</SelectItem>
                      <SelectItem value="taliana">
                        Taliana Martinez (7%)
                      </SelectItem>
                      <SelectItem value="eddie">Eddie Toh (8%)</SelectItem>
                      <SelectItem value="chester">
                        Chester McCoy (10%)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <Field className="md:col-span-2">
                  <FieldLabel htmlFor="hacker">{t("casino-calculator.hacker")}</FieldLabel>
                  <Select
                    value={hacker}
                    onValueChange={(value) => setHacker(value as HackerValue)}
                  >
                    <SelectTrigger id="hacker" className="w-full">
                      <SelectValue placeholder={t("casino-calculator.selectHacker")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rickie">Rickie Lukens (3%)</SelectItem>
                      <SelectItem value="christian">
                        Christian Feltz (7%)
                      </SelectItem>
                      <SelectItem value="avi">Avi Schwartzman (10%)</SelectItem>
                      <SelectItem value="paige">Paige Harris (9%)</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <Separator />

              <Field>
                <FieldLabel htmlFor="buyer">{t("casino-calculator.buyer")}</FieldLabel>
                <Select
                  value={buyer}
                  onValueChange={(value) => setBuyer(value as BuyerValue)}
                >
                  <SelectTrigger id="buyer" className="w-full">
                    <SelectValue placeholder={t("casino-calculator.selectBuyer")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">
                      {t("casino-calculator.buyerLevels.high")} (0% {t("casino-calculator.launderingFee")})
                    </SelectItem>
                    <SelectItem value="middle">
                      {t("casino-calculator.buyerLevels.middle")} (5% {t("casino-calculator.launderingFee")})
                    </SelectItem>
                    <SelectItem value="low">
                      {t("casino-calculator.buyerLevels.low")} (10% {t("casino-calculator.launderingFee")})
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Separator />

              <FieldGroup>
                <FieldLabel
                  htmlFor="daily-vault"
                  className="bg-muted/30 has-data-checked:bg-primary/10"
                >
                  <Field orientation="horizontal">
                    <FieldContent>
                        <FieldTitle>{t("casino-calculator.dailyVault")}</FieldTitle>
                    </FieldContent>
                    <Switch
                      checked={false}
                      disabled
                      aria-label={t("casino-calculator.dailyVault")}
                      id="daily-vault"
                    />
                  </Field>
                </FieldLabel>

                <FieldLabel
                  htmlFor="hand-drill"
                  className="bg-muted/30 has-data-checked:bg-primary/10"
                >
                  <Field orientation="horizontal">
                    <FieldContent>
                        <FieldTitle>{t("casino-calculator.handDrill")}</FieldTitle>
                    </FieldContent>
                    <Switch
                      checked={false}
                      disabled
                      aria-label={t("casino-calculator.handDrill")}
                      id="hand-drill"
                    />
                  </Field>
                </FieldLabel>

                <FieldLabel
                  htmlFor="hard-mode"
                  className="bg-muted/30 has-data-checked:bg-primary/10"
                >
                  <Field orientation="horizontal">
                    <FieldContent>
                        <FieldTitle>{t("casino-calculator.hardMode")}</FieldTitle>
                    </FieldContent>
                    <Switch
                      id="hard-mode"
                      checked={hardMode}
                      onCheckedChange={setHardMode}
                      aria-label={t("casino-calculator.hardMode")}
                    />
                  </Field>
                </FieldLabel>
              </FieldGroup>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-5">
          <Card className="">
            <CardHeader>
              <CardTitle>{t("casino-calculator.results")}</CardTitle>
              <CardDescription>
                {t("casino-calculator.resultsDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border bg-primary/10 p-4">
                <p className="text-xs tracking-wide text-muted-foreground uppercase">
                  {t("casino-calculator.potentialEarnings")}
                </p>
                <p
                  id="earn"
                  className="mt-1 text-3xl font-semibold tracking-tight"
                >
                  {`$${formatMoney(result.playerEarnings, locale)}`}
                </p>
              </div>

              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs tracking-wide text-muted-foreground uppercase">
                  {t("casino-calculator.supportCrewTake")}
                </p>
                <p
                  id="supportTake"
                  className="mt-1 text-2xl font-semibold tracking-tight"
                >
                  {`${formatPercent(result.supportRate, locale)} %`}
                </p>
              </div>

              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs tracking-wide text-muted-foreground uppercase">
                  {t("casino-calculator.playersTake")}
                </p>
                <p
                  id="playerTake"
                  className="mt-1 text-2xl font-semibold tracking-tight"
                >
                  {`${formatPercent(result.playerRate, locale)} %`}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("casino-calculator.currentSupportCrewTake")}</CardTitle>
              <CardDescription>
                {t("casino-calculator.payoutDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">
                      {t("casino-calculator.planner")} (Lester Crest)
                    </TableCell>
                    <TableCell className="text-right">
                      ${formatMoney(plannerTake, locale)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      {t("casino-calculator.gunman")} ({GUNMAN_LABEL[gunman]})
                    </TableCell>
                    <TableCell className="text-right">
                      ${formatMoney(gunmanTake, locale)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      {t("casino-calculator.driver")} ({DRIVER_LABEL[driver]})
                    </TableCell>
                    <TableCell className="text-right">
                      ${formatMoney(driverTake, locale)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      {t("casino-calculator.hacker")} ({HACKER_LABEL[hacker]})
                    </TableCell>
                    <TableCell className="text-right">
                      ${formatMoney(hackerTake, locale)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      {t("casino-calculator.buyerFee")} ({t(`casino-calculator.${BUYER_LABEL_KEY[buyer]}`)})
                    </TableCell>
                    <TableCell className="text-right">
                      ${formatMoney(buyerTake, locale)}
                    </TableCell>
                  </TableRow>
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell>{t("casino-calculator.remainingAfterAllFees")}</TableCell>
                    <TableCell className="text-right">
                      ${formatMoney(remainingAfterBuyer, locale)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
