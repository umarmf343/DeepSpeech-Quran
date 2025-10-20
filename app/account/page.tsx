"use client"

import { useMemo, useState } from "react"
import Link from "next/link"

import AppLayout from "@/components/app-layout"
import { useUser } from "@/hooks/use-user"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Crown,
  Lock,
  Mail,
  MapPin,
  MonitorSmartphone,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  Zap,
} from "lucide-react"

function getInitials(name: string) {
  const [first = "", second = ""] = name.split(" ")
  return (first.charAt(0) + second.charAt(0)).toUpperCase()
}

export default function AccountPage() {
  const { profile, stats, perks, lockedPerks, isPremium, upgradeToPremium, downgradeToFree } = useUser()
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true)
  const [loginAlertsEnabled, setLoginAlertsEnabled] = useState(true)

  const joinDate = useMemo(() => {
    try {
      return new Intl.DateTimeFormat("en", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date(profile.joinedAt))
    } catch (error) {
      console.error("[account-page] Failed to parse join date", error)
      return profile.joinedAt
    }
  }, [profile.joinedAt])

  const levelTarget = stats.xp + stats.xpToNext
  const levelProgress = levelTarget === 0 ? 0 : Math.round((stats.xp / levelTarget) * 100)

  const planLabel = isPremium ? "Premium Plan" : "Free Plan"
  const planGradient = isPremium
    ? "from-amber-500 via-rose-500 to-maroon-600"
    : "from-emerald-400 via-emerald-500 to-teal-500"

  const profileHighlights = [
    {
      label: "Hasanat Earned",
      value: stats.hasanat.toLocaleString(),
      icon: Sparkles,
      accent: "text-amber-600 bg-amber-100/80",
    },
    {
      label: "Ayahs Completed",
      value: stats.ayahsRead.toLocaleString(),
      icon: Target,
      accent: "text-emerald-600 bg-emerald-100/80",
    },
    {
      label: "Current Streak",
      value: `${stats.streak} days`,
      icon: Zap,
      accent: "text-sky-600 bg-sky-100/80",
    },
  ]

  const contactDetails = [
    { label: "Email", value: profile.email, icon: Mail },
    { label: "Preferred Locale", value: profile.locale.toUpperCase(), icon: MapPin },
    { label: "Member Since", value: joinDate, icon: Calendar },
  ]

  const deviceSessions = [
    { name: "MacBook Pro", location: "Lagos, Nigeria", lastActive: "2 hours ago" },
    { name: "iPhone 15", location: "Abuja, Nigeria", lastActive: "Yesterday" },
    { name: "Samsung Tablet", location: "Abuja, Nigeria", lastActive: "Last week" },
  ]

  return (
    <AppLayout>
      <div className="space-y-8 px-4 pb-16 pt-6 md:px-8 lg:px-12">
        <section className="relative overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-br from-maroon-600 via-rose-500 to-amber-400 p-8 text-white shadow-2xl">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -bottom-24 right-10 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute -top-24 left-20 h-56 w-56 rounded-full bg-amber-300/40 blur-3xl" />
          </div>
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
              <div className="relative">
                <div className="absolute -inset-1 rounded-3xl bg-white/20 blur" />
                <Avatar className="relative h-20 w-20 rounded-2xl border-2 border-white/60 shadow-xl">
                  {profile.avatarUrl ? (
                    <AvatarImage src={profile.avatarUrl} alt={profile.name} />
                  ) : (
                    <AvatarFallback className="bg-white/30 text-2xl font-semibold text-white">
                      {getInitials(profile.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
              <div className="space-y-2">
                <div className="inline-flex items-center gap-3">
                  <Badge className="border-0 bg-white/20 text-xs font-semibold uppercase tracking-wide text-white">
                    {profile.role}
                  </Badge>
                  <Badge className="border-0 bg-white/20 text-xs font-semibold uppercase tracking-wide text-white">
                    {planLabel}
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">Assalamu Alaikum, {profile.name}</h1>
                <p className="max-w-xl text-sm text-white/80 lg:text-base">
                  Keep nurturing your Qur&apos;an journey with personalized insights, vibrant achievements, and soulful progress
                  tracking across all your devices.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  {profileHighlights.map(({ label, value, icon: Icon, accent }) => (
                    <div
                      key={label}
                      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium shadow-lg backdrop-blur ${accent}`}
                    >
                      <Icon className="h-4 w-4" />
                      <div>
                        <p className="text-xs uppercase text-current/80">{label}</p>
                        <p className="text-base text-current">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl bg-white/10 p-6 text-sm shadow-lg backdrop-blur">
              <div className="flex items-center gap-2 text-white/80">
                <ShieldCheck className="h-5 w-5" />
                <span>Account Health</span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-white/70">Level {stats.level}</p>
                <p className="flex items-center gap-2 text-lg font-semibold">
                  {levelProgress}% towards next milestone
                  <ArrowUpRight className="h-4 w-4" />
                </p>
              </div>
              <Progress value={levelProgress} className="h-2 bg-white/20" />
              <div className="flex items-center justify-between text-xs text-white/75">
                <span>{stats.xp.toLocaleString()} XP earned</span>
                <span>{stats.xpToNext.toLocaleString()} XP to next level</span>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  className={`flex-1 border-0 bg-gradient-to-r ${planGradient} text-white shadow-lg`}
                  onClick={() => {
                    if (isPremium) {
                      downgradeToFree()
                    } else {
                      upgradeToPremium()
                    }
                  }}
                >
                  {isPremium ? "Manage Premium" : "Upgrade to Premium"}
                </Button>
                <Button variant="outline" className="flex-1 border-white/50 bg-white/10 text-white hover:bg-white/20" asChild>
                  <Link href="/billing">
                    View Billing
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <Card className="border-none bg-white/70 shadow-xl backdrop-blur">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-2 text-maroon-900">
                  <Crown className="h-5 w-5 text-amber-500" />
                  Profile &amp; Contact
                </CardTitle>
                <CardDescription className="text-maroon-600">
                  Update how others see and reach you across the institute.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {contactDetails.map(({ label, value, icon: Icon }) => (
                    <div key={label} className="flex items-center gap-3 rounded-xl border border-maroon-100/60 bg-white/60 p-4 shadow-sm">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-maroon-500/10 text-maroon-600">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-maroon-500">{label}</p>
                        <p className="text-sm font-semibold text-maroon-900">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="bg-maroon-100/70" />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 via-white to-emerald-500/10 p-5 shadow-inner">
                    <div className="flex items-center gap-3">
                      <Trophy className="h-5 w-5 text-emerald-600" />
                      <div>
                        <p className="text-xs uppercase tracking-wider text-emerald-600">Weekly XP</p>
                        <p className="text-xl font-bold text-emerald-700">{stats.weeklyXP.reduce((total, value) => total + value, 0).toLocaleString()} XP</p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-emerald-700/80">
                      Stay consistent to unlock golden trophies and leaderboards reserved for top reciters.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gradient-to-br from-sky-500/10 via-white to-sky-500/10 p-5 shadow-inner">
                    <div className="flex items-center gap-3">
                      <Star className="h-5 w-5 text-sky-600" />
                      <div>
                        <p className="text-xs uppercase tracking-wider text-sky-600">Daily Goals</p>
                        <p className="text-xl font-bold text-sky-700">{stats.completedHabits} habits completed</p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-sky-700/80">
                      Refine your memorization rhythm by aligning reminders with your most focused hours.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none bg-white/70 shadow-xl backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-maroon-900">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  Learning Journey
                </CardTitle>
                <CardDescription className="text-maroon-600">
                  Tailored experiences curated for your progress path.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-widest text-maroon-500">Active Benefits</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {perks.map((perk) => (
                      <div
                        key={perk}
                        className="flex items-start gap-3 rounded-2xl border border-emerald-100/80 bg-emerald-50/70 p-4 text-sm text-emerald-800 shadow-sm"
                      >
                        <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600">
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold">{perk}</p>
                          <p className="text-xs text-emerald-700/80">Included in your current plan</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {lockedPerks.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-widest text-maroon-500">Unlockable with Premium</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {lockedPerks.map((perk) => (
                        <div
                          key={perk}
                          className="flex items-start gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/80 p-4 text-sm text-amber-800 shadow-sm"
                        >
                          <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 text-amber-600">
                            <Lock className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-semibold">{perk}</p>
                            <p className="text-xs text-amber-700/80">Upgrade to unlock this experience</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card className="border-none bg-white/70 shadow-xl backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-maroon-900">
                  <MonitorSmartphone className="h-5 w-5 text-sky-500" />
                  Connected Devices
                </CardTitle>
                <CardDescription className="text-maroon-600">
                  Manage where your account is signed in.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {deviceSessions.map((device) => (
                  <div
                    key={device.name}
                    className="flex flex-col gap-1 rounded-2xl border border-sky-100/80 bg-sky-50/60 p-4 shadow-sm md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-sky-700">{device.name}</p>
                      <p className="text-xs text-sky-600/80">{device.location}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-sky-600/90">
                      <span>Last active {device.lastActive}</span>
                      <Button size="sm" variant="outline" className="border-sky-300 bg-white/80 text-sky-700 hover:bg-white">
                        Sign out
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-none bg-white/80 shadow-xl backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-maroon-900">
                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                  Security Center
                </CardTitle>
                <CardDescription className="text-maroon-600">
                  Keep your account fortified with real-time protection.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-2xl border border-emerald-100/70 bg-emerald-50/70 p-4 shadow-sm">
                  <div>
                    <p className="text-sm font-semibold text-emerald-700">Two-factor authentication</p>
                    <p className="text-xs text-emerald-600/80">Add a one-time code to every new sign-in.</p>
                  </div>
                  <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-amber-100/70 bg-amber-50/70 p-4 shadow-sm">
                  <div>
                    <p className="text-sm font-semibold text-amber-700">Login alerts</p>
                    <p className="text-xs text-amber-700/80">Receive notifications whenever a new device signs in.</p>
                  </div>
                  <Switch checked={loginAlertsEnabled} onCheckedChange={setLoginAlertsEnabled} />
                </div>
                <div className="rounded-2xl border border-sky-100/70 bg-sky-50/70 p-4 text-xs text-sky-700">
                  <p className="font-semibold">Security tip</p>
                  <p className="pt-1">
                    Update your memorization PIN every 60 days to keep study groups synchronized with your latest progress.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none bg-white/80 shadow-xl backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-maroon-900">
                  <Crown className="h-5 w-5 text-rose-500" />
                  Recognition &amp; Hasanat
                </CardTitle>
                <CardDescription className="text-maroon-600">
                  Celebrate how your recitations are touching hearts.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl bg-gradient-to-br from-rose-500/15 via-white to-rose-500/10 p-4 text-sm text-rose-700 shadow-inner">
                  <p className="font-semibold">Hasanat Multiplier</p>
                  <p className="pt-2 text-rose-700/80">
                    Keep your streak above 14 days to activate a 2x multiplier on all Hasanat earned during group recitations.
                  </p>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-purple-500/10 via-white to-purple-500/10 p-4 text-sm text-purple-700 shadow-inner">
                  <p className="font-semibold">Community Badges</p>
                  <p className="pt-2 text-purple-700/80">
                    Mentor three classmates and unlock the &ldquo;Guiding Light&rdquo; badge for exclusive Tajweed masterclasses.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

