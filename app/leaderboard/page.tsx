"use client"

import { useMemo, useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Award,
  BookMarked,
  BookOpen,
  Brain,
  CalendarClock,
  Crown,
  Flame,
  Medal,
  Mic2,
  ScrollText,
  Star,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react"

type Timeframe = "daily" | "weekly" | "monthly"
type LeaderboardCategory = "recitation" | "hasanat" | "memorization"
type BadgeType = "crown" | "gold" | "silver" | "bronze" | null

interface BaseEntry {
  rank: number
  name: string
  avatar: string
  classGroup: string
  change: number
  badge: BadgeType
}

interface RecitationEntry extends BaseEntry {
  verses: number
  accuracy: number
  sessions: number
}

interface HasanatEntry extends BaseEntry {
  hasanat: number
  streak: number
  level: number
}

interface MemorizationEntry extends BaseEntry {
  surahs: number
  ayat: number
  retention: number
}

type LeaderboardData = {
  [K in Timeframe]: {
    recitation: RecitationEntry[]
    hasanat: HasanatEntry[]
    memorization: MemorizationEntry[]
  }
}

const placeholderAvatar = "/placeholder.svg?height=40&width=40"

const leaderboardData: LeaderboardData = {
  daily: {
    recitation: [
      {
        rank: 1,
        name: "Ahmad Al-Hafiz",
        avatar: placeholderAvatar,
        classGroup: "Class 6B",
        change: 1,
        badge: "crown",
        verses: 58,
        accuracy: 99,
        sessions: 3,
      },
      {
        rank: 2,
        name: "Fatima Zahra",
        avatar: placeholderAvatar,
        classGroup: "Class 6B",
        change: 0,
        badge: "gold",
        verses: 52,
        accuracy: 98,
        sessions: 3,
      },
      {
        rank: 3,
        name: "Omar Ibn Khattab",
        avatar: placeholderAvatar,
        classGroup: "Class 6A",
        change: -1,
        badge: "silver",
        verses: 49,
        accuracy: 96,
        sessions: 2,
      },
      {
        rank: 4,
        name: "Aisha Siddiq",
        avatar: placeholderAvatar,
        classGroup: "Class 6C",
        change: 2,
        badge: "bronze",
        verses: 44,
        accuracy: 94,
        sessions: 3,
      },
      {
        rank: 5,
        name: "Ali Hassan",
        avatar: placeholderAvatar,
        classGroup: "Class 6A",
        change: 0,
        badge: null,
        verses: 41,
        accuracy: 93,
        sessions: 2,
      },
      {
        rank: 6,
        name: "Khadija Bint Khuwaylid",
        avatar: placeholderAvatar,
        classGroup: "Class 6C",
        change: 1,
        badge: null,
        verses: 39,
        accuracy: 95,
        sessions: 2,
      },
      {
        rank: 7,
        name: "Bilal Ibn Rabah",
        avatar: placeholderAvatar,
        classGroup: "Class 6B",
        change: -2,
        badge: null,
        verses: 35,
        accuracy: 91,
        sessions: 2,
      },
      {
        rank: 8,
        name: "Safiya Umm Habiba",
        avatar: placeholderAvatar,
        classGroup: "Class 6A",
        change: 0,
        badge: null,
        verses: 32,
        accuracy: 90,
        sessions: 1,
      },
    ],
    hasanat: [
      {
        rank: 1,
        name: "Ahmad Al-Hafiz",
        avatar: placeholderAvatar,
        classGroup: "Class 6B",
        change: 2,
        badge: "crown",
        hasanat: 210,
        streak: 18,
        level: 16,
      },
      {
        rank: 2,
        name: "Fatima Zahra",
        avatar: placeholderAvatar,
        classGroup: "Class 6B",
        change: 0,
        badge: "gold",
        hasanat: 198,
        streak: 15,
        level: 15,
      },
      {
        rank: 3,
        name: "Aisha Siddiq",
        avatar: placeholderAvatar,
        classGroup: "Class 6C",
        change: 1,
        badge: "silver",
        hasanat: 184,
        streak: 14,
        level: 14,
      },
      {
        rank: 4,
        name: "Omar Ibn Khattab",
        avatar: placeholderAvatar,
        classGroup: "Class 6A",
        change: -2,
        badge: "bronze",
        hasanat: 176,
        streak: 12,
        level: 14,
      },
      {
        rank: 5,
        name: "Ali Hassan",
        avatar: placeholderAvatar,
        classGroup: "Class 6A",
        change: 0,
        badge: null,
        hasanat: 162,
        streak: 10,
        level: 13,
      },
      {
        rank: 6,
        name: "Khadija Bint Khuwaylid",
        avatar: placeholderAvatar,
        classGroup: "Class 6C",
        change: 1,
        badge: null,
        hasanat: 155,
        streak: 11,
        level: 13,
      },
      {
        rank: 7,
        name: "Bilal Ibn Rabah",
        avatar: placeholderAvatar,
        classGroup: "Class 6B",
        change: -1,
        badge: null,
        hasanat: 142,
        streak: 9,
        level: 12,
      },
      {
        rank: 8,
        name: "Safiya Umm Habiba",
        avatar: placeholderAvatar,
        classGroup: "Class 6A",
        change: 0,
        badge: null,
        hasanat: 136,
        streak: 8,
        level: 12,
      },
    ],
    memorization: [
      {
        rank: 1,
        name: "Fatima Zahra",
        avatar: placeholderAvatar,
        classGroup: "Class 6B",
        change: 1,
        badge: "crown",
        surahs: 18,
        ayat: 360,
        retention: 98,
      },
      {
        rank: 2,
        name: "Ahmad Al-Hafiz",
        avatar: placeholderAvatar,
        classGroup: "Class 6B",
        change: -1,
        badge: "gold",
        surahs: 17,
        ayat: 340,
        retention: 97,
      },
      {
        rank: 3,
        name: "Khadija Bint Khuwaylid",
        avatar: placeholderAvatar,
        classGroup: "Class 6C",
        change: 2,
        badge: "silver",
        surahs: 16,
        ayat: 320,
        retention: 95,
      },
      {
        rank: 4,
        name: "Omar Ibn Khattab",
        avatar: placeholderAvatar,
        classGroup: "Class 6A",
        change: -1,
        badge: "bronze",
        surahs: 15,
        ayat: 300,
        retention: 93,
      },
      {
        rank: 5,
        name: "Aisha Siddiq",
        avatar: placeholderAvatar,
        classGroup: "Class 6C",
        change: 0,
        badge: null,
        surahs: 14,
        ayat: 280,
        retention: 92,
      },
      {
        rank: 6,
        name: "Ali Hassan",
        avatar: placeholderAvatar,
        classGroup: "Class 6A",
        change: 1,
        badge: null,
        surahs: 13,
        ayat: 260,
        retention: 91,
      },
      {
        rank: 7,
        name: "Bilal Ibn Rabah",
        avatar: placeholderAvatar,
        classGroup: "Class 6B",
        change: -1,
        badge: null,
        surahs: 12,
        ayat: 240,
        retention: 90,
      },
      {
        rank: 8,
        name: "Safiya Umm Habiba",
        avatar: placeholderAvatar,
        classGroup: "Class 6A",
        change: 0,
        badge: null,
        surahs: 11,
        ayat: 220,
        retention: 88,
      },
    ],
  },
  weekly: {
    recitation: [
      {
        rank: 1,
        name: "Ahmad Al-Hafiz",
        avatar: placeholderAvatar,
        classGroup: "Class 6B",
        change: 1,
        badge: "crown",
        verses: 410,
        accuracy: 98,
        sessions: 14,
      },
      {
        rank: 2,
        name: "Fatima Zahra",
        avatar: placeholderAvatar,
        classGroup: "Class 6B",
        change: 0,
        badge: "gold",
        verses: 396,
        accuracy: 97,
        sessions: 13,
      },
      {
        rank: 3,
        name: "Omar Ibn Khattab",
        avatar: placeholderAvatar,
        classGroup: "Class 6A",
        change: -1,
        badge: "silver",
        verses: 372,
        accuracy: 95,
        sessions: 12,
      },
      {
        rank: 4,
        name: "Aisha Siddiq",
        avatar: placeholderAvatar,
        classGroup: "Class 6C",
        change: 2,
        badge: "bronze",
        verses: 348,
        accuracy: 94,
        sessions: 11,
      },
      {
        rank: 5,
        name: "Ali Hassan",
        avatar: placeholderAvatar,
        classGroup: "Class 6A",
        change: 0,
        badge: null,
        verses: 326,
        accuracy: 93,
        sessions: 11,
      },
      {
        rank: 6,
        name: "Khadija Bint Khuwaylid",
        avatar: placeholderAvatar,
        classGroup: "Class 6C",
        change: 1,
        badge: null,
        verses: 308,
        accuracy: 95,
        sessions: 10,
      },
      {
        rank: 7,
        name: "Bilal Ibn Rabah",
        avatar: placeholderAvatar,
        classGroup: "Class 6B",
        change: -2,
        badge: null,
        verses: 296,
        accuracy: 92,
        sessions: 9,
      },
      {
        rank: 8,
        name: "Safiya Umm Habiba",
        avatar: placeholderAvatar,
        classGroup: "Class 6A",
        change: 0,
        badge: null,
        verses: 284,
        accuracy: 91,
        sessions: 9,
      },
    ],
    hasanat: [
      {
        rank: 1,
        name: "Fatima Zahra",
        avatar: placeholderAvatar,
        classGroup: "Class 6B",
        change: 1,
        badge: "crown",
        hasanat: 1250,
        streak: 21,
        level: 15,
      },
      {
        rank: 2,
        name: "Ahmad Al-Hafiz",
        avatar: placeholderAvatar,
        classGroup: "Class 6B",
        change: -1,
        badge: "gold",
        hasanat: 1180,
        streak: 20,
        level: 15,
      },
      {
        rank: 3,
        name: "Omar Ibn Khattab",
        avatar: placeholderAvatar,
        classGroup: "Class 6A",
        change: 0,
        badge: "silver",
        hasanat: 1095,
        streak: 18,
        level: 14,
      },
      {
        rank: 4,
        name: "Aisha Siddiq",
        avatar: placeholderAvatar,
        classGroup: "Class 6C",
        change: 1,
        badge: "bronze",
        hasanat: 1018,
        streak: 22,
        level: 14,
      },
      {
        rank: 5,
        name: "Ali Hassan",
        avatar: placeholderAvatar,
        classGroup: "Class 6A",
        change: 0,
        badge: null,
        hasanat: 962,
        streak: 16,
        level: 13,
      },
      {
        rank: 6,
        name: "Khadija Bint Khuwaylid",
        avatar: placeholderAvatar,
        classGroup: "Class 6C",
        change: 1,
        badge: null,
        hasanat: 908,
        streak: 17,
        level: 13,
      },
      {
        rank: 7,
        name: "Bilal Ibn Rabah",
        avatar: placeholderAvatar,
        classGroup: "Class 6B",
        change: -2,
        badge: null,
        hasanat: 856,
        streak: 14,
        level: 12,
      },
      {
        rank: 8,
        name: "Safiya Umm Habiba",
        avatar: placeholderAvatar,
        classGroup: "Class 6A",
        change: 0,
        badge: null,
        hasanat: 808,
        streak: 13,
        level: 12,
      },
    ],
    memorization: [
      {
        rank: 1,
        name: "Ahmad Al-Hafiz",
        avatar: placeholderAvatar,
        classGroup: "Class 6B",
        change: 1,
        badge: "crown",
        surahs: 25,
        ayat: 520,
        retention: 98,
      },
      {
        rank: 2,
        name: "Fatima Zahra",
        avatar: placeholderAvatar,
        classGroup: "Class 6B",
        change: 0,
        badge: "gold",
        surahs: 24,
        ayat: 500,
        retention: 97,
      },
      {
        rank: 3,
        name: "Omar Ibn Khattab",
        avatar: placeholderAvatar,
        classGroup: "Class 6A",
        change: -1,
        badge: "silver",
        surahs: 23,
        ayat: 470,
        retention: 96,
      },
      {
        rank: 4,
        name: "Khadija Bint Khuwaylid",
        avatar: placeholderAvatar,
        classGroup: "Class 6C",
        change: 2,
        badge: "bronze",
        surahs: 22,
        ayat: 440,
        retention: 95,
      },
      {
        rank: 5,
        name: "Aisha Siddiq",
        avatar: placeholderAvatar,
        classGroup: "Class 6C",
        change: 0,
        badge: null,
        surahs: 21,
        ayat: 420,
        retention: 94,
      },
      {
        rank: 6,
        name: "Ali Hassan",
        avatar: placeholderAvatar,
        classGroup: "Class 6A",
        change: 1,
        badge: null,
        surahs: 20,
        ayat: 400,
        retention: 93,
      },
      {
        rank: 7,
        name: "Safiya Umm Habiba",
        avatar: placeholderAvatar,
        classGroup: "Class 6A",
        change: -2,
        badge: null,
        surahs: 19,
        ayat: 380,
        retention: 92,
      },
      {
        rank: 8,
        name: "Bilal Ibn Rabah",
        avatar: placeholderAvatar,
        classGroup: "Class 6B",
        change: 0,
        badge: null,
        surahs: 18,
        ayat: 360,
        retention: 91,
      },
    ],
  },
  monthly: {
    recitation: [
      {
        rank: 1,
        name: "Fatima Zahra",
        avatar: placeholderAvatar,
        classGroup: "Class 6B",
        change: 0,
        badge: "crown",
        verses: 1610,
        accuracy: 98,
        sessions: 56,
      },
      {
        rank: 2,
        name: "Ahmad Al-Hafiz",
        avatar: placeholderAvatar,
        classGroup: "Class 6B",
        change: 1,
        badge: "gold",
        verses: 1598,
        accuracy: 97,
        sessions: 55,
      },
      {
        rank: 3,
        name: "Aisha Siddiq",
        avatar: placeholderAvatar,
        classGroup: "Class 6C",
        change: 2,
        badge: "silver",
        verses: 1504,
        accuracy: 96,
        sessions: 52,
      },
      {
        rank: 4,
        name: "Omar Ibn Khattab",
        avatar: placeholderAvatar,
        classGroup: "Class 6A",
        change: -2,
        badge: "bronze",
        verses: 1478,
        accuracy: 95,
        sessions: 50,
      },
      {
        rank: 5,
        name: "Ali Hassan",
        avatar: placeholderAvatar,
        classGroup: "Class 6A",
        change: -1,
        badge: null,
        verses: 1402,
        accuracy: 94,
        sessions: 48,
      },
      {
        rank: 6,
        name: "Khadija Bint Khuwaylid",
        avatar: placeholderAvatar,
        classGroup: "Class 6C",
        change: 1,
        badge: null,
        verses: 1356,
        accuracy: 95,
        sessions: 47,
      },
      {
        rank: 7,
        name: "Safiya Umm Habiba",
        avatar: placeholderAvatar,
        classGroup: "Class 6A",
        change: 1,
        badge: null,
        verses: 1304,
        accuracy: 93,
        sessions: 45,
      },
      {
        rank: 8,
        name: "Bilal Ibn Rabah",
        avatar: placeholderAvatar,
        classGroup: "Class 6B",
        change: -2,
        badge: null,
        verses: 1262,
        accuracy: 92,
        sessions: 43,
      },
    ],
    hasanat: [
      {
        rank: 1,
        name: "Ahmad Al-Hafiz",
        avatar: placeholderAvatar,
        classGroup: "Class 6B",
        change: 1,
        badge: "crown",
        hasanat: 4820,
        streak: 45,
        level: 17,
      },
      {
        rank: 2,
        name: "Fatima Zahra",
        avatar: placeholderAvatar,
        classGroup: "Class 6B",
        change: -1,
        badge: "gold",
        hasanat: 4750,
        streak: 44,
        level: 17,
      },
      {
        rank: 3,
        name: "Aisha Siddiq",
        avatar: placeholderAvatar,
        classGroup: "Class 6C",
        change: 1,
        badge: "silver",
        hasanat: 4625,
        streak: 46,
        level: 16,
      },
      {
        rank: 4,
        name: "Omar Ibn Khattab",
        avatar: placeholderAvatar,
        classGroup: "Class 6A",
        change: -1,
        badge: "bronze",
        hasanat: 4510,
        streak: 40,
        level: 16,
      },
      {
        rank: 5,
        name: "Khadija Bint Khuwaylid",
        avatar: placeholderAvatar,
        classGroup: "Class 6C",
        change: 2,
        badge: null,
        hasanat: 4388,
        streak: 39,
        level: 15,
      },
      {
        rank: 6,
        name: "Ali Hassan",
        avatar: placeholderAvatar,
        classGroup: "Class 6A",
        change: -1,
        badge: null,
        hasanat: 4296,
        streak: 34,
        level: 15,
      },
      {
        rank: 7,
        name: "Safiya Umm Habiba",
        avatar: placeholderAvatar,
        classGroup: "Class 6A",
        change: 1,
        badge: null,
        hasanat: 4214,
        streak: 32,
        level: 14,
      },
      {
        rank: 8,
        name: "Bilal Ibn Rabah",
        avatar: placeholderAvatar,
        classGroup: "Class 6B",
        change: -1,
        badge: null,
        hasanat: 4160,
        streak: 30,
        level: 14,
      },
    ],
    memorization: [
      {
        rank: 1,
        name: "Fatima Zahra",
        avatar: placeholderAvatar,
        classGroup: "Class 6B",
        change: 0,
        badge: "crown",
        surahs: 32,
        ayat: 640,
        retention: 99,
      },
      {
        rank: 2,
        name: "Ahmad Al-Hafiz",
        avatar: placeholderAvatar,
        classGroup: "Class 6B",
        change: 1,
        badge: "gold",
        surahs: 31,
        ayat: 620,
        retention: 98,
      },
      {
        rank: 3,
        name: "Khadija Bint Khuwaylid",
        avatar: placeholderAvatar,
        classGroup: "Class 6C",
        change: 2,
        badge: "silver",
        surahs: 29,
        ayat: 580,
        retention: 97,
      },
      {
        rank: 4,
        name: "Omar Ibn Khattab",
        avatar: placeholderAvatar,
        classGroup: "Class 6A",
        change: -1,
        badge: "bronze",
        surahs: 28,
        ayat: 560,
        retention: 95,
      },
      {
        rank: 5,
        name: "Aisha Siddiq",
        avatar: placeholderAvatar,
        classGroup: "Class 6C",
        change: -1,
        badge: null,
        surahs: 27,
        ayat: 540,
        retention: 95,
      },
      {
        rank: 6,
        name: "Ali Hassan",
        avatar: placeholderAvatar,
        classGroup: "Class 6A",
        change: 1,
        badge: null,
        surahs: 26,
        ayat: 520,
        retention: 94,
      },
      {
        rank: 7,
        name: "Safiya Umm Habiba",
        avatar: placeholderAvatar,
        classGroup: "Class 6A",
        change: 0,
        badge: null,
        surahs: 25,
        ayat: 500,
        retention: 93,
      },
      {
        rank: 8,
        name: "Bilal Ibn Rabah",
        avatar: placeholderAvatar,
        classGroup: "Class 6B",
        change: -2,
        badge: null,
        surahs: 24,
        ayat: 480,
        retention: 92,
      },
    ],
  },
}

const currentUser: Record<
  LeaderboardCategory,
  Record<
    Timeframe,
    {
      rank: number
      primaryValue: string
      change: number
    }
  >
> = {
  recitation: {
    daily: { rank: 6, primaryValue: "38 verses", change: 1 },
    weekly: { rank: 7, primaryValue: "302 verses", change: 2 },
    monthly: { rank: 8, primaryValue: "1288 verses", change: 1 },
  },
  hasanat: {
    daily: { rank: 5, primaryValue: "158 Hasanat", change: 1 },
    weekly: { rank: 6, primaryValue: "884 Hasanat", change: 1 },
    monthly: { rank: 7, primaryValue: "4236 Hasanat", change: 2 },
  },
  memorization: {
    daily: { rank: 6, primaryValue: "13 Surahs", change: 0 },
    weekly: { rank: 6, primaryValue: "20 Surahs", change: 1 },
    monthly: { rank: 6, primaryValue: "26 Surahs", change: 1 },
  },
}

const timeframeLabels: Record<Timeframe, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
}

