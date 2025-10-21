"use client"

import { Switch } from "@/components/ui/switch"
import { Moon, Sun } from "lucide-react"

interface NightModeToggleProps {
  enabled: boolean
  onChange: (value: boolean) => void
}

export function NightModeToggle({ enabled, onChange }: NightModeToggleProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2">
      <Sun className="h-4 w-4 text-amber-500" aria-hidden />
      <Switch checked={enabled} onCheckedChange={onChange} aria-label="Toggle night mode" />
      <Moon className="h-4 w-4 text-indigo-600" aria-hidden />
    </div>
  )
}

