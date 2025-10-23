"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { usePathname } from "next/navigation"

import type {
  Badge,
  GamificationState,
  HabitQuest,
  LocalizationStrings,
  NavigationLink,
  Notification,
  Recommendation,
  RuntimeData,
  TimedChallenge,
  UserPreferences,
  UserRecord,
  UserStats,
} from "@/lib/data/mock-db"
import { HASANAT_PROGRESS_EVENT, type HasanatProgressDetail } from "@/hooks/use-hasanat-tracker"

class HttpError extends Error {
  status: number

  constructor(status: number, message?: string) {
    super(message ?? `Request failed with status ${status}`)
    this.name = "HttpError"
    this.status = status
  }
}

function isUnauthorizedError(error: unknown): error is HttpError {
  return error instanceof HttpError && error.status === 401
}

export type UserRole = "visitor" | "student" | "teacher" | "parent" | "admin"
export type SubscriptionPlan = "free" | "premium"
export type HabitDifficulty = "easy" | "medium" | "hard"

export interface UserProfile {
  id: string
  name: string
  email: string
  role: UserRole
  locale: string
  avatarUrl?: string
  plan: SubscriptionPlan
  joinedAt: string
}

export interface CompleteHabitResult {
  success: boolean
  message: string
}

interface CelebrationState {
  active: boolean
  title?: string
  message: string
  asset: "nur" | "tree" | "medal" | null
  rewardCopy?: string
}

export interface TriggerCelebrationPayload {
  title?: string
  message: string
  asset?: CelebrationState["asset"]
  rewardCopy?: string
}

interface UserContextValue {
  profile: UserProfile
  stats: UserStats
  habits: HabitQuest[]
  perks: string[]
  lockedPerks: string[]
  isPremium: boolean
  preferences: UserPreferences
  gamification: GamificationState
  badges: Badge[]
  challenges: TimedChallenge[]
  notifications: Notification[]
  localization: LocalizationStrings
  navigation: NavigationLink[]
  runtime: RuntimeData | null
  recommendations: Recommendation[]
  activeNav: string
  celebration: CelebrationState
  isLoading: boolean
  authToken: string | null
  completeHabit: (habitId: string) => Promise<CompleteHabitResult>
  updatePreferences: (patch: Partial<UserPreferences>) => Promise<void>
  toggleSeniorMode: () => Promise<void>
  markNotificationRead: (id: string) => Promise<void>
  refreshRuntime: () => Promise<void>
  updateGamification: (payload: { type: "habit" | "badge" | "notification"; habitId?: string; badgeId?: string }) => Promise<void>
  upgradeToPremium: () => Promise<void>
  downgradeToFree: () => Promise<void>
  setActiveNav: (slug: string) => void
  closeCelebration: () => void
  triggerCelebration: (payload: TriggerCelebrationPayload) => void
}

const DEFAULT_PROFILE: UserProfile = {
  id: "user_visitor",
  name: "Guest User",
  email: "guest@alfawz.io",
  role: "visitor",
  locale: "en",
  plan: "free",
  joinedAt: "2024-01-01T00:00:00.000Z",
}

const DEFAULT_STATS: UserStats = {
  hasanat: 0,
  streak: 0,
  ayahsRead: 0,
  studyMinutes: 0,
  rank: 0,
  level: 1,
  xp: 0,
  xpToNext: 500,
  completedHabits: 0,
  weeklyXP: [0, 0, 0, 0, 0, 0, 0],
}

const DEFAULT_PREFERENCES: UserPreferences = {
  reciter: "Mishary Rashid",
  translation: "Sahih International",
  translationLanguage: "en",
  playbackSpeed: 1,
  challengeOptIn: true,
  notifications: { email: true, push: true, sms: false },
  seniorMode: false,
  accessibilityFontSize: "normal",
  heroAnimation: true,
  savedPermalinks: ["/dashboard", "/reader"],
  navOrder: [
    "dashboard",
    "reader",
    "practice",
    "memorization",
    "progress",
    "achievements",
    "leaderboard",
    "profile",
  ],
}