const categoryLabels: Record<LeaderboardCategory, { title: string; description: string }> = {
  recitation: {
    title: "Recitation",
    description: "Track who recited the most Qur'an with excellent tajwīd",
  },
  hasanat: {
    title: "Earned Hasanat",
    description: "Celebrate students earning the most rewards and keeping their streaks",
  },
  memorization: {
    title: "Memorization",
    description: "See progress on memorised surahs and long-term retention",
  },
}

const getBadgeIcon = (badge: BadgeType, rank: number) => {
  switch (badge) {
    case "crown":
      return <Crown className="h-5 w-5 text-yellow-500" />
    case "gold":
      return <Trophy className="h-5 w-5 text-yellow-500" />
    case "silver":
      return <Medal className="h-5 w-5 text-gray-400" />
    case "bronze":
      return <Medal className="h-5 w-5 text-amber-600" />
    default:
      return <span className="text-lg font-bold text-maroon-600">#{rank}</span>
  }
}

const getRankColor = (rank: number) => {
  if (rank === 1) return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"
  if (rank === 2) return "bg-gradient-to-r from-gray-300 to-gray-500 text-white"
  if (rank === 3) return "bg-gradient-to-r from-amber-400 to-amber-600 text-white"
  return "bg-maroon-50 text-maroon-700"
}

