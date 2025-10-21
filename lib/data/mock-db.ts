import { getCached, invalidateCache, setCached } from "@/lib/data/cache"

type Role = "visitor" | "student" | "teacher" | "admin"

type NotificationType = "celebration" | "reminder" | "challenge" | "system"

type ChallengeType = "daily" | "weekly" | "flash"

export interface NavigationLink {
  slug: string
  label: string
  href: string
  icon: string
  roles: Role[]
  badge?: string
  pill?: boolean
  priority?: number
}

export interface UserPreferences {
  reciter: string
  translation: string
  translationLanguage: string
  playbackSpeed: number
  challengeOptIn: boolean
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  seniorMode: boolean
  accessibilityFontSize: "normal" | "large"
  heroAnimation: boolean
  savedPermalinks: string[]
  navOrder: string[]
}

export interface Badge {
  id: string
  title: string
  description: string
  icon: string
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary"
  progress: number
  goal: number
  unlockedAt?: string
  accentColor: string
}

export interface TimedChallenge {
  id: string
  title: string
  description: string
  goal: number
  progress: number
  reward: string
  expiresAt: string
  type: ChallengeType
  icon: string
}

export interface GamificationMilestone {
  id: string
  title: string
  description: string
  progress: number
  threshold: number
  celebrationText: string
  status: "locked" | "in-progress" | "completed"
  asset: "nur" | "tree" | "medal"
  localizedCelebration: Record<string, string>
}

export interface GamificationState {
  xp: number
  hasanat: number
  level: number
  xpToNext: number
  streak: number
  heroCopy: {
    title: string
    subtitle: string
    kicker: string
  }
  milestones: GamificationMilestone[]
}

export interface LocalizationStrings {
  locale: string
  hero: {
    title: string
    subtitle: string
    action: string
  }
  navigation: Record<string, string>
  gamification: Record<string, string>
}

export interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  createdAt: string
  read: boolean
  actionHref?: string
}

export interface Recommendation {
  id: string
  title: string
  description: string
  href: string
  icon: string
  gradient: string
}

export interface RuntimeData {
  serverTime: string
  weeklyTheme: string
  featuredEvent: string
  onlineUsers: number
}

export interface UserStats {
  hasanat: number
  streak: number
  ayahsRead: number
  studyMinutes: number
  rank: number
  level: number
  xp: number
  xpToNext: number
  completedHabits: number
  weeklyXP: number[]
}

export interface HabitQuest {
  id: string
  title: string
  description: string
  difficulty: "easy" | "medium" | "hard"
  streak: number
  bestStreak: number
  level: number
  xp: number
  xpReward: number
  hasanatReward: number
  dailyTarget: string
  icon: string
  progress: number
  lastCompletedAt?: string
  weeklyProgress: number[]
}

export interface UserRecord {
  id: string
  email: string
  name: string
  role: Role
  locale: string
  avatarUrl?: string
  plan: "free" | "premium"
  joinedAt: string
  stats: UserStats
  habits: HabitQuest[]
  preferences: UserPreferences
  gamification: GamificationState
  badges: Badge[]
  challenges: TimedChallenge[]
  notifications: Notification[]
  localization: LocalizationStrings
  recommendations: Recommendation[]
  runtime: RuntimeData
}

function cloneUser(user: UserRecord): UserRecord {
  return JSON.parse(JSON.stringify(user))
}

