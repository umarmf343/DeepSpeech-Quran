"use client"

import type { FormEvent } from "react"
import { useEffect, useMemo, useState, useTransition } from "react"
import Link from "next/link"
import {
  Bell,
  BookOpen,
  CheckCircle2,
  Crown,
  Lock,
  Palette,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

import AppLayout from "@/components/app-layout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useUser } from "@/hooks/use-user"

interface FormState {
  reciter: string
  translation: string
  translationLanguage: string
  playbackSpeed: string
  challengeOptIn: boolean
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  seniorMode: boolean
  accessibilityFontSize: "normal" | "large"
  heroAnimation: boolean
}

const reciterOptions = [
  "Mishary Rashid",
  "Maher Al-Muaiqly",
  "Abdul Basit",
  "Saad Al-Ghamdi",
]

const translationOptions = [
  { value: "Sahih International", label: "Sahih International" },
  { value: "Muhsin Khan", label: "Muhsin Khan" },
  { value: "Dr. Mustafa Khattab", label: "Clear Quran (Khattab)" },
  { value: "Maulana Wahiduddin Khan", label: "Wahiduddin Khan" },
]

const translationLanguageOptions = [
  { value: "en", label: "English" },
  { value: "ar", label: "Arabic" },
  { value: "fr", label: "French" },
  { value: "ur", label: "Urdu" },
]

const playbackSpeedOptions = ["0.75", "1", "1.25", "1.5"]

export default function ProfileSettingsPage() {
  const {
    profile,
    preferences,
    updatePreferences,
    perks,
    lockedPerks,
    isPremium,
    upgradeToPremium,
    downgradeToFree,
  } = useUser()
  const [formState, setFormState] = useState<FormState>(() => ({
    reciter: preferences.reciter,
    translation: preferences.translation,
    translationLanguage: preferences.translationLanguage,
    playbackSpeed: preferences.playbackSpeed.toString(),
    challengeOptIn: preferences.challengeOptIn,
    notifications: { ...preferences.notifications },
    seniorMode: preferences.seniorMode,
    accessibilityFontSize: preferences.accessibilityFontSize,
    heroAnimation: preferences.heroAnimation,
  }))
  const [isPending, startTransition] = useTransition()
  const [isPlanPending, startPlanTransition] = useTransition()
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [statusTone, setStatusTone] = useState<"success" | "error">("success")

  useEffect(() => {
    setFormState({
      reciter: preferences.reciter,
      translation: preferences.translation,
      translationLanguage: preferences.translationLanguage,
      playbackSpeed: preferences.playbackSpeed.toString(),
      challengeOptIn: preferences.challengeOptIn,
      notifications: { ...preferences.notifications },
      seniorMode: preferences.seniorMode,
      accessibilityFontSize: preferences.accessibilityFontSize,
      heroAnimation: preferences.heroAnimation,
    })
  }, [preferences])

  const initials = useMemo(() => {
    return profile.name
      .split(" ")
      .map((segment) => segment.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2)
  }, [profile.name])

  const planBadge = profile.plan === "premium" ? "Premium" : "Free"

  const joinDateLabel = useMemo(() => {
    if (!profile.joinedAt) {
      return "—"
    }

    const joinedDate = new Date(profile.joinedAt)
    return Number.isNaN(joinedDate.getTime()) ? "—" : joinedDate.toLocaleDateString()
  }, [profile.joinedAt])

  const handlePlanChange = () => {
    startPlanTransition(async () => {
      try {
        if (isPremium) {
          await downgradeToFree()
        } else {
          await upgradeToPremium()
        }
      } catch (error) {
        console.error("Failed to update plan", error)
      }
    })
  }

  const handleSelectChange = (key: keyof FormState) => (value: string) => {
    setFormState((previous) => ({
      ...previous,
      [key]: value,
    }))
  }

  const handleToggle = (key: keyof FormState) => (checked: boolean) => {
    setFormState((previous) => ({
      ...previous,
      [key]: checked,
    }))
  }

  const handleNotificationToggle = (channel: keyof FormState["notifications"]) => (checked: boolean) => {
    setFormState((previous) => ({
      ...previous,
      notifications: {
        ...previous.notifications,
        [channel]: checked,
      },
    }))
  }

  const handleFontSizeChange = (value: string) => {
    if (value === "normal" || value === "large") {
      setFormState((previous) => ({
        ...previous,
        accessibilityFontSize: value,
      }))
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatusMessage(null)

    startTransition(async () => {
      try {
        await updatePreferences({
          reciter: formState.reciter,
          translation: formState.translation,
          translationLanguage: formState.translationLanguage,
          playbackSpeed: Number.parseFloat(formState.playbackSpeed),
          challengeOptIn: formState.challengeOptIn,
          notifications: { ...formState.notifications },
          seniorMode: formState.seniorMode,
          accessibilityFontSize: formState.accessibilityFontSize,
          heroAnimation: formState.heroAnimation,
        })
        setStatusTone("success")
        setStatusMessage("Your preferences have been updated.")
      } catch (error) {
        console.error("Failed to update profile preferences", error)
        setStatusTone("error")
        setStatusMessage("We could not save your changes. Please try again.")
      }
    })
  }

  return (
    <AppLayout>
      <div className="space-y-8 p-6 lg:p-10">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-maroon-600 via-maroon-500 to-amber-500 p-6 text-white shadow-xl">
          <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-white/10 blur-3xl" aria-hidden />
          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20 border-4 border-white/20 shadow-lg">
                <AvatarImage src={profile.avatarUrl ?? undefined} alt={profile.name} />
                <AvatarFallback className="bg-white/20 text-2xl font-semibold text-white">{initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
                  <Sparkles className="h-3 w-3" /> Profile settings
                </div>
                <div>
                  <h1 className="text-3xl font-bold md:text-4xl">Hi {profile.name.split(" ")[0]}!</h1>
                  <p className="text-white/80">Fine-tune how you experience the Qur'an across the platform.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-white/90">
                  <span>{profile.email}</span>
                  <Separator orientation="vertical" className="hidden h-5 bg-white/30 md:flex" />
                  <span className="uppercase tracking-[0.2em]">{profile.locale}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start gap-3 md:items-end">
              <Badge className="border-0 bg-white text-maroon-700 shadow-lg">{planBadge} Plan</Badge>
              <Button asChild variant="secondary" className="bg-white/20 text-white hover:bg-white/10">
                <Link href="/auth/profile">Back to profile</Link>
              </Button>
            </div>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="space-y-6">
          {statusMessage ? (
            <div
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-sm ${
                statusTone === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
              role={statusTone === "error" ? "alert" : "status"}
            >
              <CheckCircle2 className={`h-4 w-4 ${statusTone === "success" ? "text-emerald-600" : "text-red-500"}`} />
              <span>{statusMessage}</span>
            </div>
          ) : null}

          <Card className="border-none bg-white/80 shadow-lg backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-maroon-900">
                <ShieldCheck className="h-5 w-5 text-maroon-600" />
                Account overview
              </CardTitle>
              <CardDescription>Review your basic account details.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={profile.name} disabled className="bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={profile.email} disabled className="bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" value={profile.role} disabled className="bg-slate-50 capitalize" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="locale">Locale</Label>
                <Input id="locale" value={profile.locale} disabled className="bg-slate-50 uppercase" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-white/80 shadow-lg backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-maroon-900">
                <BookOpen className="h-5 w-5 text-maroon-600" />
                Learning preferences
              </CardTitle>
              <CardDescription>Choose how recitation and translations are delivered.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="reciter">Preferred reciter</Label>
                <Select value={formState.reciter} onValueChange={handleSelectChange("reciter")}>
                  <SelectTrigger id="reciter">
                    <SelectValue placeholder="Select a reciter" />
                  </SelectTrigger>
                  <SelectContent>
                    {reciterOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="translation">Translation edition</Label>
                <Select value={formState.translation} onValueChange={handleSelectChange("translation")}>
                  <SelectTrigger id="translation">
                    <SelectValue placeholder="Select a translation" />
                  </SelectTrigger>
                  <SelectContent>
                    {translationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="translationLanguage">Translation language</Label>
                <Select
                  value={formState.translationLanguage}
                  onValueChange={handleSelectChange("translationLanguage")}
                >
                  <SelectTrigger id="translationLanguage">
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent>
                    {translationLanguageOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="playbackSpeed">Playback speed</Label>
                <Select value={formState.playbackSpeed} onValueChange={handleSelectChange("playbackSpeed")}>
                  <SelectTrigger id="playbackSpeed">
                    <SelectValue placeholder="Choose speed" />
                  </SelectTrigger>
                  <SelectContent>
                    {playbackSpeedOptions.map((speed) => (
                      <SelectItem key={speed} value={speed}>
                        {speed}x
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-full flex items-center justify-between rounded-2xl bg-maroon-50/70 px-4 py-3">
                <div>
                  <p className="font-medium text-maroon-900">Opt into challenges</p>
                  <p className="text-sm text-maroon-600">
                    Receive curated memorization quests and weekly competitions aligned with your goals.
                  </p>
                </div>
                <Switch checked={formState.challengeOptIn} onCheckedChange={handleToggle("challengeOptIn")} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-white/80 shadow-lg backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-maroon-900">
                <Bell className="h-5 w-5 text-maroon-600" />
                Notifications
              </CardTitle>
              <CardDescription>Control how we keep you updated about your Qur'anic journey.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-maroon-100 bg-maroon-50/60 px-4 py-3">
                <div>
                  <p className="font-medium text-maroon-900">Email reminders</p>
                  <p className="text-sm text-maroon-600">Progress summaries, upcoming lessons, and gentle nudges.</p>
                </div>
                <Switch
                  checked={formState.notifications.email}
                  onCheckedChange={handleNotificationToggle("email")}
                />
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-amber-100 bg-amber-50/60 px-4 py-3">
                <div>
                  <p className="font-medium text-amber-900">Push notifications</p>
                  <p className="text-sm text-amber-700">Instant highlights when you unlock milestones.</p>
                </div>
                <Switch
                  checked={formState.notifications.push}
                  onCheckedChange={handleNotificationToggle("push")}
                />
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
                <div>
                  <p className="font-medium text-emerald-900">SMS alerts</p>
                  <p className="text-sm text-emerald-700">Focused reminders for live sessions and teacher feedback.</p>
                </div>
                <Switch
                  checked={formState.notifications.sms}
                  onCheckedChange={handleNotificationToggle("sms")}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-white/80 shadow-lg backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-maroon-900">
                <Palette className="h-5 w-5 text-maroon-600" />
                Accessibility & experience
              </CardTitle>
              <CardDescription>Make the interface comfortable for every recitation session.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fontSize">Reading comfort</Label>
                  <Select value={formState.accessibilityFontSize} onValueChange={handleFontSizeChange}>
                    <SelectTrigger id="fontSize">
                      <SelectValue placeholder="Choose font size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Standard text size</SelectItem>
                      <SelectItem value="large">Large text (senior friendly)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heroAnimation">Hero animation</Label>
                  <div className="flex items-center justify-between rounded-2xl border border-purple-100 bg-purple-50/60 px-4 py-3">
                    <div>
                      <p className="font-medium text-purple-900">Animated dashboard hero</p>
                      <p className="text-sm text-purple-700">Enable gentle motion on the home experience banner.</p>
                    </div>
                    <Switch
                      checked={formState.heroAnimation}
                      onCheckedChange={handleToggle("heroAnimation")}
                      id="heroAnimation"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <p className="font-medium text-slate-900">Senior mode</p>
                  <p className="text-sm text-slate-600">
                    High-contrast visuals, simplified navigation, and larger targets for gentle interaction.
                  </p>
                </div>
                <Switch checked={formState.seniorMode} onCheckedChange={handleToggle("seniorMode")} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-white/80 shadow-lg backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-maroon-900">
                <Crown className="h-5 w-5 text-maroon-600" />
                Plan & perks
              </CardTitle>
              <CardDescription>
                Explore what your current membership unlocks and discover premium exclusives.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-2 rounded-2xl border border-maroon-100 bg-maroon-50/60 px-4 py-3 text-maroon-900 shadow-sm">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-maroon-500">Current plan</p>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="secondary" className="border-none bg-maroon-600 text-white">
                    {planBadge} access
                  </Badge>
                  <span className="text-sm text-maroon-600">Joined {joinDateLabel}</span>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-maroon-500">
                    <Sparkles className="h-4 w-4" /> Included features
                  </h3>
                  <ul className="space-y-2 text-sm text-maroon-800">
                    {perks.map((perk) => (
                      <li
                        key={perk}
                        className="flex items-start gap-2 rounded-xl border border-maroon-100 bg-white/70 px-3 py-2 shadow-sm"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {lockedPerks.length > 0 ? (
                  <div className="space-y-3">
                    <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                      <Lock className="h-4 w-4" /> Premium exclusives
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-600">
                      {lockedPerks.map((perk) => (
                        <li
                          key={perk}
                          className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2"
                        >
                          <Lock className="mt-0.5 h-4 w-4 text-slate-400" />
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-maroon-100 bg-white/70 px-4 py-3">
                <div className="space-y-1">
                  <p className="font-medium text-maroon-900">
                    {isPremium ? "Keep nurturing your premium streak" : "Unlock premium journeys"}
                  </p>
                  <p className="text-sm text-maroon-600">
                    {isPremium
                      ? "Continue accessing advanced memorization journeys and early beta features."
                      : "Gain access to guided memorization pathways, exclusive challenges, and premium support."}
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handlePlanChange}
                  disabled={isPlanPending}
                  className={`min-w-[10rem] ${
                    isPremium ? "bg-slate-900 hover:bg-slate-800" : "bg-gradient-to-r from-amber-500 to-maroon-600"
                  } text-white`}
                >
                  {isPlanPending ? "Updating..." : isPremium ? "Switch to Free" : "Upgrade to Premium"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" type="button" asChild>
              <Link href="/dashboard">Cancel</Link>
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-maroon-600 to-maroon-700 text-white"
              disabled={isPending}
            >
              {isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
