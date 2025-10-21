"use client"

import AppLayout from "@/components/app-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser } from "@/hooks/use-user"
import {
  Award,
  Bolt,
  Crown,
  Flame,
  Gamepad2,
  Loader2,
  Sparkles,
  Stars,
  Swords,
} from "lucide-react"

const seasonalEvents = [
  {
    id: "event-1",
    name: "Ramadan Questline",
    description: "Complete nightly recitations to unlock the Lailatul Qadr halo.",
    progress: 68,
    reward: "+500 hasanāt & Noor companion",
  },
  {
    id: "event-2",
    name: "Community Tajweed Rally",
    description: "Join live rooms and coach students through advanced makharij exercises.",
    progress: 42,
    reward: "Exclusive dua badge",
  },
]

const duelQueue = [
  { id: "d1", challenger: "Ahmad", verse: "Al-Baqarah 255", wager: "120 XP" },
  { id: "d2", challenger: "Maryam", verse: "Al-Mulk 15-16", wager: "85 XP" },
]

const dailyBoosters = [
  { id: "b1", name: "Focus Flame", effect: "+2x Tajweed accuracy", duration: "20m", icon: Flame },
  { id: "b2", name: "Memory Surge", effect: "+1.5x review streak", duration: "15m", icon: Bolt },
  { id: "b3", name: "Serenity Shield", effect: "Reduce mistake penalty", duration: "30m", icon: Stars },
]

export default function GameHubPage() {
  const { gamification, profile } = useUser()

  return (
    <AppLayout>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-maroon-900">Game hub</h1>
            <p className="text-sm text-maroon-600">
              Fuel your memorization journey with quests, duels, and seasonal rewards designed for {profile.name}.
            </p>
          </div>
          <Badge className="bg-maroon-600 text-white">
            <Sparkles className="mr-1 h-4 w-4" /> Level {gamification.level} · {gamification.streak} day streak
          </Badge>
        </div>

        <Tabs defaultValue="quests" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur">
            <TabsTrigger value="quests">Quests</TabsTrigger>
            <TabsTrigger value="duels">Duels</TabsTrigger>
            <TabsTrigger value="boosters">Boosters</TabsTrigger>
          </TabsList>

          <TabsContent value="quests" className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              {seasonalEvents.map((event) => (
                <Card
                  key={event.id}
                  className="border border-maroon-200/60 bg-gradient-to-br from-white via-cream-50 to-amber-50"
                >
                  <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl font-semibold text-maroon-900">{event.name}</CardTitle>
                      <CardDescription className="text-sm text-maroon-600">{event.description}</CardDescription>
                    </div>
                    <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700">
                      {event.reward}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="mb-1 flex items-center justify-between text-xs font-medium text-maroon-600">
                        <span>Progress</span>
                        <span>{event.progress}%</span>
                      </div>
                      <Progress value={event.progress} className="h-2 bg-maroon-100" />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button className="bg-maroon-600 text-white hover:bg-maroon-700">
                        <Gamepad2 className="mr-2 h-4 w-4" /> Enter quest room
                      </Button>
                      <Button variant="ghost" className="text-maroon-700 hover:bg-maroon-50">
                        <Award className="mr-2 h-4 w-4" /> View rewards
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="border border-maroon-200/60 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg text-maroon-900">Live leaderboard</CardTitle>
                <CardDescription className="text-sm text-maroon-600">
                  Stay ahead of other admins guiding their institutions this season.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {["Maryam", "Fatima", profile.name, "Yusuf"].map((name, index) => (
                  <div
                    key={name}
                    className="flex items-center gap-3 rounded-2xl border border-maroon-100 bg-white/70 p-3"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-maroon-100 text-sm font-semibold text-maroon-700">
                      #{index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-maroon-900">{name}</p>
                      <p className="text-xs text-maroon-600">{3000 - index * 120} XP</p>
                    </div>
                    {name === profile.name ? (
                      <Badge className="bg-amber-100 text-amber-700">
                        <Crown className="mr-1 h-3 w-3" /> You
                      </Badge>
                    ) : null}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="duels" className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="border border-maroon-200/60 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg text-maroon-900">Duel queue</CardTitle>
                <CardDescription className="text-sm text-maroon-600">
                  Accept or spectate real-time memorization challenges.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {duelQueue.map((duel) => (
                  <div
                    key={duel.id}
                    className="flex flex-col gap-3 rounded-2xl border border-maroon-100 bg-white/70 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-maroon-900">{duel.challenger}</p>
                      <p className="text-xs text-maroon-600">{duel.verse}</p>
                    </div>
                    <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">
                      {duel.wager}
                    </Badge>
                    <div className="flex gap-2">
                      <Button className="bg-maroon-600 text-white hover:bg-maroon-700">
                        <Swords className="mr-2 h-4 w-4" /> Accept
                      </Button>
                      <Button variant="ghost" className="text-maroon-700 hover:bg-maroon-50">
                        Spectate
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="border border-maroon-200/60 bg-gradient-to-br from-white via-cream-50 to-amber-50">
              <CardHeader>
                <CardTitle className="text-lg text-maroon-900">Training grounds</CardTitle>
                <CardDescription className="text-sm text-maroon-600">
                  Sharpen response time before entering the duel arena.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-3xl border border-maroon-100 bg-white/70 p-6 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-maroon-600" />
                  <p className="mt-3 text-sm font-semibold text-maroon-900">Quick warm-up in progress</p>
                  <p className="text-xs text-maroon-600">Generating tajweed flash prompts…</p>
                </div>
                <Button className="w-full bg-maroon-600 text-white hover:bg-maroon-700">
                  Practice articulation drills
                </Button>
                <Button variant="ghost" className="w-full text-maroon-700 hover:bg-maroon-50">
                  Invite a colleague
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="boosters" className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="border border-maroon-200/60 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg text-maroon-900">Daily boosters</CardTitle>
                <CardDescription className="text-sm text-maroon-600">
                  Activate power-ups to amplify upcoming memorization sessions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {dailyBoosters.map((booster) => {
                  const Icon = booster.icon
                  return (
                    <div
                      key={booster.id}
                      className="flex flex-col gap-3 rounded-2xl border border-maroon-100 bg-white/70 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-maroon-100 text-maroon-700">
                          <Icon className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-maroon-900">{booster.name}</p>
                          <p className="text-xs text-maroon-600">{booster.effect}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700">
                        {booster.duration}
                      </Badge>
                      <Button className="bg-maroon-600 text-white hover:bg-maroon-700">
                        Activate
                      </Button>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
            <Card className="border border-maroon-200/60 bg-gradient-to-br from-white via-cream-50 to-amber-50">
              <CardHeader>
                <CardTitle className="text-lg text-maroon-900">Legacy bonuses</CardTitle>
                <CardDescription className="text-sm text-maroon-600">
                  Maintain streaks to unlock unique institute-wide benefits.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-3xl border border-maroon-100 bg-white/70 p-4">
                  <p className="text-sm font-semibold text-maroon-900">Community multiplier</p>
                  <p className="text-xs text-maroon-600">
                    Every active teacher session adds +5% to student XP earnings for the day.
                  </p>
                </div>
                <div className="rounded-3xl border border-maroon-100 bg-white/70 p-4">
                  <p className="text-sm font-semibold text-maroon-900">Guided reflections</p>
                  <p className="text-xs text-maroon-600">
                    Unlock weekly curated dua reflections when streaks reach 10 days.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
