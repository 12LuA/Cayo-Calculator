"use client"

import dynamic from "next/dynamic"

const CayoPericoCalculator = dynamic(
  () => import("@/components/cayo-perico/cayo-perico-calculator"),
  { ssr: false }
)

export default CayoPericoCalculator