const DEFAULT_GAMIFICATION: GamificationState = {
  xp: 0,
  hasanat: 0,
  level: 1,
  xpToNext: 500,
  streak: 0,
  heroCopy: {
    title: "Breathe nur into your recitation",
    subtitle: "Every verse nourishes the bloom within",
    kicker: "Daily Quest",
  },
  milestones: [],
}

const DEFAULT_LOCALIZATION: LocalizationStrings = {
  locale: "en",
  hero: {
    title: "Keep nurturing your tree",
    subtitle: "Continue building your Qur'anic legacy",
    action: "Resume lesson",
  },
  navigation: {},
  gamification: {
    celebrationEgg: "MashaAllah! Your nur companion is glowing.",
    celebrationTree: "Mashallah! Your tree is blooming.",
    streak: "Current streak",
  },
}

const STORAGE_KEYS = {
  token: "alfawz_token",
  preferences: "alfawz_preferences",
  activeNav: "alfawz_active_nav",
}

const PROTECTED_ROUTE_PREFIXES = [
  "/dashboard",
  "/reader",
  "/habits",
  "/achievements",
  "/game",
  "/practice",
  "/progress",
  "/leaderboard",
  "/kid-class",
  "/billing",
  "/qaidah",
  "/settings",
  "/admin",
  "/teacher",
  "/memorization",
  "/assignment-system",
  "/auth/profile",
]

const perksByPlan: Record<SubscriptionPlan, string[]> = {
  free: [
    "Daily habit quests",
    "Core Qur'an reader",
    "Weekly progress snapshots",
    "Basic leaderboard placement",
  ],
  premium: [
    "Daily habit quests",
    "Core Qur'an reader",
    "Weekly progress snapshots",
    "Basic leaderboard placement",
    "AI-powered Tajweed feedback",
    "Advanced habit insights & coaching",
    "Premium memorization playlists",
    "Unlimited class analytics",
  ],
}

const UserContext = createContext<UserContextValue | undefined>(undefined)

function reorderNavigation(links: NavigationLink[], order: string[]) {
  const map = new Map(links.map((link) => [link.slug, link]))
  const ordered = order.map((slug) => map.get(slug)).filter((link): link is NavigationLink => Boolean(link))
  const remainder = links.filter((link) => !order.includes(link.slug))
  return [...ordered, ...remainder]
}