const navigationLinks: NavigationLink[] = [
  { slug: "dashboard", label: "Dashboard", href: "/dashboard", icon: "home", roles: ["student", "teacher", "admin", "visitor"] },
  { slug: "reader", label: "Qur'an Reader", href: "/reader", icon: "book", roles: ["student", "teacher", "admin", "visitor"] },
  { slug: "kid-class", label: "Kids Class", href: "/kid-class", icon: "sparkles", roles: ["student", "teacher", "admin", "visitor"] },
  {
    slug: "memorization",
    label: "Memorization",
    href: "/memorization",
    icon: "target",
    roles: ["student", "teacher", "admin", "visitor"],
  },
  {
    slug: "qaidah",
    label: "Qa'idah",
    href: "/qaidah",
    icon: "scroll",
    roles: ["student", "teacher", "admin", "visitor"],
  },
  { slug: "leaderboard", label: "Leaderboard", href: "/leaderboard", icon: "crown", roles: ["admin"] },
  { slug: "game", label: "Game Lab", href: "/game", icon: "gamepad", roles: ["admin"] },
  { slug: "teacher-dashboard", label: "My Classroom", href: "/teacher/dashboard", icon: "users", roles: ["teacher", "admin"] },
  { slug: "assignments", label: "Assignments", href: "/teacher/assignments", icon: "clipboard", roles: ["teacher"] },
  { slug: "admin-dashboard", label: "Admin Dashboard", href: "/admin", icon: "shield", roles: ["admin"] },
  { slug: "practice", label: "Practice Lab", href: "/practice", icon: "sparkles", roles: ["student", "teacher", "admin"] },
  { slug: "progress", label: "Progress", href: "/progress", icon: "chart", roles: ["student", "teacher"] },
  { slug: "achievements", label: "Achievements", href: "/achievements", icon: "trophy", roles: ["student", "teacher", "admin"] },
  { slug: "billing", label: "Billing", href: "/billing", icon: "credit", roles: ["student", "teacher", "admin"] },
  { slug: "profile", label: "Profile", href: "/auth/profile", icon: "user", roles: ["student", "teacher", "admin", "visitor"] },
]

const sharedLocalization: LocalizationStrings = {
  locale: "en",
  hero: {
    title: "Keep nurturing your tree",
    subtitle: "Every recitation adds light to your journey",
    action: "Resume Lesson",
  },
  navigation: {
    dashboard: "Dashboard",
    reader: "Reader",
    practice: "Practice",
    memorization: "Memorization",
    progress: "Progress",
    achievements: "Achievements",
    leaderboard: "Leaderboard",
    profile: "Profile",
  },
  gamification: {
    celebrationEgg: "MashaAllah! Your nur companion is glowing.",
    celebrationTree: "Mashallah! Your tree is blooming.",
    streak: "Current streak",
  },
}

const BASE_TIMESTAMP = Date.UTC(2024, 0, 15, 12, 0, 0)
const DAY_IN_MS = 24 * 60 * 60 * 1000

const now = new Date(BASE_TIMESTAMP).toISOString()
const tomorrow = new Date(BASE_TIMESTAMP + DAY_IN_MS).toISOString()
const nextWeek = new Date(BASE_TIMESTAMP + 7 * DAY_IN_MS).toISOString()
const daysAgo = (days: number) => new Date(BASE_TIMESTAMP - days * DAY_IN_MS).toISOString()

const baseStats: UserStats = {
  hasanat: 2560,
  streak: 12,
  ayahsRead: 580,
  studyMinutes: 420,
  rank: 18,
  level: 9,
  xp: 3600,
  xpToNext: 400,
  completedHabits: 26,
  weeklyXP: [90, 120, 130, 80, 140, 110, 40],
}

const baseHabits: HabitQuest[] = [
  {
    id: "daily-recitation",
    title: "Daily Recitation Quest",
    description: "Recite at least 5 ayahs aloud focusing on Tajweed.",
    difficulty: "medium",
    streak: 6,
    bestStreak: 15,
    level: 3,
    xp: 260,
    xpReward: 60,
    hasanatReward: 45,
    dailyTarget: "5 ayahs",
    icon: "book",
    progress: 45,
    lastCompletedAt: now,
    weeklyProgress: [100, 80, 65, 100, 40, 0, 0],
  },
  {
    id: "memorization-review",
    title: "Memorization Review",
    description: "Review your latest memorized passage with the SM-2 queue.",
    difficulty: "hard",
    streak: 4,
    bestStreak: 9,
    level: 2,
    xp: 210,
    xpReward: 80,
    hasanatReward: 60,
    dailyTarget: "1 session",
    icon: "brain",
    progress: 60,
    lastCompletedAt: now,
    weeklyProgress: [90, 70, 40, 80, 30, 0, 0],
  },
  {
    id: "reflection-journal",
    title: "Reflection Journal",
    description: "Write a reflection about today's recitation in your journal.",
    difficulty: "easy",
    streak: 3,
    bestStreak: 8,
    level: 2,
    xp: 130,
    xpReward: 40,
    hasanatReward: 30,
    dailyTarget: "1 entry",
    icon: "pen",
    progress: 20,
    weeklyProgress: [70, 40, 20, 60, 10, 0, 0],
  },
]

