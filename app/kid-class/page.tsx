"use client"

import Link from "next/link"
import AppLayout from "@/components/app-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useUser } from "@/hooks/use-user"
import {
  Award,
  BookOpen,
  CalendarHeart,
  Flower,
  Gamepad2,
  Heart,
  Sparkles,
  Star,
  Target,
  Trophy,
} from "lucide-react"

const dailyRhythm = [
  {
    title: "Warm-Up Wonder",
    description: "2-minute breath & basmala to settle little hearts before recitation.",
    focus: "Mindful start",
  },
  {
    title: "Recitation Quest",
    description: "Guided repetition with call-and-response and tajwid story cues.",
    focus: "Flow & melody",
  },
  {
    title: "Habits Hero Challenge",
    description: "Mini mission with stickers, streak boosts, or family duet bonus.",
    focus: "Motivation",
  },
  {
    title: "Reflection Fireflies",
    description: "One sparkle takeaway shared in a gratitude circle.",
    focus: "Retention",
  },
]

const missionTracks = [
  {
    name: "Recite & Rise",
    icon: BookOpen,
    color: "from-emerald-400 via-emerald-500 to-teal-500",
    description: "Master short surahs with echo play, tajwid puppets, and melodic call backs.",
  },
  {
    name: "Heart Habits",
    icon: Heart,
    color: "from-rose-400 via-rose-500 to-pink-500",
    description: "Spark kindness rituals, dua journaling, and gratitude high-fives each week.",
  },
  {
    name: "Brain Builders",
    icon: Flower,
    color: "from-sky-400 via-indigo-500 to-purple-500",
    description: "Unlock memory games, story sequencing, and Quranic vocabulary quests.",
  },
]

const sparkleRewards = [
  {
    title: "Streak Star",
    points: 25,
    description: "Complete 3 days in a row to unlock constellation wallpapers & nasheed loops.",
  },
  {
    title: "Duet Dynamo",
    points: 40,
    description: "Recite with a parent or sibling and collect teamwork fireflies.",
  },
  {
    title: "Tajwid Trailblazer",
    points: 60,
    description: "Spot the rule-of-the-day sticker in story time and earn bonus gems.",
  },
]

const parentBoosters = [
  {
    title: "Story Sparks",
    description: "Nightly prompts that retell the class theme in 2 joyful minutes.",
  },
  {
    title: "Habit High-Five",
    description: "Printable reward ladder to celebrate tiny, consistent wins together.",
  },
  {
    title: "Progress Ping",
    description: "Weekly recap with voice note highlights and weekend mission ideas.",
  },
]

const miniGames = [
  {
    title: "Sound Safari",
    description: "Tap glowing letters to hear tajwid friends cheer in silly voices.",
  },
  {
    title: "Aya Adventure",
    description: "Drag & drop aya puzzles to rebuild the surah trail in order.",
  },
  {
    title: "Kindness Quest",
    description: "Spin the deed wheel and log real-life sunnah missions before class.",
  },
]