function mergePreferences(base: UserPreferences, overrides?: Partial<UserPreferences>): UserPreferences {
  if (!overrides) return base
  return {
    ...base,
    ...overrides,
    notifications: {
      ...base.notifications,
      ...(overrides.notifications ?? {}),
    },
    navOrder: overrides.navOrder ?? base.navOrder,
    savedPermalinks: overrides.savedPermalinks ?? base.savedPermalinks,
  }
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hasHydrated = useRef(false)
  const sessionInitialized = useRef(false)
  const [token, setToken] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE)
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS)
  const [habits, setHabits] = useState<HabitQuest[]>([])
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES)
  const [gamification, setGamification] = useState<GamificationState>(DEFAULT_GAMIFICATION)
  const [badges, setBadges] = useState<Badge[]>([])
  const [challenges, setChallenges] = useState<TimedChallenge[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [localization, setLocalization] = useState<LocalizationStrings>(DEFAULT_LOCALIZATION)
  const [navigation, setNavigation] = useState<NavigationLink[]>([])
  const [runtime, setRuntime] = useState<RuntimeData | null>(null)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [activeNav, setActiveNavState] = useState<string>("dashboard")
  const [celebration, setCelebration] = useState<CelebrationState>({
    active: false,
    message: "",
    asset: null,
  })
  const [isLoading, setIsLoading] = useState(true)

  const loadPreferencesFromStorage = useCallback(() => {
    if (typeof window === "undefined") return null
    const stored = window.localStorage.getItem(STORAGE_KEYS.preferences)
    if (!stored) return null
    try {
      return JSON.parse(stored) as Partial<UserPreferences>
    } catch (error) {
      console.error("Failed to parse stored preferences", error)
      return null
    }
  }, [])

  const persistPreferences = useCallback((prefs: UserPreferences) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify(prefs))
    }
  }, [])

  const sessionRetryAttempted = useRef(false)

  const applyUser = useCallback(
    (user: UserRecord, nav?: NavigationLink[]) => {
      const localPreferenceOverrides = loadPreferencesFromStorage()
      const mergedPreferences = mergePreferences(user.preferences, localPreferenceOverrides ?? undefined)

      setProfile({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        locale: user.locale,
        plan: user.plan,
        joinedAt: user.joinedAt,
      })
      setStats(user.stats)
      setHabits(user.habits)
      setPreferences(mergedPreferences)
      setGamification(user.gamification)
      setBadges(user.badges)
      setChallenges(user.challenges)
      setNotifications(user.notifications)
      setLocalization(user.localization)
      setRuntime(user.runtime)
      setRecommendations(user.recommendations)

      if (nav && nav.length > 0) {
        setNavigation(reorderNavigation(nav, mergedPreferences.navOrder))
      } else if (navigation.length > 0) {
        setNavigation(reorderNavigation(navigation, mergedPreferences.navOrder))
      }

      persistPreferences(mergedPreferences)
      sessionRetryAttempted.current = false
      setIsLoading(false)
    },
    [loadPreferencesFromStorage, navigation, persistPreferences],
  )

  const initializeSession = useCallback(
    async (forceRefresh = false, options?: { silent?: boolean }) => {
      const { silent = false } = options ?? {}
      try {
        if (!silent) {
          setIsLoading(true)
        }
        const storedToken = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEYS.token) : null
        if (!forceRefresh && storedToken) {
          setToken(storedToken)
          return
        }

        const loginResponse = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ role: "student" }),
        })
        if (!loginResponse.ok) {
          throw new Error(`Login failed with status ${loginResponse.status}`)
        }
        const loginData = await loginResponse.json()
        setToken(loginData.token)
        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEYS.token, loginData.token)
        }
        applyUser(loginData.user, loginData.navigation)
      } catch (error) {
        console.error("Failed to initialize session", error)
        if (!silent) {
          setIsLoading(false)
        }
      }
    },
    [applyUser],
  )

  const authorizedFetch = useCallback(
    async (
      input: RequestInfo | URL,
      init: RequestInit = {},
      options: { retryOn401?: boolean } = {},
    ) => {
      const { retryOn401 = true } = options

      const resolveToken = () => {
        if (typeof window !== "undefined") {
          const storedToken = window.localStorage.getItem(STORAGE_KEYS.token)
          if (storedToken) {
            return storedToken
          }
        }
        if (token) {
          return token
        }
        return null
      }

      const execute = async (authToken: string | null) => {
        const headers = new Headers(init.headers)
        if (authToken) {
          headers.set("Authorization", `Bearer ${authToken}`)
        }
        if (init.body && !headers.has("Content-Type")) {
          headers.set("Content-Type", "application/json")
        }

        const response = await fetch(input, {
          ...init,
          headers,
          credentials: init.credentials ?? "include",
        })
        if (!response.ok) {
          throw new HttpError(response.status, response.statusText || undefined)
        }
        if (response.status === 204) {
          return null
        }
        const contentType = response.headers.get("Content-Type")
        if (contentType && contentType.includes("application/json")) {
          return response.json()
        }
        return response.text()
      }

      try {
        return await execute(resolveToken())
      } catch (error) {
        if (isUnauthorizedError(error) && retryOn401) {
          if (typeof window !== "undefined") {
            window.localStorage.removeItem(STORAGE_KEYS.token)
          }
          setToken(null)
          await initializeSession(true, { silent: true })
          const refreshedToken = resolveToken()
          if (!refreshedToken) {
            throw error
          }
          return execute(refreshedToken)
        }
        throw error
      }
    },
    [initializeSession, token],
  )

  const isProtectedRoute = useMemo(() => {
    if (!pathname) return false
    return PROTECTED_ROUTE_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(prefix.endsWith("/") ? prefix : `${prefix}/`),
    )
  }, [pathname])

  const hydrateFromSession = useCallback(async () => {
    if (!token || !isProtectedRoute) return
    try {
      const session = await authorizedFetch("/api/auth/session", undefined, { retryOn401: false })
      applyUser(session.user, session.navigation)
    } catch (error) {
      if (isUnauthorizedError(error)) {
        if (!sessionRetryAttempted.current) {
          sessionRetryAttempted.current = true
          if (typeof window !== "undefined") {
            window.localStorage.removeItem(STORAGE_KEYS.token)
          }
          setToken(null)
          await initializeSession(true)
        } else {
          setIsLoading(false)
        }
        return
      }

      console.error("Failed to load session", error)
      setIsLoading(false)
    }
  }, [applyUser, authorizedFetch, initializeSession, isProtectedRoute, token])

  useEffect(() => {
    if (hasHydrated.current) return
    hasHydrated.current = true

    if (typeof window !== "undefined") {
      const storedNav = window.localStorage.getItem(STORAGE_KEYS.activeNav)
      if (storedNav) {
        setActiveNavState(storedNav)
      }
    }
  }, [])

  useEffect(() => {
    if (!isProtectedRoute) {
      sessionInitialized.current = false
      setIsLoading(false)
      return
    }

    if (sessionInitialized.current) return
    sessionInitialized.current = true
    void initializeSession()
  }, [initializeSession, isProtectedRoute])

  useEffect(() => {
    if (!token || !isProtectedRoute) return
    hydrateFromSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isProtectedRoute])

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEYS.activeNav, activeNav)
    }
  }, [activeNav])

  useEffect(() => {
    if (typeof window === "undefined") return

    const handleHasanatProgress = (event: Event) => {
      const detail = (event as CustomEvent<HasanatProgressDetail>).detail
      if (!detail) return

      setStats((previous) => ({ ...previous, hasanat: detail.total }))
      setGamification((previous) => ({ ...previous, hasanat: detail.total }))
    }

    window.addEventListener(HASANAT_PROGRESS_EVENT, handleHasanatProgress as EventListener)
    return () => {
      window.removeEventListener(HASANAT_PROGRESS_EVENT, handleHasanatProgress as EventListener)
    }
  }, [setGamification, setStats])

  const isPremium = profile.plan === "premium"

  const perks = useMemo(() => perksByPlan[profile.plan], [profile.plan])

  const lockedPerks = useMemo(
    () => perksByPlan.premium.filter((perk) => !perksByPlan[profile.plan].includes(perk)),
    [profile.plan],
  )

  const setActiveNav = useCallback((slug: string) => {
    setActiveNavState(slug)
  }, [])

  const updatePreferences = useCallback(
    async (patch: Partial<UserPreferences>) => {
      const nextPreferences = mergePreferences(preferences, patch)
      setPreferences(nextPreferences)
      persistPreferences(nextPreferences)

      try {
        if (!token) {
          return
        }
        await authorizedFetch("/api/user/preferences", {
          method: "PUT",
          body: JSON.stringify(nextPreferences),
        })
      } catch (error) {
        if (isUnauthorizedError(error)) {
          return
        }
        console.error("Failed to persist preferences", error)
      }
    },
    [authorizedFetch, persistPreferences, preferences, token],
  )

  const toggleSeniorMode = useCallback(async () => {
    await updatePreferences({ seniorMode: !preferences.seniorMode })
  }, [preferences.seniorMode, updatePreferences])

  const markNotificationRead = useCallback(
    async (id: string) => {
      setNotifications((prev) => prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)))
      try {
        if (!token) {
          return
        }
        await authorizedFetch("/api/notifications", {
          method: "POST",
          body: JSON.stringify({ action: "mark-read", id }),
        })
      } catch (error) {
        if (isUnauthorizedError(error)) {
          return
        }
        console.error("Failed to mark notification as read", error)
      }
    },
    [authorizedFetch, token],
  )

  const refreshRuntime = useCallback(async () => {
    try {
      if (!token) {
        return
      }
      const { runtime: runtimeData } = await authorizedFetch("/api/runtime")
      setRuntime(runtimeData)
    } catch (error) {
      if (isUnauthorizedError(error)) {
        return
      }
      console.error("Failed to refresh runtime", error)
    }
  }, [authorizedFetch, token])

  const updateGamification = useCallback(
    async (payload: { type: "habit" | "badge" | "notification"; habitId?: string; badgeId?: string }) => {
      try {
        if (!token) {
          return
        }
        const response = await authorizedFetch("/api/gamification", {
          method: "POST",
          body: JSON.stringify(payload),
        })
        if (response && typeof response === "object") {
          const data = response as Partial<{ gamification: GamificationState; notifications: Notification[] }>
          if (data.gamification) {
            setGamification(data.gamification)
          }
          if (data.notifications) {
            setNotifications(data.notifications)
          }
        }
      } catch (error) {
        if (isUnauthorizedError(error)) {
          return
        }
        console.error("Failed to update gamification", error)
      }
    },
    [authorizedFetch, token],
  )

  const triggerCelebration = useCallback(
    ({ title, message, asset, rewardCopy }: TriggerCelebrationPayload) => {
      setCelebration({
        active: true,
        title: title ?? "Takbir!",
        message,
        asset: asset ?? "medal",
        rewardCopy,
      })
    },
    [],
  )

  const completeHabit = useCallback(
    async (habitId: string): Promise<CompleteHabitResult> => {
      if (!habitId) {
        return { success: false, message: "Habit not found." }
      }
      if (!token) {
        return { success: false, message: "Please sign in to complete habits." }
      }
      try {
        const response = await authorizedFetch("/api/user", {
          method: "PATCH",
          body: JSON.stringify({ habitId }),
        })
        if (response?.user) {
          applyUser(response.user)
          const milestone = response.user.gamification.milestones.find(
            (entry: GamificationState["milestones"][number]) => entry.status === "completed" && entry.progress >= entry.threshold,
          )
          if (milestone) {
            triggerCelebration({
              title: milestone.title,
              message: milestone.celebrationText,
              asset: milestone.asset,
              rewardCopy: `+${response.user.stats.hasanat - stats.hasanat} Hasanat`,
            })
          }
        }
        return { success: true, message: "Habit completed." }
      } catch (error) {
        if (isUnauthorizedError(error)) {
          return { success: false, message: "Unable to record habit progress right now." }
        }
        console.error("Failed to complete habit", error)
        return { success: false, message: "Unable to complete habit." }
      }
    },
    [applyUser, authorizedFetch, stats.hasanat, token, triggerCelebration],
  )

  const upgradeToPremium = useCallback(async () => {
    setProfile((prev) => ({ ...prev, plan: "premium" }))
  }, [])

  const downgradeToFree = useCallback(async () => {
    setProfile((prev) => ({ ...prev, plan: "free" }))
  }, [])

  const closeCelebration = useCallback(() => {
    setCelebration((prev) => ({ ...prev, active: false }))
  }, [])

  const value = useMemo<UserContextValue>(
    () => ({
      profile,
      stats,
      habits,
      perks,
      lockedPerks,
      isPremium,
      preferences,
      gamification,
      badges,
      challenges,
      notifications,
      localization,
      navigation,
      runtime,
      recommendations,
      activeNav,
      celebration,
      isLoading,
      authToken: token,
      completeHabit,
      updatePreferences,
      toggleSeniorMode,
      markNotificationRead,
      refreshRuntime,
      updateGamification,
      upgradeToPremium,
      downgradeToFree,
      setActiveNav,
      closeCelebration,
      triggerCelebration,
    }),
    [
      activeNav,
      badges,
      celebration,
      challenges,
      completeHabit,
      downgradeToFree,
      gamification,
      habits,
      isLoading,
      isPremium,
      localization,
      lockedPerks,
      markNotificationRead,
      navigation,
      notifications,
      perks,
      preferences,
      profile,
      recommendations,
      refreshRuntime,
      runtime,
      setActiveNav,
      stats,
      toggleSeniorMode,
      closeCelebration,
      triggerCelebration,
      updateGamification,
      updatePreferences,
      upgradeToPremium,
      token,
    ],
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUserContext() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
