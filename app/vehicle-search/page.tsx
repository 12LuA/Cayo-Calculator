import type { Metadata } from "next"

import { VehicleSearchClient } from "@/components/vehicles/vehicle-search-client"

export const metadata: Metadata = {
  title: "GTA Vehicle Search - Find Cars And Stats",
  description:
    "Search and find GTA vehicles with live data from gta.vercel.app including speed, acceleration, seats, and prices.",
}

export default function VehicleSearchPage() {
  return <VehicleSearchClient />
}
