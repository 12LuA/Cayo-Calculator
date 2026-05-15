"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Minus, Plus } from "lucide-react"

import {
  calculateLoot,
  calculateMaxPotential,
  targetsData,
  type Settings,
} from "@/lib/cayo-perico/calculator"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/components/language-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  Field,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"

import NumberFlow from "@number-flow/react"
import { ResetCalculatorButton } from "@/components/cayo-perico/reset"
import { ModeToggle } from "@/components/cayo-perico/mode-toggle"
import { ShareButton } from "@/components/cayo-perico/share"
import { trackPlausibleGoal } from "@/lib/plausible"

const defaultSettings: Settings = {
  players: 1,
  hardMode: false,
  withinCooldown: false,
  goldAlone: false,
  primaryTarget: "tequila",
  tables: {
    gold: 0,
    cocaine: 0,
    weed: 0,
    paintings: 0,
    cash: 0,
  },
  cuts: {
    leader: 100,
    member1: 0,
    member2: 0,
    member3: 0,
  },
}

const formatMoney = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount)
}

const toLabel = (name: string): string => {
  return name
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

const formatActions = (name: string, presses: number, getTranslation: (key: string) => string): React.ReactNode => {
  const target = targetsData.targets.secondary.find(
    (item) => item.name === name
  )
  if (!target) {
    return `${presses} ${getTranslation("calculator.click")}${presses !== 1 ? "s" : ""}`
  }

  const actionsPerStack = target.pickup_units.length

  if (presses >= actionsPerStack) {
    const stacks = Math.floor(presses / actionsPerStack)
    const leftover = presses % actionsPerStack

    if (leftover === 0) {
      return `${stacks} Stack${stacks > 1 ? "s" : ""}`
    }

    return (
      <span className="flex flex-col items-start leading-none">
        <span className="font-semibold">
          {stacks} Stack{stacks > 1 ? "s" : ""}
        </span>
        <span className="text-xs text-muted-foreground">
          + {leftover} ${getTranslation("calculator.click")}${leftover !== 1 ? "s" : ""}
        </span>
      </span>
    )
  }

  return `${presses} ${getTranslation("calculator.click")}${presses !== 1 ? "s" : ""}`
}

const getLeaderTakeForPlayers = (
  settings: Settings,
  players: number
): number => {
  const scenarioResult = calculateLoot({ ...settings, players })
  const cut = 100 - (players - 1) * 15
  return scenarioResult.finalPayout * (cut / 100)
}

export default function CayoPericoCalculator() {
  const { t } = useLanguage()
  
  const getTargetLabel = (name: string): string => {
    const translatedLabel = t(`calculator.targets.${name}`)
    if (translatedLabel.startsWith('calculator.targets.')) {
      return toLabel(name)
    }
    return translatedLabel
  }
  
  const [settings, setSettings] = useState<Settings>(() => {
    if (typeof window === "undefined") {
      return defaultSettings
    }

    // Check if settings are in URL parameters
    const params = new URLSearchParams(window.location.search)
    
    if (params.size > 0) {
      try {
        const urlSettings: Settings = {
          players: parseInt(params.get("amountOfPlayers") || "1"),
          primaryTarget: params.get("primaryTarget") || "tequila",
          hardMode: params.get("hardMode") === "true",
          withinCooldown: params.get("withinCooldown") === "true",
          goldAlone: params.get("goldAlone") === "true",
          tables: {
            gold: parseInt(params.get("gold") || "0"),
            cocaine: parseInt(params.get("cocaine") || "0"),
            weed: parseInt(params.get("weed") || "0"),
            paintings: parseInt(params.get("paintings") || "0"),
            cash: parseInt(params.get("cash") || "0"),
          },
          cuts: {
            leader: parseInt(params.get("leaderCut") || "100"),
            member1: parseInt(params.get("member1Cut") || "0"),
            member2: parseInt(params.get("member2Cut") || "0"),
            member3: parseInt(params.get("member3Cut") || "0"),
          },
        }
        return urlSettings
      } catch {
        // Fall back to localStorage if URL parse fails
      }
    }

    const saved = window.localStorage.getItem("cayoSettings")
    if (!saved) {
      return defaultSettings
    }

    try {
      return JSON.parse(saved) as Settings
    } catch {
      return defaultSettings
    }
  })

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    window.localStorage.setItem("cayoSettings", JSON.stringify(settings))
  }, [settings])

  const result = useMemo(() => calculateLoot(settings), [settings])
  const maxResult = useMemo(() => calculateMaxPotential(settings), [settings])

  const updateSetting = <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => {
    if (key === "players") {
      const newPlayers = value as number

      trackPlausibleGoal("Calculator Settings Changed", {
        setting: "players",
        value: newPlayers,
      })

      setSettings((prev) => {
        const oldPlayers = prev.players
        const newCuts = { ...prev.cuts }

        if (newPlayers > oldPlayers) {
          for (let index = oldPlayers + 1; index <= newPlayers; index++) {
            const memberKey = `member${index - 1}` as keyof typeof newCuts
            newCuts[memberKey] = 15

            if (newCuts.leader - 15 >= 15) {
              newCuts.leader -= 15
            } else {
              const totalMembers = newPlayers - 1
              const membersCut = totalMembers * 15
              newCuts.leader = 100 - membersCut
              for (let member = 1; member <= totalMembers; member++) {
                newCuts[`member${member}` as keyof typeof newCuts] = 15
              }
              break
            }
          }
        } else if (newPlayers < oldPlayers) {
          for (let index = oldPlayers; index > newPlayers; index--) {
            const memberKey = `member${index - 1}` as keyof typeof newCuts
            const amount = newCuts[memberKey]
            newCuts[memberKey] = 0
            newCuts.leader += amount
          }
        }

        return { ...prev, players: newPlayers, cuts: newCuts }
      })

      return
    }

    trackPlausibleGoal("Calculator Settings Changed", {
      setting: String(key),
      value: String(value),
    })

    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const updateTable = (type: keyof Settings["tables"], value: number) => {
    trackPlausibleGoal("Calculator Settings Changed", {
      setting: `table:${type}`,
      value,
    })

    setSettings((prev) => ({
      ...prev,
      tables: { ...prev.tables, [type]: Math.max(0, value) },
    }))
  }

  const updateCut = (member: keyof Settings["cuts"], value: number) => {
    trackPlausibleGoal("Calculator Settings Changed", {
      setting: `cut:${member}`,
      value,
    })

    setSettings((prev) => {
      if (member === "leader") return prev
      if (value < 15) return prev

      const otherMembersCut = Object.keys(prev.cuts)
        .filter((key) => key !== "leader" && key !== member)
        .reduce((accumulator, key) => accumulator + prev.cuts[key], 0)

      const proposedLeaderCut = 100 - (value + otherMembersCut)
      if (proposedLeaderCut < 15) return prev

      return {
        ...prev,
        cuts: {
          ...prev.cuts,
          [member]: value,
          leader: proposedLeaderCut,
        },
      }
    })
  }

  const resetSettings = () => {
    trackPlausibleGoal("Reset Settings")
    setSettings(defaultSettings)
    if (typeof window !== "undefined") {
      window.localStorage.setItem("cayoSettings", JSON.stringify(defaultSettings))
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-5">
            <Card>
              <CardHeader>
                <CardTitle>{t("calculator.primaryTarget")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <Field>
                  <FieldTitle className="w-full justify-between">
                    {t("calculator.players")}
                    <Badge variant="secondary">{settings.players}</Badge>
                  </FieldTitle>
                  <Slider
                    value={[settings.players]}
                    onValueChange={(value) =>
                      updateSetting("players", value[0] ?? 1)
                    }
                    max={4}
                    min={1}
                    step={1}
                    className="mt-2 w-full"
                    aria-label="Price Range"
                  />
                  <div className="flex justify-between px-0.5 text-xs text-muted-foreground">
                    <span className="text-left">1</span>
                    <span className="text-center">2</span>
                    <span className="text-center">3</span>
                    <span className="text-right">4</span>
                  </div>
                </Field>

                <Field>
                  <FieldLabel>{t("calculator.primaryTarget")}</FieldLabel>
                  <Select
                    value={settings.primaryTarget}
                    onValueChange={(value) =>
                      updateSetting("primaryTarget", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {targetsData.targets.primary.map((target) => (
                        <SelectItem key={target.name} value={target.name}>
                          {getTargetLabel(target.name)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-3">
                    <span className="text-sm font-medium">{t("calculator.hardMode")}</span>
                    <Switch
                      checked={settings.hardMode}
                      onCheckedChange={(checked) =>
                        updateSetting("hardMode", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-3">
                    <span className="text-sm font-medium">
                      {t("calculator.withinCooldown")}
                    </span>
                    <Switch
                      checked={settings.withinCooldown}
                      onCheckedChange={(checked) =>
                        updateSetting("withinCooldown", checked)
                      }
                    />
                  </div>

                  {settings.players === 1 && (
                    <div className="flex items-center justify-between rounded-lg border border-amber-300/70 bg-amber-100/40 p-3 dark:border-amber-700 dark:bg-amber-900/20">
                      <span className="text-sm font-medium">
                        {t("calculator.goldAlone")}
                      </span>
                      <Switch
                        checked={settings.goldAlone}
                        onCheckedChange={(checked) =>
                          updateSetting("goldAlone", checked)
                        }
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("calculator.secondary")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(
                  ["gold", "cocaine", "weed", "paintings", "cash"] as const
                ).map((type) => (
                  <div
                    key={type}
                    className="flex items-center justify-between rounded-lg border bg-muted/40 p-2"
                  >
                    <span className="text-sm font-medium">
                      {t(`calculator.${type}`)}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon-sm"
                        variant="outline"
                        disabled={settings.tables[type] <= 0}
                        onClick={() =>
                          updateTable(type, settings.tables[type] - 1)
                        }
                      >
                        <Minus className="size-4" />
                      </Button>
                      <Input
                        className="h-8 w-14 text-center"
                        value={settings.tables[type]}
                        readOnly
                      />
                      <Button
                        size="icon-sm"
                        variant="outline"
                        onClick={() =>
                          updateTable(type, settings.tables[type] + 1)
                        }
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("calculator.cuts")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Card size="sm" className="rounded-lg bg-muted/40">
                  <CardHeader>
                    <CardTitle>{t("calculator.leader")}</CardTitle>
                    <CardAction>
                      <Badge variant="secondary">{settings.cuts.leader}%</Badge>
                    </CardAction>
                  </CardHeader>
                  <CardContent>
                    <Slider
                      value={[settings.cuts.leader]}
                      min={0}
                      max={100}
                      step={5}
                      disabled
                    />
                  </CardContent>
                </Card>

                {Array.from({ length: settings.players - 1 }).map(
                  (_, index) => {
                    const memberKey =
                      `member${index + 1}` as keyof Settings["cuts"]
                    return (
                      <Card
                        key={memberKey}
                        size="sm"
                        className="rounded-lg bg-muted/40"
                      >
                        <CardHeader>
                          <CardTitle>{t("calculator.member")} {index + 2}</CardTitle>
                          <CardAction>
                            <Badge variant="outline">
                              {settings.cuts[memberKey]}%
                            </Badge>
                          </CardAction>
                        </CardHeader>
                        <CardContent>
                          <Slider
                            min={0}
                            max={100}
                            step={5}
                            value={[settings.cuts[memberKey]]}
                            onValueChange={(value) =>
                              updateCut(
                                memberKey,
                                value[0] ?? settings.cuts[memberKey]
                              )
                            }
                          />
                        </CardContent>
                      </Card>
                    )
                  }
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6 lg:col-span-7">
            <Card>
              <CardHeader>
                <CardTitle>{t("calculator.profit")}</CardTitle>
                <CardDescription>
                  {t("calculator.costPerPlayer")} und {t("calculator.profitPerPlayer")}. {t("calculator.maxPotential")}
                  {formatMoney(maxResult.finalPayout)}
                </CardDescription>
              <CardAction className="flex gap-2 md:flex-row">
                <ShareButton settings={settings} />
                <ResetCalculatorButton onReset={resetSettings} />
              </CardAction>
              </CardHeader>
              <CardContent>
                <div className="text-7xl font-black text-emerald-600">
                  <NumberFlow value={result.finalPayout} prefix="$" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("calculator.leader")} {t("calculator.profit")}</CardTitle>
                <CardDescription>
                  Welche {t("calculator.players")}-Zahl zahlt dir am meisten, wenn{" "}
                  alle anderen mindestens 15% bekommen?
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[1, 2, 3, 4].map((playerCount) => {
                  const scenarioResult = calculateLoot({
                    ...settings,
                    players: playerCount,
                  })
                  const maxLeaderCut = 100 - (playerCount - 1) * 15
                  const leaderTake =
                    scenarioResult.finalPayout * (maxLeaderCut / 100)
                  const isCurrent = settings.players === playerCount
                  const isBest = [1, 2, 3, 4]
                    .map((players) =>
                      getLeaderTakeForPlayers(settings, players)
                    )
                    .every((value) => value <= leaderTake)

                  return (
                    <div
                      key={playerCount}
                      className={cn(
                        "space-y-2 rounded-xl border bg-muted/40 p-3",
                        isCurrent && "ring-2 ring-primary/50",
                        isBest && "bg-emerald-500/10"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground uppercase">
                          {playerCount === 1
                            ? "Solo"
                            : `${playerCount} ${t("calculator.players")}`}
                        </span>
                        <div className="flex items-center gap-1">
                          {isBest ? (
                            <Badge className="bg-emerald-600 text-white">
                              {t("calculator.best")}
                            </Badge>
                          ) : isCurrent ? (
                            <Badge variant="secondary">{t("calculator.current")}</Badge>
                          ) : null}
                        </div>
                      </div>

                      <div className="text-xl font-extrabold">
                        {formatMoney(leaderTake)}
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{t("calculator.cut")} {maxLeaderCut}%</span>
                        <span className="font-mono">
                          {t("calculator.total")} {formatMoney(scenarioResult.finalPayout)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t("calculator.lootValue")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell>{t("calculator.primaryTarget")}</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatMoney(result.primaryValue)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>{t("calculator.secondary")}</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatMoney(result.totalSecondaryValue)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>{t("calculator.officeSafe")}</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatMoney(result.officeSafe)}
                        </TableCell>
                      </TableRow>
                      <TableRow className="font-semibold">
                        <TableCell>{t("calculator.grossTotal")}</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatMoney(
                            result.totalLootValue + result.officeSafe
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-destructive">
                          {t("calculator.fencingFee")}
                        </TableCell>
                        <TableCell className="text-right font-mono text-destructive">
                          -{formatMoney(result.fees.fencing)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-destructive">
                          {t("calculator.pavelCut")}
                        </TableCell>
                        <TableCell className="text-right font-mono text-destructive">
                          -{formatMoney(result.fees.pavel)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("calculator.profit")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border bg-muted/40 p-4">
                    <div className="text-xs tracking-wide text-muted-foreground uppercase">
                      {t("calculator.eliteChallenge")}
                    </div>
                    <div className="mt-1 text-xl font-bold">
                      {formatMoney(result.eliteChallenge)}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Add this if completed under time limit.
                    </p>
                  </div>

                  <div className="rounded-lg border bg-muted/40 p-4">
                    <div className="text-xs tracking-wide text-muted-foreground uppercase">
                      Bag Efficiency
                    </div>
                    <div className="mt-1 text-xl font-bold">
                      {(
                        ((result.totalCapacity - result.remainingCapacity) /
                          result.totalCapacity) *
                        100
                      ).toFixed(1)}
                      %
                    </div>
                    <Progress
                      className="mt-3"
                      value={
                        ((result.totalCapacity - result.remainingCapacity) /
                          result.totalCapacity) *
                        100
                      }
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t("calculator.capacityUsed")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {result.results.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("calculator.profit")} {t("calculator.secondary")}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {result.results.map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className="rounded-xl border bg-muted/40 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">
                          {t(`calculator.${item.name}`)}
                        </span>
                        <Badge variant="outline">
                          {item.bags.toFixed(2)} {t("calculator.bags")}
                        </Badge>
                      </div>
                      <div className="mt-2 text-lg font-bold text-primary">
                        {formatMoney(item.value)}
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {formatActions(item.name, item.presses, t)}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>{t("calculator.cuts")}</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-xl border bg-muted/40 p-4 text-center">
                  <div className="text-xs tracking-wide text-muted-foreground uppercase">
                    {t("calculator.leader")}
                  </div>
                  <div className="mt-1 text-lg font-extrabold text-primary">
                    {formatMoney(
                      (result.finalPayout * settings.cuts.leader) / 100
                    )}
                  </div>
                </div>

                {Array.from({ length: settings.players - 1 }).map(
                  (_, index) => {
                    const memberKey =
                      `member${index + 1}` as keyof Settings["cuts"]
                    return (
                      <div
                        key={memberKey}
                        className="rounded-xl border bg-muted/40 p-4 text-center"
                      >
                        <div className="text-xs tracking-wide text-muted-foreground uppercase">
                          {t("calculator.member")} {index + 2}
                        </div>
                        <div className="mt-1 text-lg font-extrabold">
                          {formatMoney(
                            (result.finalPayout * settings.cuts[memberKey]) /
                              100
                          )}
                        </div>
                      </div>
                    )
                  }
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("calculator.secondary")} {t("calculator.value")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("calculator.target")}</TableHead>
                  <TableHead className="text-right">{t("calculator.stack")}</TableHead>
                  <TableHead className="text-right">{t("calculator.fullBag")}</TableHead>
                  <TableHead className="text-right">{t("calculator.fillPercent")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {targetsData.targets.secondary.map((target) => {
                  const primaryTargetData = targetsData.targets.primary.find(
                    (item) => item.name === settings.primaryTarget
                  )
                  const multiplier =
                    settings.withinCooldown && primaryTargetData
                      ? primaryTargetData.bonus_multiplier
                      : 1

                  const avgValueRaw = (target.value.min + target.value.max) / 2
                  const avgValue = avgValueRaw * multiplier
                  const fillPercent =
                    (target.full_table_units / targetsData.bag_capacity) * 100
                  const fullBagValue =
                    (avgValue / target.full_table_units) *
                    targetsData.bag_capacity

                  return (
                    <TableRow key={target.name}>
                      <TableCell className="font-medium">
                        {t(`calculator.${target.name}`)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatMoney(avgValue)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatMoney(fullBagValue)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {fillPercent.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
