"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge as UiBadge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser } from "@/hooks/use-user"
import { Award, Crown, Sparkles, Star, Target, Trophy } from "lucide-react"

const rarityColors: Record<string, string> = {
  common: "bg-gray-100 text-gray-800 border-gray-200",
  uncommon: "bg-green-100 text-green-800 border-green-200",
  rare: "bg-blue-100 text-blue-800 border-blue-200",
  epic: "bg-purple-100 text-purple-800 border-purple-200",
  legendary: "bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 border-orange-200",
}

export default function AchievementsPage() {
  const { stats, gamification, badges, challenges } = useUser()
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const badgeCategories = useMemo(() => {
    const categories = new Set<string>(["all"])
    badges.forEach((badge) => {
      categories.add(badge.rarity)
    })
    return Array.from(categories)
  }, [badges])

  const filteredBadges = useMemo(() => {
    if (selectedCategory === "all") return badges
    return badges.filter((badge) => badge.rarity === selectedCategory)
  }, [badges, selectedCategory])

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-maroon-50 p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-maroon-600 via-maroon-500 to-amber-500 p-8 text-white shadow-xl">
          <div className="absolute -top-20 right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" aria-hidden />
          <div className="relative z-10 space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-widest">
              <Sparkles className="h-4 w-4" />
              Celebration Spotlight
            </p>
            <h1 className="text-4xl font-bold">Achievements & Hasanat</h1>
            <p className="max-w-2xl text-white/90">
              Your dedication has earned <span className="font-semibold">{stats.hasanat.toLocaleString()} Hasanat</span> and brought you to level {stats.level}. Keep nurturing your spiritual growth to unlock new celebrations.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <UiBadge className="border-none bg-gradient-to-r from-amber-300 to-amber-400 text-maroon-900">
                <Star className="mr-2 h-4 w-4" /> Level {stats.level}
              </UiBadge>
              <UiBadge className="border-none bg-white/20 text-white">
                <Target className="mr-2 h-4 w-4" /> {gamification.streak} day streak
              </UiBadge>
              <UiBadge className="border-none bg-white/20 text-white">
                <Crown className="mr-2 h-4 w-4" /> {gamification.milestones.filter((milestone) => milestone.status === "completed").length} milestones
              </UiBadge>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card className="border-0 bg-gradient-to-br from-maroon-600 to-amber-500 text-white shadow-xl">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8" />
                <div>
                  <p className="text-sm text-white/80">Total Hasanat</p>
                  <p className="text-2xl font-bold">{stats.hasanat.toLocaleString()}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-white/80">Progress to next level</p>
                <Progress value={(gamification.xp / (gamification.xp + gamification.xpToNext)) * 100} className="mt-2 h-2 bg-white/20" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardContent className="space-y-2 p-6 text-maroon-900">
              <p className="text-sm text-maroon-600">Current level</p>
              <p className="text-2xl font-bold">Level {gamification.level}</p>
              <p className="text-xs text-maroon-500">{gamification.xpToNext} XP to level up</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardContent className="space-y-2 p-6 text-maroon-900">
              <p className="text-sm text-maroon-600">Completed milestones</p>
              <p className="text-2xl font-bold">{gamification.milestones.filter((milestone) => milestone.status === "completed").length}</p>
              <p className="text-xs text-maroon-500">New celebrations unlock at 100%</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardContent className="space-y-2 p-6 text-maroon-900">
              <p className="text-sm text-maroon-600">Active challenges</p>
              <p className="text-2xl font-bold">{challenges.length}</p>
              <p className="text-xs text-maroon-500">Stay consistent to earn bonus Hasanat</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="flex flex-wrap gap-2 rounded-full bg-white/70 p-2 shadow">
            {badgeCategories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="rounded-full px-4 py-1 text-xs font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-maroon-600 data-[state=active]:to-amber-500 data-[state=active]:text-white"
              >
                {category === "all" ? "All Badges" : category.charAt(0).toUpperCase() + category.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredBadges.map((badge) => (
            <Card key={badge.id} className="border border-maroon-100 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
              <CardHeader className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-maroon-200 to-amber-200 text-maroon-800">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg">{badge.title}</CardTitle>
                  <CardDescription>{badge.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-maroon-700">Progress</span>
                  <span className="font-semibold text-maroon-900">
                    {Math.round((badge.progress / badge.goal) * 100)}%
                  </span>
                </div>
                <Progress value={(badge.progress / badge.goal) * 100} className="h-2" />
                <div className="flex items-center justify-between text-xs text-maroon-600">
                  <span>
                    {badge.progress}/{badge.goal} milestone{badge.goal > 1 ? "s" : ""}
                  </span>
                  <UiBadge className={rarityColors[badge.rarity] ?? rarityColors.common}>{badge.rarity}</UiBadge>
                </div>
                <div className="flex items-center justify-between text-xs text-maroon-600">
                  <span>Last earned</span>
                  <span>{badge.unlockedAt ? new Date(badge.unlockedAt).toLocaleDateString() : "Locked"}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
