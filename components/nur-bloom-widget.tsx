"use client"

import { useEffect, useMemo, useState } from "react"

import { Sparkles, PauseCircle, PlayCircle, Feather, Leaf, MoonStar } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import type { NurBloomState, NurBloomTheme } from "@/hooks/use-nur-bloom-challenge"

interface NurBloomWidgetProps {
  state: NurBloomState
  onEnable: () => void
  onDisable: () => void
  onDismissPrompt: () => void
  onThemeChange: (theme: NurBloomTheme) => void
  onToggleGentleMode: (value?: boolean) => void
  onToggleSound: (value?: boolean) => void
  onAcknowledgeCelebration: () => void
  onReflectionPromptSeen: () => void
}

const THEME_META: Record<NurBloomTheme, { label: Record<string, string>; gradient: string; accent: string; icon: JSX.Element } > = {
  blossom: {
    label: {
      en: "Blossom",
      ar: "ازدهار",
      id: "Mekar",
      ur: "کھلنا",
    },
    gradient: "from-emerald-200 via-teal-200 to-sky-200",
    accent: "text-emerald-700",
    icon: <Leaf className="h-4 w-4" />,
  },
  lantern: {
    label: {
      en: "Lantern Glow",
      ar: "نور الفانوس",
      id: "Cahaya Lentera",
      ur: "چراغ کی روشنی",
    },
    gradient: "from-amber-200 via-amber-100 to-blue-100",
    accent: "text-amber-700",
    icon: <MoonStar className="h-4 w-4" />,
  },
  child: {
    label: {
      en: "Child Mode",
      ar: "وضع الصغار",
      id: "Mode Anak",
      ur: "بچوں کا انداز",
    },
    gradient: "from-sky-200 via-emerald-200 to-pink-200",
    accent: "text-sky-700",
    icon: <Feather className="h-4 w-4" />,
  },
}

const COPY: Record<string, { title: string; subtitle: string; enable: string; dismiss: string; versesLabel: string; pause: string; resume: string; gentle: string; sound: string; weeklyPrompt: string; journalCta: string; promptTitle: string; promptBody: string; onLabel: string; offLabel: string; progressAria: (current: number, target: number) => string }> = {
  en: {
    title: "Nur Bloom Companion",
    subtitle: "Let each ayah bloom into light.",
    enable: "Enable Nur Bloom",
    dismiss: "Maybe later",
    versesLabel: "verses recited",
    pause: "Pause companion",
    resume: "Resume companion",
    gentle: "Gentle Mode",
    sound: "Soft chime",
    weeklyPrompt: "How did these verses touch your heart?",
    journalCta: "Reflect quietly",
    promptTitle: "Try Nur Bloom?",
    promptBody: "A gentle companion that celebrates your recitation journey.",
    onLabel: "On",
    offLabel: "Off",
    progressAria: (current, target) => `Nur Bloom progress: ${current} of ${target} verses recited`,
  },
  ar: {
    title: "مرافق نور بلوم",
    subtitle: "دع كل آية تتفتح إلى نور.",
    enable: "تشغيل نور بلوم",
    dismiss: "لاحقًا",
    versesLabel: "آيات متلوة",
    pause: "إيقاف المرافق",
    resume: "استئناف المرافق",
    gentle: "وضع لطيف",
    sound: "رنّة هادئة",
    weeklyPrompt: "كيف لامستك هذه الآيات؟",
    journalCta: "تأمل بهدوء",
    promptTitle: "تجربة نور بلوم؟",
    promptBody: "رفيق لطيف يحتفي برحلة تلاوتك.",
    onLabel: "تشغيل",
    offLabel: "إيقاف",
    progressAria: (current, target) => `تقدم نور بلوم: ${current} من ${target} آيات`,
  },
  id: {
    title: "Pendamping Nur Bloom",
    subtitle: "Biarkan tiap ayat mekar menjadi cahaya.",
    enable: "Aktifkan Nur Bloom",
    dismiss: "Nanti saja",
    versesLabel: "ayat tilawah",
    pause: "Jeda pendamping",
    resume: "Lanjutkan pendamping",
    gentle: "Mode lembut",
    sound: "Nada lembut",
    weeklyPrompt: "Bagaimana ayat ini menyentuh hatimu?",
    journalCta: "Renungkan sejenak",
    promptTitle: "Coba Nur Bloom?",
    promptBody: "Pendamping lembut yang merayakan perjalanan tilawahmu.",
    onLabel: "Aktif",
    offLabel: "Nonaktif",
    progressAria: (current, target) => `Progres Nur Bloom: ${current} dari ${target} ayat`,
  },
  ur: {
    title: "نور بلوم ساتھی",
    subtitle: "ہر آیت کو روشنی میں کھلنے دیں۔",
    enable: "نور بلوم فعال کریں",
    dismiss: "بعد میں",
    versesLabel: "آیات کی تلاوت",
    pause: "ساتھی کو موقوف کریں",
    resume: "ساتھی کو جاری کریں",
    gentle: "نرم انداز",
    sound: "ہلکی آواز",
    weeklyPrompt: "ان آیات نے دل کو کیسے چھوا؟",
    journalCta: "خاموشی سے غور کریں",
    promptTitle: "نور بلوم آزمائیں؟",
    promptBody: "ایک نرم ساتھی جو آپ کی تلاوت کا جشن مناتا ہے۔",
    onLabel: "چالو",
    offLabel: "بند",
    progressAria: (current, target) => `نور بلوم پیش رفت: ${current} میں سے ${target} آیات`,
  },
}