const basePreferences: UserPreferences = {
  reciter: "Mishary Rashid",
  translation: "Sahih International",
  translationLanguage: "en",
  playbackSpeed: 1,
  challengeOptIn: true,
  notifications: { email: true, push: true, sms: false },
  seniorMode: false,
  accessibilityFontSize: "normal",
  heroAnimation: true,
  savedPermalinks: ["/reader", "/dashboard"],
  navOrder: navigationLinks.map((link) => link.slug),
}

const baseGamification: GamificationState = {
  xp: 3600,
  hasanat: 2560,
  level: 9,
  xpToNext: 400,
  streak: 12,
  heroCopy: {
    title: "Nur Bloom is awakening",
    subtitle: "Your consistent recitation is weaving light into every verse.",
    kicker: "Daily Quest",
  },
  milestones: [
    {
      id: "nur",
      title: "Nur Bloom Awakening",
      description: "Complete daily recitations to help your light companion blossom.",
      progress: 80,
      threshold: 100,
      celebrationText: "MashaAllah! Your nur companion is glowing brightly.",
      status: "in-progress",
      asset: "nur",
      localizedCelebration: {
        en: "MashaAllah! Your nur companion is glowing.",
        ar: "ما شاء الله! نورك يزداد إشراقًا.",
      },
    },
    {
      id: "tree",
      title: "Tree Blooming",
      description: "Maintain your streak to see your tree flourish.",
      progress: 45,
      threshold: 100,
      celebrationText: "Mashallah! Your tree is blooming.",
      status: "in-progress",
      asset: "tree",
      localizedCelebration: {
        en: "Mashallah! Your tree is blooming.",
        ar: "ما شاء الله! شجرتك تتفتح.",
      },
    },
  ],
}

const baseBadges: Badge[] = [
  {
    id: "streak-keeper",
    title: "Streak Keeper",
    description: "Maintain a 7-day recitation streak",
    icon: "flame",
    rarity: "uncommon",
    progress: 7,
    goal: 7,
    unlockedAt: now,
    accentColor: "from-orange-400 to-red-500",
  },
  {
    id: "recitation-hero",
    title: "Recitation Hero",
    description: "Complete 100 recitation sessions",
    icon: "sparkles",
    rarity: "rare",
    progress: 64,
    goal: 100,
    accentColor: "from-purple-500 to-indigo-500",
  },
  {
    id: "mentor",
    title: "Mentor",
    description: "Encourage 5 students this week",
    icon: "users",
    rarity: "common",
    progress: 3,
    goal: 5,
    accentColor: "from-emerald-400 to-teal-500",
  },
]

const baseChallenges: TimedChallenge[] = [
  {
    id: "weekly-streak",
    title: "Weekly Streak",
    description: "Keep your streak alive for the next 7 days",
    goal: 7,
    progress: 3,
    reward: "+120 XP & Special Dua",
    expiresAt: nextWeek,
    type: "weekly",
    icon: "calendar",
  },
  {
    id: "flash-review",
    title: "Flash Review",
    description: "Complete 3 review sessions before sunset",
    goal: 3,
    progress: 1,
    reward: "+90 XP & Blooming Tree Emote",
    expiresAt: tomorrow,
    type: "flash",
    icon: "zap",
  },
]

const baseNotifications: Notification[] = [
  {
    id: "notif-1",
    title: "New Challenge",
    message: "A new flash event is live for Surah Al-Mulk!",
    type: "challenge",
    createdAt: now,
    read: false,
    actionHref: "/practice",
  },
  {
    id: "notif-2",
    title: "Celebration",
    message: "MashaAllah! Your nur companion is glowing brightly.",
    type: "celebration",
    createdAt: now,
    read: true,
  },
]

const baseRecommendations: Recommendation[] = [
  {
    id: "rec-1",
    title: "Revise Surah Yaseen",
    description: "Based on your recent progress, a quick revision will boost your retention.",
    href: "/reader/surah-yaseen",
    icon: "refresh",
    gradient: "from-green-400 to-emerald-500",
  },
  {
    id: "rec-2",
    title: "Join the Tajweed Lab",
    description: "Unlock feedback tailored to your recitation style.",
    href: "/practice",
    icon: "mic",
    gradient: "from-purple-500 to-indigo-500",
  },
]