const formatChange = (change: number) => {
  if (change > 0) return `+${change} ranks`
  if (change < 0) return `${change} ranks`
  return "No change"
}

const changeColor = (change: number) => {
  if (change > 0) return "text-emerald-600"
  if (change < 0) return "text-rose-500"
  return "text-slate-500"
}

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState<Timeframe>("weekly")
  const [category, setCategory] = useState<LeaderboardCategory>("recitation")

  const recitationData = leaderboardData[timeframe].recitation
  const hasanatData = leaderboardData[timeframe].hasanat
  const memorizationData = leaderboardData[timeframe].memorization

  const displayedData =
    category === "recitation"
      ? recitationData
      : category === "hasanat"
      ? hasanatData
      : memorizationData

  const summaryCards = useMemo(() => {
    if (category === "recitation") {
      const totalVerses = recitationData.reduce((sum, student) => sum + student.verses, 0)
      const avgAccuracy = Math.round(
        recitationData.reduce((sum, student) => sum + student.accuracy, 0) /
          Math.max(recitationData.length, 1)
      )
      const totalSessions = recitationData.reduce((sum, student) => sum + student.sessions, 0)

      return [
        {
          title: "Top reciter",
          value: recitationData[0]?.name ?? "-",
          description: `${recitationData[0]?.verses ?? 0} verses recited`,
          icon: Mic2,
        },
        {
          title: "Average accuracy",
          value: `${Number.isFinite(avgAccuracy) ? avgAccuracy : 0}%`,
          description: `${totalVerses} verses recited as a class`,
          icon: TrendingUp,
        },
        {
          title: "Sessions completed",
          value: totalSessions.toString(),
          description: `${timeframeLabels[timeframe]} recitation sessions`,
          icon: CalendarClock,
        },
      ]
    }

    if (category === "hasanat") {
      const totalHasanat = hasanatData.reduce((sum, student) => sum + student.hasanat, 0)
      const avgStreak = Math.round(
        hasanatData.reduce((sum, student) => sum + student.streak, 0) /
          Math.max(hasanatData.length, 1)
      )
      const highestLevel = hasanatData.reduce((max, student) => Math.max(max, student.level), 0)

      return [
        {
          title: "Top earner",
          value: hasanatData[0]?.name ?? "-",
          description: `${hasanatData[0]?.hasanat ?? 0} hasanat earned`,
          icon: Star,
        },
        {
          title: "Average streak",
          value: `${Number.isFinite(avgStreak) ? avgStreak : 0} days`,
          description: "Consistent participation",
          icon: Flame,
        },
        {
          title: "Highest level",
          value: `Level ${highestLevel}`,
          description: `${totalHasanat} total class hasanat`,
          icon: Award,
        },
      ]
    }

    const totalSurahs = memorizationData.reduce((sum, student) => sum + student.surahs, 0)
    const avgRetention = Math.round(
      memorizationData.reduce((sum, student) => sum + student.retention, 0) /
        Math.max(memorizationData.length, 1)
    )
    const totalAyat = memorizationData.reduce((sum, student) => sum + student.ayat, 0)

    return [
      {
        title: "Memorisation leader",
        value: memorizationData[0]?.name ?? "-",
        description: `${memorizationData[0]?.surahs ?? 0} surahs secured`,
        icon: BookOpen,
      },
      {
        title: "Average retention",
        value: `${Number.isFinite(avgRetention) ? avgRetention : 0}%`,
        description: "Accuracy on weekly reviews",
        icon: Brain,
      },
      {
        title: "Āyāt memorised",
        value: totalAyat.toString(),
        description: `${totalSurahs} total surahs this class`,
        icon: ScrollText,
      },
    ]
  }, [category, hasanatData, memorizationData, recitationData, timeframe])

  const userStanding = currentUser[category][timeframe]

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-maroon-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-4xl font-bold text-maroon-900">Community Leaderboard</h1>
          <p className="mx-auto max-w-2xl text-lg text-maroon-700">
            Compare your progress with classmates and stay motivated to recite, memorise, and earn
            hasanat consistently.
          </p>
        </div>

        <div className="mb-8 grid gap-4 lg:grid-cols-4">
          <Card className="bg-gradient-to-r from-maroon-600 to-maroon-700 text-white lg:col-span-2">
            <CardContent className="flex h-full flex-col justify-between p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-wide text-maroon-100">
                      {timeframeLabels[timeframe]} standing
                    </p>
                    <h3 className="text-xl font-semibold">Your rank in {categoryLabels[category].title}</h3>
                  </div>
                </div>
                <Badge className="bg-white/15 text-white hover:bg-white/25">
                  {categoryLabels[category].title}
                </Badge>
              </div>
              <div className="mt-6 flex items-end justify-between">
                <div>
                  <p className="text-sm text-maroon-100">Position</p>
                  <p className="text-4xl font-bold text-yellow-300">#{userStanding.rank}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-maroon-100">Current score</p>
                  <p className="text-2xl font-semibold">{userStanding.primaryValue}</p>
                  <p className={`text-sm ${changeColor(userStanding.change)}`}>
                    {formatChange(userStanding.change)} this {timeframeLabels[timeframe].toLowerCase()}
                  </p>
                </div>
              </div>
              <Button className="mt-6 w-full bg-white text-maroon-700 hover:bg-maroon-50">
                Start today&apos;s practice
              </Button>
            </CardContent>
          </Card>

          {summaryCards.map(({ title, value, description, icon: Icon }) => (
            <Card key={title} className="bg-white/80 backdrop-blur">
              <CardContent className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="rounded-lg bg-maroon-100 p-2 text-maroon-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="border-maroon-100 text-xs font-medium">
                    {timeframeLabels[timeframe]}
                  </Badge>
                </div>
                <p className="text-sm font-medium uppercase tracking-wide text-maroon-500">{title}</p>
                <p className="mt-2 text-2xl font-semibold text-maroon-900">{value}</p>
                <p className="mt-1 text-sm text-maroon-600">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mb-6 flex flex-col gap-4 lg:flex-row">
          <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as Timeframe)} className="flex-1">
            <TabsList className="grid w-full grid-cols-3 bg-white/70 backdrop-blur">
              <TabsTrigger
                value="daily"
                className="data-[state=active]:bg-maroon-600 data-[state=active]:text-white"
              >
                Daily
              </TabsTrigger>
              <TabsTrigger
                value="weekly"
                className="data-[state=active]:bg-maroon-600 data-[state=active]:text-white"
              >
                Weekly
              </TabsTrigger>
              <TabsTrigger
                value="monthly"
                className="data-[state=active]:bg-maroon-600 data-[state=active]:text-white"
              >
                Monthly
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Tabs
            value={category}
            onValueChange={(value) => setCategory(value as LeaderboardCategory)}
            className="flex-1"
          >
            <TabsList className="grid w-full grid-cols-3 bg-white/70 backdrop-blur">
              <TabsTrigger
                value="recitation"
                className="data-[state=active]:bg-maroon-600 data-[state=active]:text-white"
              >
                <Mic2 className="mr-2 h-4 w-4" />
                Recitation
              </TabsTrigger>
              <TabsTrigger
                value="hasanat"
                className="data-[state=active]:bg-maroon-600 data-[state=active]:text-white"
              >
                <Star className="mr-2 h-4 w-4" />
                Hasanat
              </TabsTrigger>
              <TabsTrigger
                value="memorization"
                className="data-[state=active]:bg-maroon-600 data-[state=active]:text-white"
              >
                <BookMarked className="mr-2 h-4 w-4" />
                Memorisation
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Card className="border-0 bg-white/80 backdrop-blur">
          <CardContent className="p-0">
            <div className="border-b border-maroon-100 bg-maroon-50/60 px-6 py-4">
              <h2 className="text-lg font-semibold text-maroon-900">
                {timeframeLabels[timeframe]} {categoryLabels[category].title} leaderboard
              </h2>
              <p className="text-sm text-maroon-600">{categoryLabels[category].description}</p>
            </div>
            <div className="px-4 py-4 sm:px-6">
              <Table className="text-base">
                <TableHeader>
                  <TableRow className="bg-maroon-50/50">
                    <TableHead className="w-24 text-center text-maroon-800">Rank</TableHead>
                    <TableHead className="text-maroon-800">Student</TableHead>
                    {category === "recitation" && (
                      <>
                        <TableHead className="text-right text-maroon-800">Verses</TableHead>
                        <TableHead className="text-right text-maroon-800">Accuracy</TableHead>
                        <TableHead className="text-right text-maroon-800">Sessions</TableHead>
                      </>
                    )}
                    {category === "hasanat" && (
                      <>
                        <TableHead className="text-right text-maroon-800">Hasanat</TableHead>
                        <TableHead className="text-right text-maroon-800">Streak</TableHead>
                        <TableHead className="text-right text-maroon-800">Level</TableHead>
                      </>
                    )}
                    {category === "memorization" && (
                      <>
                        <TableHead className="text-right text-maroon-800">Surahs</TableHead>
                        <TableHead className="text-right text-maroon-800">Āyāt</TableHead>
                        <TableHead className="text-right text-maroon-800">Retention</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedData.map((entry) => (
                    <TableRow
                      key={entry.rank}
                      className={`border-maroon-100 bg-white/70 hover:bg-maroon-50/60 ${
                        entry.rank <= 3 ? "shadow-sm" : ""
                      }`}
                    >
                      <TableCell className="text-center">
                        <div
                          className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full text-base font-semibold ${getRankColor(entry.rank)}`}
                        >
                          {getBadgeIcon(entry.badge, entry.rank)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={entry.avatar} alt={entry.name} />
                            <AvatarFallback>
                              {entry.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-maroon-900">{entry.name}</p>
                            <div className="mt-1 flex items-center gap-2 text-xs">
                              <Badge
                                variant="outline"
                                className="border-maroon-200 bg-maroon-50 text-maroon-700"
                              >
                                {entry.classGroup}
                              </Badge>
                              <span className={`font-medium ${changeColor(entry.change)}`}>
                                {formatChange(entry.change)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      {category === "recitation" && (
                        <>
                          <TableCell className="text-right font-semibold text-maroon-900">
                            {(entry as RecitationEntry).verses}
                          </TableCell>
                          <TableCell className="text-right text-maroon-700">
                            {(entry as RecitationEntry).accuracy}%
                          </TableCell>
                          <TableCell className="text-right text-maroon-700">
                            {(entry as RecitationEntry).sessions}
                          </TableCell>
                        </>
                      )}
                      {category === "hasanat" && (
                        <>
                          <TableCell className="text-right font-semibold text-maroon-900">
                            {(entry as HasanatEntry).hasanat}
                          </TableCell>
                          <TableCell className="text-right text-maroon-700">
                            {(entry as HasanatEntry).streak} days
                          </TableCell>
                          <TableCell className="text-right text-maroon-700">
                            Level {(entry as HasanatEntry).level}
                          </TableCell>
                        </>
                      )}
                      {category === "memorization" && (
                        <>
                          <TableCell className="text-right font-semibold text-maroon-900">
                            {(entry as MemorizationEntry).surahs}
                          </TableCell>
                          <TableCell className="text-right text-maroon-700">
                            {(entry as MemorizationEntry).ayat}
                          </TableCell>
                          <TableCell className="text-right text-maroon-700">
                            {(entry as MemorizationEntry).retention}%
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-8 border-0 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
          <CardContent className="p-6 text-center">
            <Zap className="mx-auto mb-4 h-12 w-12 text-yellow-300" />
            <h3 className="text-xl font-semibold">Keep the momentum!</h3>
            <p className="mt-2 text-emerald-100">
              Every verse you recite and every āyah you memorise adds barakah to your journey. Stay
              consistent to climb even higher.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
