"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo } from "react"
import { CalendarDays, Compass, Medal, Settings, Sparkles, Star, Target } from "lucide-react"

import AppLayout from "@/components/app-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { useUser } from "@/hooks/use-user"

function formatJoinDate(joinedAt: string) {
  const date = new Date(joinedAt)
  if (Number.isNaN(date.getTime())) {
    return "Unknown"
  }
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

export default function ProfilePage() {
  const { profile, stats, perks, lockedPerks, isPremium, localization, gamification, badges, challenges, preferences, navigation } =
    useUser()

  const avatarSrc = profile.avatarUrl ?? "/placeholder-user.jpg"
  const joinDateLabel = formatJoinDate(profile.joinedAt)
  const weeklyXpTotal = useMemo(() => stats.weeklyXP.reduce((total, value) => total + value, 0), [stats.weeklyXP])
  const heroSubtitle = localization.hero.subtitle
  const featuredMilestone = gamification.milestones[0]
  const preferredDestinations = preferences.savedPermalinks.map((href) => navigation.find((link) => link.href === href)).filter(
    (item): item is NonNullable<typeof item> => Boolean(item),
  )

  return (
    <AppLayout>
      <div className="space-y-8 p-6">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-maroon-600 via-maroon-500 to-amber-500 p-6 text-white shadow-xl">
          <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-white/10 blur-3xl" aria-hidden />
          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-6">
              <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white/20 shadow-xl">
                <Image src={avatarSrc} alt={profile.name} fill sizes="96px" className="object-cover" priority />
              </div>
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
                  <Sparkles className="h-3 w-3" />
                  {profile.role}
                </div>
                <div>
                  <h1 className="text-3xl font-bold md:text-4xl">{profile.name}</h1>
                  <p className="text-white/80">{heroSubtitle}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-white/90">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-4 w-4" /> Joined {joinDateLabel}
                  </span>
                  <Separator orientation="vertical" className="hidden h-5 bg-white/30 md:flex" />
                  <span className="text-white/80">{profile.email}</span>
                  <Separator orientation="vertical" className="hidden h-5 bg-white/30 md:flex" />
                  <span className="uppercase tracking-[0.2em]">{profile.locale}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start gap-3 md:items-end">
              <Badge className="border-0 bg-white text-maroon-700 shadow-lg">{isPremium ? "Premium" : "Free"} Plan</Badge>
              <p className="max-w-xs text-sm text-white/80">
                {isPremium
                  ? "You have full access to the Tajweed coach, adaptive memorization plans, and exclusive community events."
                  : "Upgrade to unlock adaptive memorization plans, Tajweed feedback, and community celebrations."}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild variant="secondary" className="bg-white/20 text-white hover:bg-white/10">
                  <Link href="/settings/profile">
                    <Settings className="mr-2 h-4 w-4" /> Manage profile
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="secondary"
                  className={[
                    "bg-gradient-to-r from-amber-400 via-rose-500 to-fuchsia-500",
                    "text-white shadow-md transition-all hover:shadow-lg hover:brightness-105 focus-visible:ring-offset-2",
                  ].join(" ")}
                >
                  <Link href="/billing">
                    <Star className="mr-2 h-4 w-4" /> Donate
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 shadow-lg">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl text-maroon-900">
                  <Medal className="h-5 w-5 text-maroon-600" /> Progress overview
                </CardTitle>
                <CardDescription>Monitor your streak, memorization momentum, and XP growth.</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-maroon-50 text-maroon-700">
                Level {stats.level} • {stats.hasanat.toLocaleString()} Hasanat
              </Badge>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Weekly XP earned</span>
                  <span>{weeklyXpTotal} XP</span>
                </div>
                <Progress value={Math.min(100, Math.round((weeklyXpTotal / 700) * 100))} className="h-2" />
                <p className="text-xs text-gray-500">Consistent XP keeps your memorization schedule on track.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="border border-maroon-100 bg-maroon-50/40">
                  <CardContent className="space-y-3 p-5">
                    <div className="flex items-center justify-between text-sm font-semibold text-maroon-900">
                      <span>Daily streak</span>
                      <span>{stats.streak} days</span>
                    </div>
                    <p className="text-sm text-maroon-700">
                      Keep reciting daily to maintain your {stats.streak >= 7 ? "gold" : "silver"} streak bonus.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-maroon-600">
                      <Target className="h-4 w-4" /> Ranked #{stats.rank}
                    </div>
                  </CardContent>
                </Card>
                <Card className="border border-amber-100 bg-amber-50/60">
                  <CardContent className="space-y-3 p-5">
                    <div className="flex items-center justify-between text-sm font-semibold text-amber-900">
                      <span>Next milestone</span>
                      <span>{gamification.xpToNext} XP</span>
                    </div>
                    <p className="text-sm text-amber-700">
                      {featuredMilestone ? featuredMilestone.description : "Complete more habits to reveal your next celebration."}
                    </p>
                    {featuredMilestone ? (
                      <div className="text-xs text-amber-600">
                        {featuredMilestone.progress}% of {featuredMilestone.title}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg text-maroon-900">Preferred destinations</CardTitle>
              <CardDescription>Quick access to the areas you visit most often.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {preferredDestinations.length > 0 ? (
                preferredDestinations.map((item) => (
                  <div key={item.slug} className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
                    <div className="flex items-center justify-between text-sm font-semibold text-maroon-900">
                      <span>{item.label}</span>
                      <Link href={item.href} className="text-xs font-medium text-maroon-600 hover:underline">
                        Open
                      </Link>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">Stay aligned with your personalized navigation order.</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-600">
                  Customize your quick links from any page to see them highlighted here.
                </p>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild variant="link" className="px-0 text-maroon-700">
                <Link href="/dashboard">Go to dashboard</Link>
              </Button>
            </CardFooter>
          </Card>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg text-maroon-900">Plan perks</CardTitle>
              <CardDescription>Benefits currently unlocked on your plan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {perks.map((perk) => (
                <div key={perk} className="flex items-center gap-3 rounded-xl border border-maroon-100 bg-maroon-50/50 p-4">
                  <Star className="h-5 w-5 text-maroon-600" />
                  <span className="text-sm text-maroon-900">{perk}</span>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              {lockedPerks.length > 0 ? (
                <p className="text-sm text-gray-600">
                  Unlock {lockedPerks.length} more perk{lockedPerks.length > 1 ? "s" : ""} by upgrading to Premium.
                </p>
              ) : (
                <p className="text-sm text-gray-600">You already enjoy every perk we offer. Keep inspiring others!</p>
              )}
            </CardFooter>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg text-maroon-900">Active challenges</CardTitle>
              <CardDescription>Short-term goals to boost your consistency.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {challenges.slice(0, 3).map((challenge) => {
                const progressPercentage = Math.min(100, Math.round((challenge.progress / challenge.goal) * 100))
                return (
                  <div key={challenge.id} className="space-y-3 rounded-xl border border-gray-100 bg-gray-50/80 p-4">
                    <div className="flex items-center justify-between text-sm font-semibold text-maroon-900">
                      <span>{challenge.title}</span>
                      <span>{challenge.reward}</span>
                    </div>
                    <p className="text-sm text-gray-600">{challenge.description}</p>
                    <Progress value={progressPercentage} className="h-1.5" />
                    <p className="text-xs text-gray-500">
                      {challenge.progress} / {challenge.goal} completed • Expires {new Date(challenge.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                )
              })}
            </CardContent>
            <CardFooter>
              <Button asChild variant="link" className="px-0 text-maroon-700">
                <Link href="/practice">Review habit quests</Link>
              </Button>
            </CardFooter>
          </Card>
        </section>

        <section className="grid gap-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg text-maroon-900">Community recognition</CardTitle>
              <CardDescription>Your latest badges across the Alfawz network.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              {badges.length > 0 ? (
                badges.map((badge) => (
                  <Badge key={badge.id} className="bg-amber-100 text-amber-700">
                    {badge.title}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-gray-600">Complete more quests to unlock your first badge.</p>
              )}
            </CardContent>
            <CardFooter>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <Compass className="h-4 w-4 text-maroon-600" />
                Share your milestones in the community hub to inspire fellow reciters.
              </div>
            </CardFooter>
          </Card>
        </section>
      </div>
    </AppLayout>
  )
}