const CELEBRATION_DURATION = 2400

export function NurBloomWidget({
  state,
  onEnable,
  onDisable,
  onDismissPrompt,
  onThemeChange,
  onToggleGentleMode,
  onToggleSound,
  onAcknowledgeCelebration,
  onReflectionPromptSeen,
}: NurBloomWidgetProps) {
  const copy = COPY[state.locale] ?? COPY.en
  const direction = state.locale === "ar" ? "rtl" : "ltr"
  const [showCelebration, setShowCelebration] = useState(false)

  useEffect(() => {
    if (state.celebration?.active) {
      setShowCelebration(true)
      const timeout = setTimeout(() => {
        setShowCelebration(false)
        onAcknowledgeCelebration()
      }, CELEBRATION_DURATION)
      return () => clearTimeout(timeout)
    }
  }, [onAcknowledgeCelebration, state.celebration?.active])

  const bloomIcon = useMemo(() => {
    return <Sparkles className="h-4 w-4 text-emerald-600" />
  }, [])

  const themeMeta = THEME_META[state.theme]
  const verseCountLabel = `${state.currentStreak}/${state.targetVerses}`
  const ariaProgress = copy.progressAria(state.currentStreak, state.targetVerses)

  return (
    <div className="pointer-events-none relative" dir={direction}>
      {!state.enabled && !state.promptDismissed ? (
        <div className="pointer-events-auto absolute right-0 top-0 z-40 w-64">
          <div className="flex flex-col gap-2 rounded-2xl border border-emerald-200/60 bg-white/95 p-4 shadow-xl">
            <div className="flex items-center gap-2 text-emerald-700">
              {bloomIcon}
              <span className="text-sm font-semibold">{copy.promptTitle}</span>
            </div>
            <p className="text-sm text-muted-foreground">{copy.promptBody}</p>
            <div className="flex flex-col gap-2 pt-1">
              <Button className="w-full bg-emerald-500 hover:bg-emerald-600" onClick={onEnable}>
                {copy.enable}
              </Button>
              <Button variant="ghost" className="w-full text-muted-foreground hover:text-emerald-700" onClick={onDismissPrompt}>
                {copy.dismiss}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {state.enabled ? (
        <Card className="pointer-events-auto relative w-72 overflow-hidden border border-emerald-200/60 bg-white/90 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-white/70">
          <CardContent className="space-y-4 p-4" role="complementary" aria-label={copy.title}>
            <div className="sr-only" aria-live="polite">
              {copy.progressAria(state.currentStreak, state.targetVerses)}
            </div>
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">{copy.title}</p>
                <p className="text-xs text-muted-foreground">{copy.subtitle}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={state.enabled ? copy.pause : copy.resume}
                  onClick={state.enabled ? onDisable : onEnable}
                >
                  {state.enabled ? <PauseCircle className="h-5 w-5 text-emerald-600" /> : <PlayCircle className="h-5 w-5 text-emerald-600" />}
                </Button>
              </div>
            </div>

            <div className={`relative flex items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-br ${themeMeta.gradient} p-4`}> 
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
                  {themeMeta.icon}
                  <span>{copy.versesLabel}</span>
                </div>
                <div className={`text-xl font-bold ${themeMeta.accent}`}>{verseCountLabel}</div>
              </div>
              <CircularProgress value={state.percentage} theme={state.theme} gentle={state.gentleMode} ariaLabel={ariaProgress} />
            </div>

            {state.celebration?.encouragement ? (
              <p className="rounded-xl bg-emerald-50/80 p-3 text-xs text-emerald-700 shadow-inner">{state.celebration.encouragement}</p>
            ) : null}

            {state.weeklyReflectionDue ? (
              <button
                type="button"
                className="w-full rounded-xl border border-emerald-200 bg-white/80 p-3 text-left text-xs text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-50"
                onClick={onReflectionPromptSeen}
              >
                <span className="block font-semibold">{copy.weeklyPrompt}</span>
                <span className="mt-1 block text-[11px] text-emerald-600">{copy.journalCta}</span>
              </button>
            ) : null}

            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-[11px] text-muted-foreground">Theme</Label>
                <RadioGroup
                  value={state.theme}
                  onValueChange={(value) => onThemeChange(value as NurBloomTheme)}
                  className="grid grid-cols-3 gap-2"
                >
                  {Object.entries(THEME_META).map(([key, meta]) => (
                    <Label
                      key={key}
                      className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border bg-white/80 p-2 text-[11px] transition hover:border-emerald-300 ${
                        state.theme === key ? "border-emerald-400 shadow-sm" : "border-transparent"
                      }`}
                    >
                      <RadioGroupItem value={key} className="sr-only" />
                      <span className="text-emerald-600">{meta.icon}</span>
                      <span className="text-xs font-medium text-slate-700">{meta.label[state.locale] ?? meta.label.en}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/50 px-3 py-2">
                <div>
                  <p className="text-xs font-medium text-emerald-800">{copy.gentle}</p>
                  <p className="text-[11px] text-emerald-600">{state.gentleMode ? copy.onLabel : copy.offLabel}</p>
                </div>
                <Switch checked={state.gentleMode} onCheckedChange={(value) => onToggleGentleMode(value)} />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/50 px-3 py-2">
                <div>
                  <p className="text-xs font-medium text-emerald-800">{copy.sound}</p>
                  <p className="text-[11px] text-emerald-600">{state.soundEnabled ? copy.onLabel : copy.offLabel}</p>
                </div>
                <Switch checked={state.soundEnabled} onCheckedChange={(value) => onToggleSound(value)} />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {showCelebration && state.celebration ? (
        <CelebrationOverlay
          message={state.celebration.message}
          gentle={state.gentleMode || state.lowPerformanceMode}
          soundEnabled={state.soundEnabled}
        />
      ) : null}
    </div>
  )
}

interface CircularProgressProps {
  value: number
  theme: NurBloomTheme
  gentle: boolean
  ariaLabel: string
}

function CircularProgress({ value, theme, gentle, ariaLabel }: CircularProgressProps) {
  const radius = 26
  const circumference = 2 * Math.PI * radius
  const offset = circumference - value * circumference
  const themeColors: Record<NurBloomTheme, { track: string; stroke: string }> = {
    blossom: { track: "#d1fae5", stroke: "#047857" },
    lantern: { track: "#fde68a", stroke: "#b45309" },
    child: { track: "#bfdbfe", stroke: "#2563eb" },
  }

  const colors = themeColors[theme]

  return (
    <svg role="img" aria-label={ariaLabel} className="h-16 w-16" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r={radius} stroke={colors.track} strokeWidth={6} fill="none" />
      <circle
        cx="32"
        cy="32"
        r={radius}
        stroke={colors.stroke}
        strokeWidth={6}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className={gentle ? "transition-[stroke-dashoffset] duration-500 ease-out" : "animate-[dash_1.2s_ease-in-out]"}
      />
      <defs>
        <style>{`
          @keyframes dash {
            0% { stroke-dashoffset: ${circumference}; }
            100% { stroke-dashoffset: ${offset}; }
          }
        `}</style>
      </defs>
    </svg>
  )
}

interface CelebrationOverlayProps {
  message: string
  gentle: boolean
  soundEnabled: boolean
}

function CelebrationOverlay({ message, gentle, soundEnabled }: CelebrationOverlayProps) {
  const [soundPlayed, setSoundPlayed] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (gentle || !soundEnabled) {
      if (!soundEnabled) {
        setSoundPlayed(false)
      }
      return
    }

    if (soundPlayed) {
      return
    }

    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()
      oscillator.type = "sine"
      oscillator.frequency.setValueAtTime(660, ctx.currentTime)
      gain.gain.setValueAtTime(0.001, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.1, ctx.currentTime + 0.1)
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 1.2)
      oscillator.connect(gain)
      gain.connect(ctx.destination)
      oscillator.start()
      oscillator.stop(ctx.currentTime + 1.4)
      setSoundPlayed(true)
    } catch (error) {
      console.warn("Nur Bloom celebration sound could not play", error)
    }
  }, [gentle, soundEnabled, soundPlayed])
  const confettiPieces = useMemo(() => {
    if (gentle || !isClient) return []
    return Array.from({ length: 24 }, (_, index) => ({
      id: index,
      left: Math.random() * 100,
      delay: Math.random() * 0.8,
      duration: 1.6 + Math.random() * 0.6,
    }))
  }, [gentle, isClient])

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
      {!gentle ? (
        <div className="absolute inset-0 overflow-hidden">
          <style>{`
            @keyframes nurBloomConfetti {
              0% { transform: translateY(-10%) rotate(0deg); opacity: 1; }
              100% { transform: translateY(120vh) rotate(360deg); opacity: 0; }
            }
          `}</style>
          {confettiPieces.map((piece) => (
            <span
              key={piece.id}
              className="absolute block h-2 w-2 rounded-full bg-gradient-to-br from-emerald-400 via-teal-400 to-sky-400 opacity-80"
              style={{
                left: `${piece.left}%`,
                animationDelay: `${piece.delay}s`,
                animationDuration: `${piece.duration}s`,
                animationName: "nurBloomConfetti",
                animationTimingFunction: "ease-in",
                animationFillMode: "forwards",
              }}
            />
          ))}
        </div>
      ) : null}
      <div className="relative rounded-3xl bg-white/90 px-8 py-6 text-center shadow-2xl">
        <p className="text-sm font-semibold text-emerald-700">MashaAllah! 🌸</p>
        <p className="mt-2 text-xs text-emerald-600">{message}</p>
      </div>
    </div>
  )
}
