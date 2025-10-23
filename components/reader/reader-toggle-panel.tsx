"use client"

import { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion"
import type { ReaderProfile } from "@/lib/reader/preference-manager"

import { Cog, Menu, PanelRightClose } from "lucide-react"

interface EditionOption {
  edition: string
  label: string
  language: string
}

interface ReaderTogglePanelProps {
  profile: ReaderProfile
  onProfileChange: (update: Partial<ReaderProfile>) => void
  translationOptions: EditionOption[]
  reciterOptions: { edition: string; label: string }[]
}

const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5]
const FONT_SIZES: ReaderProfile["fontSizeClass"][] = ["text-2xl", "text-3xl", "text-4xl"]
const LINE_HEIGHTS: ReaderProfile["lineHeightClass"][] = ["leading-relaxed", "leading-loose"]
const THEMES: ReaderProfile["theme"][] = ["auto", "light", "dark"]

export function ReaderTogglePanel({
  profile,
  onProfileChange,
  translationOptions,
  reciterOptions,
}: ReaderTogglePanelProps) {
  const isMobile = useIsMobile()
  const prefersReducedMotion = usePrefersReducedMotion()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!isMobile) {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }, [isMobile])

  const translationLabel = useMemo(() => {
    return translationOptions.find((option) => option.edition === profile.translationEdition)?.label
  }, [profile.translationEdition, translationOptions])

  const panelContent = (
    <div
      className={cn(
        "flex w-64 flex-col gap-4 p-3 text-sm transition-all duration-300 ease-in-out",
        "bg-white/80 backdrop-blur-sm shadow-lg dark:bg-slate-900/80",
        "rounded-xl border border-slate-200/70 dark:border-slate-700/80",
        prefersReducedMotion && "transition-none",
      )}
      role="region"
      aria-label="Quran reader preferences"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="toggle-translation" className="text-xs uppercase tracking-wide text-muted-foreground">
            Translation
          </Label>
          <Switch
            id="toggle-translation"
            checked={profile.showTranslation}
            onCheckedChange={(checked) => onProfileChange({ showTranslation: checked })}
            aria-label="Toggle translation"
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="toggle-transliteration" className="text-xs uppercase tracking-wide text-muted-foreground">
            Trans
          </Label>
          <Switch
            id="toggle-transliteration"
            checked={profile.showTransliteration}
            onCheckedChange={(checked) => onProfileChange({ showTransliteration: checked })}
            aria-label="Toggle transliteration"
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="toggle-full-view" className="text-xs uppercase tracking-wide text-muted-foreground">
            Full Quran View
          </Label>
          <Switch
            id="toggle-full-view"
            checked={profile.fullSurahView}
            onCheckedChange={(checked) => onProfileChange({ fullSurahView: checked })}
            aria-label="Toggle full surah view"
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="toggle-tajweed" className="text-xs uppercase tracking-wide text-muted-foreground">
            Tajweed Mushaf
          </Label>
          <Switch
            id="toggle-tajweed"
            checked={profile.showTajweed}
            onCheckedChange={(checked) => onProfileChange({ showTajweed: checked })}
            aria-label="Toggle tajweed view"
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="toggle-telemetry" className="text-xs uppercase tracking-wide text-muted-foreground">
            Help Improve
          </Label>
          <Switch
            id="toggle-telemetry"
            checked={profile.telemetryOptIn}
            onCheckedChange={(checked) => onProfileChange({ telemetryOptIn: checked })}
            aria-label="Toggle telemetry opt-in"
          />
        </div>
      </div>

      <div className="space-y-3" role="group" aria-label="Language preferences">
        <div className="space-y-1">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Translation Edition</Label>
          <Select
            value={profile.translationEdition}
            onValueChange={(value) =>
              onProfileChange({ translationEdition: value, translationLanguage: findLanguage(translationOptions, value) })
            }
          >
            <SelectTrigger className="bg-white/90 dark:bg-slate-900/60">
              <SelectValue placeholder="Translation" aria-live="polite" />
            </SelectTrigger>
            <SelectContent>
              {translationOptions.map((option) => (
                <SelectItem key={option.edition} value={option.edition}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Currently showing {translationLabel ?? "selected edition"}.</p>
        </div>

      </div>

      <div className="space-y-3" role="group" aria-label="Audio preferences">
        <div className="space-y-1">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Reciter</Label>
          <Select value={profile.reciterEdition} onValueChange={(value) => onProfileChange({ reciterEdition: value })}>
            <SelectTrigger className="bg-white/90 dark:bg-slate-900/60">
              <SelectValue placeholder="Reciter" aria-live="polite" />
            </SelectTrigger>
            <SelectContent>
              {reciterOptions.map((option) => (
                <SelectItem key={option.edition} value={option.edition}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Playback Speed</Label>
          <Select
            value={profile.playbackSpeed.toString()}
            onValueChange={(value) => onProfileChange({ playbackSpeed: Number.parseFloat(value) })}
          >
            <SelectTrigger className="bg-white/90 dark:bg-slate-900/60">
              <SelectValue placeholder="Speed" aria-live="polite" />
            </SelectTrigger>
            <SelectContent>
              {PLAYBACK_SPEEDS.map((speed) => (
                <SelectItem key={speed} value={speed.toString()}>
                  {speed.toFixed(2)}x
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3" role="group" aria-label="Appearance preferences">
        <div className="space-y-1">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Arabic Font Size</Label>
          <Select value={profile.fontSizeClass} onValueChange={(value) => onProfileChange({ fontSizeClass: value as any })}>
            <SelectTrigger className="bg-white/90 dark:bg-slate-900/60">
              <SelectValue placeholder="Font size" />
            </SelectTrigger>
            <SelectContent>
              {FONT_SIZES.map((size) => (
                <SelectItem key={size} value={size}>
                  {size.replace("text-", "").toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Line Height</Label>
          <Select
            value={profile.lineHeightClass}
            onValueChange={(value) => onProfileChange({ lineHeightClass: value as any })}
          >
            <SelectTrigger className="bg-white/90 dark:bg-slate-900/60">
              <SelectValue placeholder="Line height" />
            </SelectTrigger>
            <SelectContent>
              {LINE_HEIGHTS.map((height) => (
                <SelectItem key={height} value={height}>
                  {height.replace("leading-", "").replace("-", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Theme</Label>
          <Select value={profile.theme} onValueChange={(value) => onProfileChange({ theme: value as any })}>
            <SelectTrigger className="bg-white/90 dark:bg-slate-900/60">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              {THEMES.map((theme) => (
                <SelectItem key={theme} value={theme}>
                  {theme[0]?.toUpperCase() + theme.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )

  if (!isMobile) {
    return (
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="fixed top-20 right-4 z-20 flex flex-col items-end gap-3"
        data-state={profile.fullSurahView ? "expanded" : "condensed"}
      >
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:bg-white dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-900"
            aria-expanded={isOpen}
          >
            <Cog className="h-4 w-4" aria-hidden="true" />
            <span>Preferences</span>
            <span className="ml-1 text-slate-500 dark:text-slate-400">
              {isOpen ? <PanelRightClose className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </span>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent asChild>{panelContent}</CollapsibleContent>
      </Collapsible>
    )
  }

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="fixed bottom-6 right-4 z-30 flex flex-col items-end gap-3"
    >
      <CollapsibleTrigger asChild>
        <Button
          size="icon"
          variant="default"
          className="h-14 w-14 rounded-full shadow-xl"
          aria-label={isOpen ? "Hide reader preferences" : "Show reader preferences"}
        >
          {isOpen ? <PanelRightClose className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent asChild>{panelContent}</CollapsibleContent>
    </Collapsible>
  )
}

function findLanguage(options: EditionOption[], edition: string): string {
  return options.find((option) => option.edition === edition)?.language ?? "en"
}
