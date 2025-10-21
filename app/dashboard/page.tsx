"use client"

import Link from "next/link"
import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import AppLayout from "@/components/app-layout"
import { PremiumGate } from "@/components/premium-gate"
import { useUser } from "@/hooks/use-user"
import {
  Award,
  BookOpen,
  Calendar,
  Clock,
  HeadphonesIcon,
  Mic,
  Play,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react"

function formatDuration(deadline: string) {
  const expires = new Date(deadline).getTime()
  const now = Date.now()
  const diff = Math.max(0, expires - now)
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  if (days > 0) {
    return `${days}d ${hours}h`
  }
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  return `${hours}h ${minutes}m`
}

export default function DashboardPage() {
  const { profile, stats, habits, gamification, challenges, recommendations, localization, preferences } = useUser()

  const LEVEL_TARGET = 500
  const firstName = useMemo(() => profile.name.split(" ")[0] ?? profile.name, [profile.name])
  const studyMinutes = stats.studyMinutes
  const studyHours = Math.floor(studyMinutes / 60)
  const remainingMinutes = studyMinutes % 60
  const formattedStudyTime = `${studyHours > 0 ? `${studyHours}h ` : ""}${remainingMinutes}m`
  const xpProgress = Math.max(0, Math.min(100, Math.round(((LEVEL_TARGET - stats.xpToNext) / LEVEL_TARGET) * 100)))
  const weeklyXpTotal = stats.weeklyXP.reduce((total, value) => total + value, 0)
  const featuredHabit = habits[0]
  const heroCopy = gamification.heroCopy
  const heroTitleClass = preferences.heroAnimation ? "animate-pulse" : ""

  const recentActivity = [
    { type: "reading", surah: "Al-Fatiha", ayahs: 7, time: "2 hours ago" },
    { type: "memorization", surah: "Al-Ikhlas", progress: 85, time: "Yesterday" },
    { type: "recitation", surah: "Al-Nas", score: 92, time: "2 days ago" },
  ]

  return (
    <AppLayout>
      <div className="space-y-8 p-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-maroon-600 via-maroon-500 to-amber-500 p-6 text-white shadow-xl">
          <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-white/10 blur-3xl" aria-hidden />
          <div className="relative z-10 grid gap-6 md:grid-cols-[2fr,1fr] md:items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-widest">
                <Sparkles className="h-4 w-4" />
                {localization.hero.title}
              </div>
              <h2 className={`text-3xl font-bold md:text-4xl ${heroTitleClass}`}>Assalamu Alaikum, {firstName}</h2>
              <p className="text-white/90 md:text-lg">{heroCopy.subtitle}</p>
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="border-white/30 bg-white/20 text-white">
                  <Star className="mr-1 h-3 w-3" />
                  {stats.hasanat.toLocaleString()} Hasanat
                </Badge>
                <Badge className="border-0 bg-gradient-to-r from-amber-300 to-amber-400 text-maroon-900 shadow-lg">
                  {gamification.streak} day streak
                </Badge>
              </div>
              <div className="grid w-full grid-cols-2 gap-3 sm:w-auto sm:flex sm:flex-wrap">
                <Button className="w-full rounded-full bg-white text-maroon-700 hover:bg-amber-100 sm:w-auto">
                  <Play className="mr-2 h-4 w-4" />
                  {localization.hero.action}
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-full border-white/40 text-white hover:bg-white/20 sm:w-auto"
                >
                  View celebration feed
                </Button>
              </div>
            </div>
            <div className="rounded-3xl bg-white/10 p-4 text-sm shadow-lg backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/70">Dynamic Highlights</p>
              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span>XP to next level</span>
                  <span className="font-semibold">{gamification.xpToNext} XP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Weekly Hasanat</span>
                  <span className="font-semibold">{weeklyXpTotal} XP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Current celebration</span>
                  <span className="font-semibold">{heroCopy.title}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4" data-animate="stagger">
          <Card className="border-0 bg-gradient-to-br from-blue-600 to-blue-700 text-white transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <CardContent className="p-6" data-animate="fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-100">Daily Streak</p>
                  <p className="text-2xl font-bold">{stats.streak} days</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-green-600 to-green-700 text-white transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <CardContent className="p-6" data-animate="fade-in" style={{ animationDelay: "80ms" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-100">Ayahs Read</p>
                  <p className="text-2xl font-bold">{stats.ayahsRead.toLocaleString()}</p>
                </div>
                <BookOpen className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-purple-600 to-purple-700 text-white transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <CardContent className="p-6" data-animate="fade-in" style={{ animationDelay: "160ms" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-100">Study Time</p>
                  <p className="text-2xl font-bold">{formattedStudyTime}</p>
                </div>
                <Clock className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-orange-600 to-orange-700 text-white transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <CardContent className="p-6" data-animate="fade-in" style={{ animationDelay: "240ms" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-100">Rank</p>
                  <p className="text-2xl font-bold">#{stats.rank}</p>
                </div>
                <Trophy className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <TrendingUp className="h-5 w-5 text-maroon-600" />
                  Level Progress
                </CardTitle>
                <CardDescription>Earn XP from daily habits to unlock advanced recitation challenges.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6" data-animate="stagger">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-maroon-600">Current Level</p>
                    <p className="text-3xl font-bold text-maroon-900">Level {stats.level}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">XP to next level</p>
                    <p className="text-lg font-semibold text-maroon-700">{stats.xpToNext} XP</p>
                  </div>
                </div>
                <Progress value={xpProgress} className="h-2" />
                <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">Weekly XP</p>
                    <p className="text-lg font-semibold text-maroon-900">{weeklyXpTotal} XP</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">Habits Completed</p>
                    <p className="text-lg font-semibold text-maroon-900">{stats.completedHabits}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">Hasanat Earned</p>
                    <p className="text-lg font-semibold text-maroon-900">{stats.hasanat.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">Daily Power-Up</p>
                    <p className="text-lg font-semibold text-maroon-900">+{featuredHabit?.xpReward ?? 0} XP</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-maroon-100 bg-maroon-50 p-4">
                  <div>
                    <p className="text-sm font-medium text-maroon-900">Keep the streak alive</p>
                    <p className="text-xs text-maroon-600">Complete any Habit Quest today to push your streak past {stats.streak} days.</p>
                  </div>
                  <Link href="/habits">
                    <Button className="border-0 bg-gradient-to-r from-maroon-600 to-maroon-700 text-white">Open Habit Quest</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Continue Your Journey</CardTitle>
                <CardDescription>Pick up where you left off</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-xl border border-maroon-100 bg-gradient-to-r from-maroon-50 to-yellow-50 p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-maroon-900">Surah Al-Baqarah</h3>
                      <p className="text-sm text-maroon-600">The Cow • Ayah 156 of 286</p>
                    </div>
                    <Badge className="border-0 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">Level {featuredHabit?.level ?? 1}</Badge>
                  </div>
                  <Progress value={featuredHabit?.progress ?? 0} className="mb-4" />
                  <div className="grid gap-3 sm:flex sm:space-x-3 sm:gap-0">
                    <Link href="/reader" className="w-full sm:w-auto">
                      <Button className="w-full border-0 bg-gradient-to-r from-maroon-600 to-maroon-700 text-white sm:w-auto">
                        <Play className="mr-2 h-4 w-4" />
                        Continue Reading
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full bg-white sm:w-auto">
                      <Target className="mr-2 h-4 w-4" />
                      View Habit
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={activity.type + index}
                      className="flex items-center justify-between gap-4 rounded-lg border border-maroon-100 bg-white/70 p-4 shadow-sm transition-transform duration-300 hover:-translate-y-1"
                    >
                      <div>
                        <p className="capitalize text-sm font-semibold text-maroon-900">{activity.type}</p>
                        <p className="text-xs text-maroon-600">
                          {activity.surah} • {activity.time}
                        </p>
                      </div>
                      <Badge className="border-0 bg-gradient-to-r from-maroon-500 to-amber-500 text-white">In progress</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Habit Quest Progress</CardTitle>
                <CardDescription>Master habits to unlock rare Hasanat bonuses.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {habits.map((habit) => (
                    <div
                      key={habit.id}
                      className="rounded-2xl border border-maroon-100 bg-white/80 p-4 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-maroon-900">{habit.title}</p>
                          <p className="text-xs text-maroon-600">{habit.description}</p>
                        </div>
                        <Badge className="border-0 bg-gradient-to-r from-maroon-200 to-amber-200 text-maroon-800">Lvl {habit.level}</Badge>
                      </div>
                      <div className="mt-4">
                        <Progress value={habit.progress} className="h-2" />
                        <div className="mt-2 flex items-center justify-between text-xs text-maroon-600">
                          <span>{habit.dailyTarget}</span>
                          <span>+{habit.xpReward} XP</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <PremiumGate featureName="AI Tajweed Coaching">
                  <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-100 to-amber-200 p-6">
                    <div className="flex flex-col items-center gap-4 md:flex-row">
                      <div className="rounded-full bg-white p-4 shadow">
                        <Mic className="h-6 w-6 text-amber-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-maroon-900">Unlock AI Tajweed Coaching</h4>
                        <p className="text-sm text-maroon-600">
                          Receive real-time feedback on makharij, tajweed rules, and rhythm to accelerate your memorization.
                        </p>
                      </div>
                      <Button className="rounded-full bg-gradient-to-r from-maroon-500 to-maroon-600 px-6 text-white shadow-lg">
                        Upgrade Now
                      </Button>
                    </div>
                  </div>
                </PremiumGate>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8" data-animate="stagger">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Award className="h-5 w-5 text-maroon-600" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Highlights from your Qur'anic practice.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={activity.type + index}
                    className="flex items-center gap-3 rounded-2xl border border-maroon-100 bg-white/80 p-3"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-maroon-200 to-amber-200">
                      <BookOpen className="h-5 w-5 text-maroon-700" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-maroon-900">{activity.type}</p>
                      <p className="text-xs text-maroon-600">
                        {activity.surah} • {activity.time}
                      </p>
                    </div>
                    <Badge className="border-0 bg-gradient-to-r from-maroon-500 to-amber-400 text-white">View</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Target className="h-5 w-5 text-maroon-600" />
                  Time-Limited Challenges
                </CardTitle>
                <CardDescription>Track your progress towards upcoming Qur'anic milestones.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {challenges.map((challenge, index) => (
                  <div key={challenge.id} className="space-y-2" data-animate="fade-in" style={{ animationDelay: `${index * 80}ms` }}>
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-maroon-900">{challenge.title}</span>
                      <span className="text-maroon-600">{formatDuration(challenge.expiresAt)}</span>
                    </div>
                    <Progress value={(challenge.progress / challenge.goal) * 100} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-maroon-600">
                      <span>{challenge.description}</span>
                      <span>
                        {challenge.progress}/{challenge.goal}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <HeadphonesIcon className="h-5 w-5 text-maroon-600" />
                  Immersive Listening
                </CardTitle>
                <CardDescription>AI-personalized recitation and memorization playlists.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-maroon-700">
                <p>Keep your sessions immersive with AI-powered tajweed correction and curated memorization playlists tailored to your level.</p>
                <ul className="space-y-2 text-maroon-600">
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden />
                    Daily recitation summaries delivered to your inbox.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden />
                    Adaptive audio speed to perfect rhythm and tajweed.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden />
                    Smart reminders for memorization reviews and reflection.
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Sparkles className="h-5 w-5 text-maroon-600" />
                  Intelligent Recommendations
                </CardTitle>
                <CardDescription>Personalized modules curated for you.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recommendations.map((recommendation) => (
                  <Link
                    key={recommendation.id}
                    href={recommendation.href}
                    className="block rounded-2xl border border-maroon-100 bg-white/80 p-4 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-maroon-900">{recommendation.title}</p>
                        <p className="text-xs text-maroon-600">{recommendation.description}</p>
                      </div>
                      <Badge className="border-none bg-gradient-to-r from-maroon-500 to-amber-400 text-white">Explore</Badge>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
