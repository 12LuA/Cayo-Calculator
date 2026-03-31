"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"

import { useLanguage } from "@/components/language-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Vehicle {
  model?: string
  manufacturer?: string
  seats?: number
  price?: number
  topSpeed?: {
    mph?: number
    kmh?: number
  }
  speed?: number
  acceleration?: number
  braking?: number
  handling?: number
  images?: {
    side?: string
    front?: string
    frontQuarter?: string
  }
}

const MAX_RESULTS = 16
const ALL_FILTER = "all"

const formatMoney = (amount: number, locale: "en" | "de"): string => {
  const formatter = new Intl.NumberFormat(locale === "de" ? "de-DE" : "en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  })

  return formatter.format(amount)
}

async function normalizeApiResponse<T>(response: Response): Promise<T> {
  const text = await response.text()

  try {
    return JSON.parse(text) as T
  } catch {
    return text as T
  }
}

const toStringList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string")
  }

  if (typeof value === "object" && value !== null) {
    return Object.keys(value as Record<string, unknown>)
  }

  return []
}

export function VehicleSearchClient() {
  const { locale, t } = useLanguage()

  const [allVehicleNames, setAllVehicleNames] = useState<string[]>([])
  const [vehicleClasses, setVehicleClasses] = useState<string[]>([])
  const [manufacturers, setManufacturers] = useState<string[]>([])
  const [query, setQuery] = useState("")
  const [selectedClass, setSelectedClass] = useState<string>(ALL_FILTER)
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>(ALL_FILTER)
  const [selectedVehicleName, setSelectedVehicleName] = useState<string | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [classVehicleNames, setClassVehicleNames] = useState<string[]>([])
  const [manufacturerVehicleNames, setManufacturerVehicleNames] = useState<string[]>([])
  const [manufacturerLogo, setManufacturerLogo] = useState<string | null>(null)
  const [isLoadingNames, setIsLoadingNames] = useState(true)
  const [isLoadingClassVehicles, setIsLoadingClassVehicles] = useState(false)
  const [isLoadingManufacturerVehicles, setIsLoadingManufacturerVehicles] = useState(false)
  const [isLoadingVehicle, setIsLoadingVehicle] = useState(false)
  const [isLoadingLogo, setIsLoadingLogo] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    const fetchInitialData = async () => {
      try {
        setIsLoadingNames(true)
        setHasError(false)

        const [namesResponse, classesResponse, manufacturerNamesResponse] = await Promise.all([
          fetch("https://gta.vercel.app/api/vehicles/names", {
            signal: controller.signal,
            cache: "force-cache",
          }),
          fetch("https://gta.vercel.app/api/vehicles/classes", {
            signal: controller.signal,
            cache: "force-cache",
          }),
          fetch("https://gta.vercel.app/api/vehicles/manufacturers/names", {
            signal: controller.signal,
            cache: "force-cache",
          }),
        ])

        if (!namesResponse.ok || !classesResponse.ok || !manufacturerNamesResponse.ok) {
          throw new Error("Failed to load vehicle base data")
        }

        const namesData = await normalizeApiResponse<unknown>(namesResponse)
        const classesData = await normalizeApiResponse<unknown>(classesResponse)
        const manufacturerNamesData = await normalizeApiResponse<unknown>(manufacturerNamesResponse)

        setAllVehicleNames(toStringList(namesData).sort((a, b) => a.localeCompare(b)))
        setVehicleClasses(toStringList(classesData).sort((a, b) => a.localeCompare(b)))
        setManufacturers(toStringList(manufacturerNamesData).sort((a, b) => a.localeCompare(b)))
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setHasError(true)
        }
      } finally {
        setIsLoadingNames(false)
      }
    }

    void fetchInitialData()

    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (selectedClass === ALL_FILTER) {
      setClassVehicleNames([])
      return
    }

    const controller = new AbortController()

    const fetchClassVehicles = async () => {
      try {
        setIsLoadingClassVehicles(true)

        const response = await fetch(
          `https://gta.vercel.app/api/vehicles/class/${encodeURIComponent(selectedClass)}`,
          {
            signal: controller.signal,
            cache: "force-cache",
          }
        )

        if (!response.ok) {
          throw new Error("Failed to load class vehicles")
        }

        const data = await normalizeApiResponse<unknown>(response)
        setClassVehicleNames(toStringList(data))
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setHasError(true)
        }
      } finally {
        setIsLoadingClassVehicles(false)
      }
    }

    void fetchClassVehicles()

    return () => controller.abort()
  }, [selectedClass])

  useEffect(() => {
    if (selectedManufacturer === ALL_FILTER) {
      setManufacturerVehicleNames([])
      return
    }

    const controller = new AbortController()

    const fetchManufacturerVehicles = async () => {
      try {
        setIsLoadingManufacturerVehicles(true)

        const response = await fetch(
          `https://gta.vercel.app/api/vehicles/manufacturer/${encodeURIComponent(selectedManufacturer)}/vehicles`,
          {
            signal: controller.signal,
            cache: "force-cache",
          }
        )

        if (!response.ok) {
          throw new Error("Failed to load manufacturer vehicles")
        }

        const data = await normalizeApiResponse<unknown>(response)
        setManufacturerVehicleNames(toStringList(data))
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setHasError(true)
        }
      } finally {
        setIsLoadingManufacturerVehicles(false)
      }
    }

    void fetchManufacturerVehicles()

    return () => controller.abort()
  }, [selectedManufacturer])

  useEffect(() => {
    if (!selectedVehicleName) {
      setSelectedVehicle(null)
      return
    }

    const controller = new AbortController()

    const fetchVehicle = async () => {
      try {
        setIsLoadingVehicle(true)
        setHasError(false)

        const response = await fetch(
          `https://gta.vercel.app/api/vehicles/${encodeURIComponent(selectedVehicleName)}`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        )

        if (!response.ok) {
          throw new Error("Failed to load vehicle")
        }

        const data = await normalizeApiResponse<Vehicle>(response)
        setSelectedVehicle(data)
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setHasError(true)
        }
      } finally {
        setIsLoadingVehicle(false)
      }
    }

    void fetchVehicle()

    return () => controller.abort()
  }, [selectedVehicleName])

  useEffect(() => {
    const manufacturer = selectedVehicle?.manufacturer

    if (!manufacturer) {
      setManufacturerLogo(null)
      return
    }

    const controller = new AbortController()

    const fetchManufacturerLogo = async () => {
      try {
        setIsLoadingLogo(true)

        const response = await fetch(
          `https://gta.vercel.app/api/vehicles/manufacturer/${encodeURIComponent(manufacturer)}`,
          {
            signal: controller.signal,
            cache: "force-cache",
          }
        )

        if (!response.ok) {
          throw new Error("Failed to load manufacturer logo")
        }

        const data = await normalizeApiResponse<string | { image?: string }>(response)

        if (typeof data === "string") {
          setManufacturerLogo(data)
          return
        }

        setManufacturerLogo(typeof data?.image === "string" ? data.image : null)
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setManufacturerLogo(null)
        }
      } finally {
        setIsLoadingLogo(false)
      }
    }

    void fetchManufacturerLogo()

    return () => controller.abort()
  }, [selectedVehicle?.manufacturer])

  const classSet = useMemo(() => new Set(classVehicleNames), [classVehicleNames])
  const manufacturerSet = useMemo(() => new Set(manufacturerVehicleNames), [manufacturerVehicleNames])

  const filteredNames = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const classFilterEnabled = selectedClass !== ALL_FILTER
    const manufacturerFilterEnabled = selectedManufacturer !== ALL_FILTER

    const filteredByCategory = allVehicleNames.filter((name) => {
      if (classFilterEnabled && !classSet.has(name)) {
        return false
      }

      if (manufacturerFilterEnabled && !manufacturerSet.has(name)) {
        return false
      }

      return true
    })

    if (!normalized) {
      return filteredByCategory.slice(0, MAX_RESULTS)
    }

    return filteredByCategory
      .filter((name) => name.toLowerCase().includes(normalized))
      .slice(0, MAX_RESULTS)
  }, [allVehicleNames, classSet, manufacturerSet, query, selectedClass, selectedManufacturer])

  const pickRandomVehicle = () => {
    const pool = filteredNames.length > 0 ? filteredNames : allVehicleNames

    if (pool.length === 0) {
      return
    }

    const randomIndex = Math.floor(Math.random() * pool.length)
    setSelectedVehicleName(pool[randomIndex])
  }

  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-8">
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card size="sm">
          <CardContent className="pt-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("vehicleSearch.totalVehicles")}</p>
            <p className="text-2xl font-semibold">{allVehicleNames.length}</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="pt-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("vehicleSearch.totalClasses")}</p>
            <p className="text-2xl font-semibold">{vehicleClasses.length}</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="pt-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("vehicleSearch.totalManufacturers")}</p>
            <p className="text-2xl font-semibold">{manufacturers.length}</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="pt-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("vehicleSearch.results")}</p>
            <p className="text-2xl font-semibold">{filteredNames.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle>{t("vehicleSearch.title")}</CardTitle>
            <CardDescription>{t("vehicleSearch.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("vehicleSearch.classFilter")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_FILTER}>{t("vehicleSearch.allClasses")}</SelectItem>
                  {vehicleClasses.map((vehicleClass) => (
                    <SelectItem key={vehicleClass} value={vehicleClass}>
                      {vehicleClass}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedManufacturer} onValueChange={setSelectedManufacturer}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("vehicleSearch.manufacturerFilter")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_FILTER}>{t("vehicleSearch.allManufacturers")}</SelectItem>
                  {manufacturers.map((manufacturer) => (
                    <SelectItem key={manufacturer} value={manufacturer}>
                      {manufacturer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("vehicleSearch.searchPlaceholder")}
              aria-label={t("vehicleSearch.searchPlaceholder")}
            />

            <Button type="button" variant="outline" className="w-full" onClick={pickRandomVehicle}>
              {t("vehicleSearch.randomVehicle")}
            </Button>

            {isLoadingNames ? (
              <p className="text-sm text-muted-foreground">{t("vehicleSearch.loading")}</p>
            ) : null}

            {isLoadingClassVehicles || isLoadingManufacturerVehicles ? (
              <p className="text-sm text-muted-foreground">{t("vehicleSearch.filterLoading")}</p>
            ) : null}

            {hasError ? (
              <p className="text-sm text-destructive">{t("vehicleSearch.error")}</p>
            ) : null}

            {!isLoadingNames && !hasError ? (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {t("vehicleSearch.results")}: {filteredNames.length}
                </p>
                <ul className="max-h-96 space-y-1 overflow-auto pr-1">
                  {filteredNames.map((name) => {
                    const isActive = selectedVehicleName === name

                    return (
                      <li key={name}>
                        <button
                          type="button"
                          onClick={() => setSelectedVehicleName(name)}
                          className={`w-full rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                            isActive
                              ? "border-primary bg-primary/10 text-foreground"
                              : "border-border bg-background hover:bg-muted"
                          }`}
                        >
                          {name}
                        </button>
                      </li>
                    )
                  })}
                </ul>

                {filteredNames.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("vehicleSearch.empty")}</p>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle>{t("vehicleSearch.details")}</CardTitle>
            <CardDescription>{t("vehicleSearch.source")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingVehicle ? (
              <p className="text-sm text-muted-foreground">{t("vehicleSearch.searching")}</p>
            ) : null}

            {!selectedVehicleName && !isLoadingVehicle ? (
              <p className="text-sm text-muted-foreground">{t("vehicleSearch.selectHint")}</p>
            ) : null}

            {selectedVehicle && !isLoadingVehicle ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-semibold">{selectedVehicleName}</h3>
                  {selectedVehicle.manufacturer ? (
                    <Badge variant="secondary">{selectedVehicle.manufacturer}</Badge>
                  ) : null}
                </div>

                {manufacturerLogo && !isLoadingLogo ? (
                  <div className="relative h-14 w-32 overflow-hidden rounded-md border border-border bg-background">
                    <Image
                      src={manufacturerLogo}
                      alt={selectedVehicle.manufacturer ?? "Manufacturer"}
                      fill
                      className="object-contain p-2"
                      sizes="128px"
                    />
                  </div>
                ) : null}

                {selectedVehicle.images?.side ? (
                  <div className="relative aspect-21/10 w-full overflow-hidden rounded-lg border border-border">
                    <Image
                      src={selectedVehicle.images.side}
                      alt={selectedVehicleName ?? "Vehicle"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 60vw"
                    />
                  </div>
                ) : null}

                <div className="grid gap-3 sm:grid-cols-2">
                  {selectedVehicle.manufacturer ? (
                    <div className="rounded-md border border-border bg-muted/30 p-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        {t("vehicleSearch.manufacturer")}
                      </p>
                      <p className="text-sm font-medium">{selectedVehicle.manufacturer}</p>
                    </div>
                  ) : null}

                  {typeof selectedVehicle.seats === "number" ? (
                    <div className="rounded-md border border-border bg-muted/30 p-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        {t("vehicleSearch.seats")}
                      </p>
                      <p className="text-sm font-medium">{selectedVehicle.seats}</p>
                    </div>
                  ) : null}

                  {typeof selectedVehicle.price === "number" ? (
                    <div className="rounded-md border border-border bg-muted/30 p-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        {t("vehicleSearch.price")}
                      </p>
                      <p className="text-sm font-medium">
                        {formatMoney(selectedVehicle.price, locale)}
                      </p>
                    </div>
                  ) : null}

                  {selectedVehicle.topSpeed ? (
                    <div className="rounded-md border border-border bg-muted/30 p-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        {t("vehicleSearch.topSpeed")}
                      </p>
                      <p className="text-sm font-medium">
                        {selectedVehicle.topSpeed.mph ?? "-"} mph / {selectedVehicle.topSpeed.kmh ?? "-"} km/h
                      </p>
                    </div>
                  ) : null}
                </div>

                <div className="rounded-md border border-border p-3">
                  <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                    {t("vehicleSearch.stats")}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <p className="text-sm">Speed: {selectedVehicle.speed ?? "-"}</p>
                    <p className="text-sm">Acceleration: {selectedVehicle.acceleration ?? "-"}</p>
                    <p className="text-sm">Braking: {selectedVehicle.braking ?? "-"}</p>
                    <p className="text-sm">Handling: {selectedVehicle.handling ?? "-"}</p>
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