export default function KidClassPage() {
  const { profile, stats } = useUser()
  const firstName = profile?.name?.split(" ")[0] ?? "your child"
  const streak = stats?.streak ?? 0
  const totalHasanat = stats?.hasanat ?? 0

  return (
    <AppLayout>
      <div className="relative overflow-hidden bg-gradient-to-br from-cream-50 via-white to-rose-50">
        <div
          className="absolute inset-x-0 top-[-6rem] h-64 bg-gradient-to-b from-rose-200/40 via-amber-200/30 to-transparent blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-[-8rem] left-[-4rem] h-72 w-72 rounded-full bg-gradient-to-br from-amber-300/40 to-pink-200/50 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute right-[-6rem] top-1/3 h-80 w-80 rounded-full bg-gradient-to-br from-emerald-200/40 to-sky-200/60 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-6 pb-24 pt-12 sm:px-8 lg:px-12">
          <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-6">
              <Badge className="bg-gradient-to-r from-amber-400 to-rose-500 text-white shadow">New Habit Journey</Badge>
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight text-maroon-900 sm:text-5xl">
                  Kids Class: build luminous Qur'an habits with {firstName}
                </h1>
                <p className="text-lg text-maroon-700 sm:max-w-xl">
                  Each week is a story-powered mission that keeps little reciters excited, confident, and consistent. We combine
                  gentle memorization, embodied tajwid, and heart habits that grow with your family.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:from-emerald-600 hover:to-teal-600">
                  Start the next mission
                </Button>
                <Button asChild variant="outline" className="border-rose-300 text-maroon-700 hover:bg-rose-50/60">
                  <Link href="/habits">View habit streaks</Link>
                </Button>
                <div className="flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-4 py-2 text-sm text-amber-700 shadow-sm">
                  <Sparkles className="h-4 w-4" /> {streak} day streak shining
                </div>
              </div>
            </div>
            <Card className="border-0 bg-white/80 shadow-xl backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-maroon-900">
                  <CalendarHeart className="h-5 w-5 text-rose-500" /> Weekly Wonder Plan
                </CardTitle>
                <CardDescription>Flexible rhythm designed for 25-minute sparkle sessions.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {dailyRhythm.map((step, index) => (
                  <div key={step.title} className="flex gap-3 rounded-2xl border border-rose-100/80 bg-rose-50/60 p-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 to-amber-400 text-white shadow-md">
                      {index + 1}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-maroon-900">{step.title}</h3>
                      <p className="text-sm text-maroon-600">{step.description}</p>
                      <p className="text-xs uppercase tracking-wide text-rose-500">Focus: {step.focus}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          <section className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-3xl font-semibold text-maroon-900">Mission tracks crafted for curious hearts</h2>
                <p className="text-maroon-600">Children choose a track each fortnight and unlock themed quests, buddies, and badges.</p>
              </div>
              <Badge className="bg-white text-emerald-600 border border-emerald-200">
                <Trophy className="mr-1 h-3 w-3" /> Earned {totalHasanat.toLocaleString()} hasanat so far
              </Badge>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              {missionTracks.map((track) => (
                <Card
                  key={track.name}
                  className={`group border-0 bg-gradient-to-br ${track.color} text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}
                >
                  <CardHeader className="space-y-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-white">
                        <track.icon className="h-5 w-5" /> {track.name}
                      </CardTitle>
                      <Badge className="bg-white/20 text-white">Level up</Badge>
                    </div>
                    <CardDescription className="text-white/80">{track.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-white/90">
                    <div className="rounded-2xl bg-white/15 p-4">
                      <p>Weekly badges</p>
                      <div className="mt-2 flex items-center gap-2 text-xs uppercase tracking-wide text-white/70">
                        <Star className="h-3 w-3" /> Sparkle streak • Tajwid buddy • Family share
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-4">
                      <p>Signature habit focus</p>
                      <Progress value={70} className="mt-3 h-2 bg-white/20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="border-0 bg-white/80 shadow-xl backdrop-blur">
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-maroon-900">
                    <Sparkles className="h-5 w-5 text-amber-500" /> Spark Club Rewards
                  </CardTitle>
                  <CardDescription>Layered incentives keep momentum joyful and sustainable.</CardDescription>
                </div>
                <Badge className="bg-amber-100 text-amber-700 border-amber-200">Updated weekly</Badge>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                {sparkleRewards.map((reward) => (
                  <div
                    key={reward.title}
                    className="flex flex-col gap-3 rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-rose-50 p-4 shadow-inner"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-maroon-900">{reward.title}</h3>
                      <Badge className="bg-amber-200/70 text-amber-800">{reward.points} pts</Badge>
                    </div>
                    <p className="text-sm text-maroon-600">{reward.description}</p>
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-amber-600">
                      <Award className="h-3 w-3" /> Bonus avatar gear
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-maroon-900 via-maroon-800 to-rose-900 text-white shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Target className="h-5 w-5" /> Family Habit Boosters
                </CardTitle>
                <CardDescription className="text-rose-100">
                  Coach moments for parents that reinforce each mission at home.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {parentBoosters.map((boost) => (
                  <div key={boost.title} className="rounded-2xl border border-white/20 bg-white/10 p-4">
                    <h3 className="text-sm font-semibold text-white">{boost.title}</h3>
                    <p className="text-sm text-rose-100/90">{boost.description}</p>
                  </div>
                ))}
                <div className="rounded-2xl border border-emerald-200/40 bg-emerald-400/20 p-4 text-sm text-emerald-100">
                  Weekly family recap drops every Friday with playful action steps.
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <Card className="border-0 bg-white/85 shadow-xl backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-maroon-900">
                  <Gamepad2 className="h-5 w-5 text-sky-500" /> Mini-Games unlock progress power-ups
                </CardTitle>
                <CardDescription>Playful practice layers keep repetition fresh while reinforcing habits.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {miniGames.map((game, index) => (
                  <div key={game.title} className="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50/60 p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 text-white shadow">
                      <Trophy className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-maroon-900">
                        {index + 1}. {game.title}
                      </h3>
                      <p className="text-sm text-maroon-600">{game.description}</p>
                    </div>
                  </div>
                ))}
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                  <span className="font-semibold">Bonus:</span> Completed games convert into habit gems that upgrade class mascots.
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-rose-100 via-white to-amber-100 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-maroon-900">
                  <Heart className="h-5 w-5 text-rose-500" /> Habit Milestone Journey
                </CardTitle>
                <CardDescription>Visible pathway celebrating every recitation win, big or small.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {["Spark Seed", "Glow Grove", "Light Lantern", "Noor Navigator"].map((label, idx) => (
                  <div key={label} className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-amber-400 text-white shadow-lg">
                      {idx + 1}
                    </div>
                    <div className="flex-1 rounded-2xl border border-rose-200 bg-white/80 p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-maroon-900">{label}</p>
                        <Badge className="bg-rose-200/70 text-rose-800">+{(idx + 1) * 120} XP</Badge>
                      </div>
                      <p className="text-sm text-maroon-600">Celebrate with class badge ceremony & parent shout-out.</p>
                    </div>
                  </div>
                ))}
                <div className="rounded-2xl border border-amber-200 bg-white/80 p-4 text-sm text-amber-700">
                  <Sparkles className="mr-2 inline h-4 w-4" /> Graduation unlocks a live story recital with surprise guests.
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </AppLayout>
  )
}