const userRecords: Record<string, UserRecord> = {
  user_student: {
    id: "user_student",
    email: "student@alfawz.io",
    name: "Ahmad Al-Hafiz",
    role: "student",
    locale: "en",
    plan: "premium",
    joinedAt: daysAgo(30),
    stats: baseStats,
    habits: baseHabits,
    preferences: basePreferences,
    gamification: baseGamification,
    badges: baseBadges,
    challenges: baseChallenges,
    notifications: baseNotifications,
    localization: sharedLocalization,
    recommendations: baseRecommendations,
    runtime: {
      serverTime: now,
      weeklyTheme: "Mercy and Reflection",
      featuredEvent: "Night Recitation Retreat",
      onlineUsers: 128,
    },
  },
  user_teacher: {
    id: "user_teacher",
    email: "teacher@alfawz.io",
    name: "Maryam Al-Qari",
    role: "teacher",
    locale: "en",
    plan: "premium",
    joinedAt: daysAgo(120),
    stats: { ...baseStats, rank: 3, hasanat: 4120 },
    habits: baseHabits,
    preferences: {
      ...basePreferences,
      navOrder: ["dashboard", "reader", "memorization", "qaidah", "teacher-dashboard", "profile"],
    },
    gamification: {
      ...baseGamification,
      heroCopy: {
        title: "Your classroom is thriving",
        subtitle: "3 students completed today's memorization challenge",
        kicker: "Teacher Spotlight",
      },
    },
    badges: baseBadges.map((badge) => ({ ...badge, progress: Math.min(badge.goal, badge.progress + 10) })),
    challenges: baseChallenges,
    notifications: baseNotifications,
    localization: sharedLocalization,
    recommendations: [
      ...baseRecommendations,
      {
        id: "rec-3",
        title: "Assign Reflection Journals",
        description: "Students loved your last reflective prompt.",
        href: "/teacher/assignments",
        icon: "book",
        gradient: "from-amber-400 to-orange-500",
      },
    ],
    runtime: {
      serverTime: now,
      weeklyTheme: "Guiding with Compassion",
      featuredEvent: "Teacher Summit",
      onlineUsers: 58,
    },
  },
  user_admin: {
    id: "user_admin",
    email: "admin@alfawz.io",
    name: "Admin Team",
    role: "admin",
    locale: "en",
    plan: "premium",
    joinedAt: daysAgo(200),
    stats: { ...baseStats, rank: 1, hasanat: 6020, weeklyXP: [150, 180, 170, 160, 190, 200, 190] },
    habits: baseHabits,
    preferences: {
      ...basePreferences,
      challengeOptIn: false,
      navOrder: ["dashboard", "reader", "memorization", "qaidah", "leaderboard", "game", "admin-dashboard", "profile"],
    },
    gamification: {
      ...baseGamification,
      heroCopy: {
        title: "Administrative Overview",
        subtitle: "System uptime is at 99.9% this week",
        kicker: "Control Center",
      },
    },
    badges: baseBadges,
    challenges: baseChallenges,
    notifications: baseNotifications,
    localization: sharedLocalization,
    recommendations: [
      {
        id: "rec-4",
        title: "Review Teacher Reports",
        description: "Ensure each class has submitted weekly metrics.",
        href: "/admin",
        icon: "clipboard",
        gradient: "from-slate-500 to-slate-700",
      },
    ],
    runtime: {
      serverTime: now,
      weeklyTheme: "Empower every learner",
      featuredEvent: "System Maintenance",
      onlineUsers: 12,
    },
  },
}

const emailToUserId = new Map<string, string>([
  ["student@alfawz.io", "user_student"],
  ["teacher@alfawz.io", "user_teacher"],
  ["admin@alfawz.io", "user_admin"],
])

export function getNavigationForRole(role: Role, preferences?: UserPreferences) {
  const filtered = navigationLinks.filter((link) => link.roles.includes(role))
  if (!preferences) {
    return filtered
  }
  const ordered = preferences.navOrder
    .map((slug) => filtered.find((item) => item.slug === slug))
    .filter((item): item is NavigationLink => Boolean(item))

  const remainder = filtered.filter((item) => !ordered.some((orderedItem) => orderedItem.slug === item.slug))
  return [...ordered, ...remainder]
}

