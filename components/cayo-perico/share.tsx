"use client"

import { useState } from "react"
import { Share, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { Settings } from "@/lib/cayo-perico/calculator"

type ShareButtonProps = {
  settings: Settings
}

export function ShareButton({ settings }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    try {
      // Build query string from settings
      const params = new URLSearchParams()
      params.append("amountOfPlayers", settings.players.toString())
      params.append("primaryTarget", settings.primaryTarget)
      params.append("hardMode", settings.hardMode.toString())
      params.append("withinCooldown", settings.withinCooldown.toString())
      params.append("goldAlone", settings.goldAlone.toString())
      
      // Add table amounts
      params.append("gold", settings.tables.gold.toString())
      params.append("cocaine", settings.tables.cocaine.toString())
      params.append("weed", settings.tables.weed.toString())
      params.append("paintings", settings.tables.paintings.toString())
      params.append("cash", settings.tables.cash.toString())
      
      // Add crew cuts
      params.append("leaderCut", settings.cuts.leader.toString())
      params.append("member1Cut", settings.cuts.member1.toString())
      params.append("member2Cut", settings.cuts.member2.toString())
      params.append("member3Cut", settings.cuts.member3.toString())
      
      const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`

      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl)

      // Show feedback
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={handleShare}
          className="transition-all"
        >
          {copied ? (
            <Check className="h-[1.2rem] w-[1.2rem] text-green-500" />
          ) : (
            <Share className="h-[1.2rem] w-[1.2rem]" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {copied ? "Link copied!" : "Share settings"}
      </TooltipContent>
    </Tooltip>
  )
}
