"use client"

import { useMemo, useState } from "react"
import { Separator } from "@/components/ui/separator"

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
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type VaultValue = "cash" | "artwork" | "gold" | "diamond"
type GunmanValue = "karl" | "charlie" | "packie"
type DriverValue = "karim" | "taliana" | "eddie" | "chester"
type HackerValue = "rickie" | "christian" | "avi" | "paige"

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

const formatMoney = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatPercent = (value: number): string => {
  const percent = value * 100
  return Number.isInteger(percent) ? `${percent}` : percent.toFixed(2)
}

export function CasinoCalculatorForm() {
  const [vault, setVault] = useState<VaultValue>("cash")
  const [gunman, setGunman] = useState<GunmanValue>("karl")
  const [driver, setDriver] = useState<DriverValue>("karim")
  const [hacker, setHacker] = useState<HackerValue>("rickie")
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

  const result = useMemo(() => {
    let supportRate = 0.05
    supportRate += GUNMAN_RATE[gunman]
    supportRate += DRIVER_RATE[driver]
    supportRate += HACKER_RATE[hacker]
    supportRate = Math.round(supportRate * 100) / 100

    const playerRate = 1 - supportRate
    const playerEarnings = Math.round(currentVaultValue * playerRate)

    return { supportRate, playerRate, playerEarnings }
  }, [gunman, driver, hacker, currentVaultValue])

  return (
    <div className="relative mx-auto w-full max-w-6xl">
      <div className="relative grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle>Casino Heist Calculator</CardTitle>
            <CardDescription>
              Build your crew setup and run the estimate for your final player
              cut.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="vault">Vault Content</FieldLabel>
                  <Select
                    value={vault}
                    onValueChange={(value) => setVault(value as VaultValue)}
                  >
                    <SelectTrigger id="vault" className="w-full">
                      <SelectValue placeholder="Select vault content" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">
                        Cash (2,115,000 GTA$)
                      </SelectItem>
                      <SelectItem value="artwork">
                        Artwork (2,350,000 GTA$)
                      </SelectItem>
                      <SelectItem value="gold">
                        Gold (2,585,000 GTA$)
                      </SelectItem>
                      <SelectItem value="diamond">
                        Diamonds (3,290,000 GTA$)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel htmlFor="planifier">Planifier</FieldLabel>
                  <Select value="lester" disabled>
                    <SelectTrigger id="planifier" className="w-full">
                      <SelectValue placeholder="Lester Crest (5%)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lester">Lester Crest (5%)</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel htmlFor="gunman">Gunman</FieldLabel>
                  <Select
                    value={gunman}
                    onValueChange={(value) => setGunman(value as GunmanValue)}
                  >
                    <SelectTrigger id="gunman" className="w-full">
                      <SelectValue placeholder="Select gunman" />
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
                  <FieldLabel htmlFor="driver">Driver</FieldLabel>
                  <Select
                    value={driver}
                    onValueChange={(value) => setDriver(value as DriverValue)}
                  >
                    <SelectTrigger id="driver" className="w-full">
                      <SelectValue placeholder="Select driver" />
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
                  <FieldLabel htmlFor="hacker">Hacker</FieldLabel>
                  <Select
                    value={hacker}
                    onValueChange={(value) => setHacker(value as HackerValue)}
                  >
                    <SelectTrigger id="hacker" className="w-full">
                      <SelectValue placeholder="Select hacker" />
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

              <FieldGroup>
                <FieldLabel
                  htmlFor="daily-vault"
                  className="bg-muted/30 has-data-checked:bg-primary/10"
                >
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldTitle>Daily Vault</FieldTitle>
                    </FieldContent>
                    <Switch
                      checked={false}
                      disabled
                      aria-label="Daily Vault"
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
                      <FieldTitle>Hand Drill</FieldTitle>
                    </FieldContent>
                    <Switch
                      checked={false}
                      disabled
                      aria-label="Hand Drill"
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
                      <FieldTitle>Hard Mode</FieldTitle>
                    </FieldContent>
                    <Switch
                      id="hard-mode"
                      checked={hardMode}
                      onCheckedChange={setHardMode}
                      aria-label="Hard Mode"
                    />
                  </Field>
                </FieldLabel>
              </FieldGroup>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-5">
          <Card className="lg:sticky lg:top-8">
            <CardHeader>
              <CardTitle>Results</CardTitle>
              <CardDescription>
                Final output based on your selected crew and vault conditions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs tracking-wide text-muted-foreground uppercase">
                  Support Crew Take
                </p>
                <p
                  id="supportTake"
                  className="mt-1 text-2xl font-semibold tracking-tight"
                >
                  {`${formatPercent(result.supportRate)} %`}
                </p>
              </div>

              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs tracking-wide text-muted-foreground uppercase">
                  Player&apos;s Take
                </p>
                <p
                  id="playerTake"
                  className="mt-1 text-2xl font-semibold tracking-tight"
                >
                  {`${formatPercent(result.playerRate)} %`}
                </p>
              </div>

              <div className="rounded-lg border bg-primary/10 p-4">
                <p className="text-xs tracking-wide text-muted-foreground uppercase">
                  Potential Earnings
                </p>
                <p
                  id="earn"
                  className="mt-1 text-3xl font-semibold tracking-tight"
                >
                  {`${formatMoney(result.playerEarnings)} GTA $`}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Support Crew Take</CardTitle>
              <CardDescription>
                Payout per crew member based on your current setup.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">
                      Planifier (Lester Crest)
                    </TableCell>
                    <TableCell className="text-right">
                      ${formatMoney(plannerTake)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      Gunman ({GUNMAN_LABEL[gunman]})
                    </TableCell>
                    <TableCell className="text-right">
                      ${formatMoney(gunmanTake)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      Driver ({DRIVER_LABEL[driver]})
                    </TableCell>
                    <TableCell className="text-right">
                      ${formatMoney(driverTake)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      Hacker ({HACKER_LABEL[hacker]})
                    </TableCell>
                    <TableCell className="text-right">
                      ${formatMoney(hackerTake)}
                    </TableCell>
                  </TableRow>
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell>Remaining After Support Crew</TableCell>
                    <TableCell className="text-right">
                      ${formatMoney(remainingAfterSupport)}
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