export function getUserById(id: string) {
  const cacheKey = `user:${id}`
  const cached = getCached<UserRecord>(cacheKey)
  if (cached) {
    return cloneUser(cached)
  }
  const record = userRecords[id]
  if (!record) return null
  const cloned = cloneUser(record)
  setCached(cacheKey, cloned, 60 * 1000)
  return cloneUser(cloned)
}

export function getUserByEmail(email: string) {
  const id = emailToUserId.get(email)
  if (!id) return null
  return getUserById(id)
}

export function updateUserPreferences(id: string, patch: Partial<UserPreferences>) {
  const user = userRecords[id]
  if (!user) return null
  user.preferences = { ...user.preferences, ...patch }
  invalidateCache(`user:${id}`)
  return cloneUser(user)
}

export function updateUserStats(id: string, patch: Partial<UserStats>) {
  const user = userRecords[id]
  if (!user) return null
  user.stats = { ...user.stats, ...patch }
  invalidateCache(`user:${id}`)
  return cloneUser(user)
}

export function upsertNotification(id: string, notification: Notification) {
  const user = userRecords[id]
  if (!user) return null
  const existingIndex = user.notifications.findIndex((item) => item.id === notification.id)
  if (existingIndex >= 0) {
    user.notifications[existingIndex] = notification
  } else {
    user.notifications.unshift(notification)
  }
  invalidateCache(`user:${id}`)
  return cloneUser(user)
}

export function markNotificationRead(userId: string, notificationId: string) {
  const user = userRecords[userId]
  if (!user) return null
  user.notifications = user.notifications.map((notification) =>
    notification.id === notificationId ? { ...notification, read: true } : notification,
  )
  invalidateCache(`user:${userId}`)
  return cloneUser(user)
}

export function getLocalization(locale: string) {
  // For now the localization is the same for all locales, but we can extend later
  return { ...sharedLocalization, locale }
}

export function getRuntimeData(userId: string) {
  const user = userRecords[userId]
  if (!user) return null
  const runtime = {
    ...user.runtime,
    serverTime: new Date().toISOString(),
  }
  user.runtime = runtime
  invalidateCache(`user:${userId}`)
  return runtime
}

export function getGamificationData(userId: string) {
  const user = userRecords[userId]
  if (!user) return null
  return cloneUser(user).gamification
}

export function completeHabitForUser(userId: string, habitId: string) {
  const user = userRecords[userId]
  if (!user) return null
  const habit = user.habits.find((item) => item.id === habitId)
  if (!habit) return null

  habit.progress = Math.min(100, habit.progress + 20)
  habit.lastCompletedAt = new Date().toISOString()
  user.stats.completedHabits += 1
  user.stats.xp += habit.xpReward
  user.stats.hasanat += habit.hasanatReward
  user.gamification.xp += habit.xpReward
  user.gamification.hasanat += habit.hasanatReward
  user.gamification.xpToNext = Math.max(0, user.gamification.xpToNext - habit.xpReward)
  user.gamification.streak += 1

  if (user.gamification.xpToNext === 0) {
    user.gamification.level += 1
    user.gamification.xpToNext = 500
  }

  const milestone = user.gamification.milestones.find((item) => item.id === "nur")
  if (milestone) {
    milestone.progress = Math.min(100, milestone.progress + 25)
    if (milestone.progress >= milestone.threshold) {
      milestone.status = "completed"
    }
  }

  const celebration: Notification = {
    id: `celebration-${Date.now()}`,
    title: "Takbir!",
    message: "Your dedication just unlocked a new reward.",
    type: "celebration",
    createdAt: new Date().toISOString(),
    read: false,
  }
  user.notifications.unshift(celebration)

  invalidateCache(`user:${userId}`)
  return cloneUser(user)
}

export function recordBadgeEarned(userId: string, badgeId: string) {
  const user = userRecords[userId]
  if (!user) return null
  const badge = user.badges.find((item) => item.id === badgeId)
  if (!badge) return null
  badge.progress = badge.goal
  badge.unlockedAt = new Date().toISOString()
  invalidateCache(`user:${userId}`)
  return cloneUser(user)
}

export function getNavigationLinks() {
  return navigationLinks
}
