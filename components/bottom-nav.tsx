"use client"

import type { ComponentType } from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ClipboardList,
  Crown,
  CreditCard,
  Flame,
  Gamepad2,
  Home,
  ScrollText,
  Settings as SettingsIcon,
  Shield,
  Sparkles,
  Target,
  Trophy,
  User,
  Users,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useUser } from "@/hooks/use-user"
import type { UserRole } from "@/components/user-provider"

type TabSlug =
  | "dashboard"
  | "reader"
  | "kid-class"
  | "memorization"
  | "qaidah"
  | "quran-companion"
  | "leaderboard"
  | "game"
  | "teacher-dashboard"
  | "admin-dashboard"
  | "settings"
  | "profile"

interface TabDefinition {
  slug: TabSlug
  label: string
  href: string
  icon: string
}

const TAB_REGISTRY: Record<TabSlug, TabDefinition> = {
  dashboard: { slug: "dashboard", label: "Dashboard", href: "/dashboard", icon: "home" },
  reader: { slug: "reader", label: "Reader", href: "/reader", icon: "book" },
  "kid-class": { slug: "kid-class", label: "Kids Class", href: "/kid-class", icon: "sparkles" },
  memorization: { slug: "memorization", label: "Memorization", href: "/memorization", icon: "target" },
  qaidah: { slug: "qaidah", label: "Qa'idah", href: "/qaidah", icon: "scroll" },
  "quran-companion": {
    slug: "quran-companion",
    label: "Quran Companion",
    href: "/quran-companion",
    icon: "companion",
  },
  leaderboard: { slug: "leaderboard", label: "Leaderboard", href: "/leaderboard", icon: "crown" },
  game: { slug: "game", label: "Game Lab", href: "/game", icon: "gamepad" },
  "teacher-dashboard": {
    slug: "teacher-dashboard",
    label: "Teacher Hub",
    href: "/teacher/dashboard",
    icon: "users",
  },
  "admin-dashboard": { slug: "admin-dashboard", label: "Admin", href: "/admin", icon: "shield" },
  settings: { slug: "settings", label: "Settings", href: "/settings/profile", icon: "settings" },
  profile: { slug: "profile", label: "Profile", href: "/auth/profile", icon: "user" },
}

const ROLE_TAB_MAP: Record<UserRole, TabSlug[]> = {
  visitor: ["dashboard", "reader", "kid-class", "memorization", "qaidah", "profile"],
  student: [
    "dashboard",
    "reader",
    "kid-class",
    "memorization",
    "qaidah",
    "quran-companion",
    "settings",
    "profile",
  ],
  teacher: [
    "dashboard",
    "reader",
    "kid-class",
    "memorization",
    "qaidah",
    "teacher-dashboard",
    "settings",
    "profile",
  ],
  admin: [
    "dashboard",
    "reader",
    "kid-class",
    "memorization",
    "qaidah",
    "leaderboard",
    "game",
    "admin-dashboard",
    "settings",
    "profile",
  ],
  parent: ["dashboard", "reader", "kid-class", "qaidah", "settings", "profile"],
}

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  home: Home,
  book: BookOpen,
  sparkles: Sparkles,
  target: Target,
  chart: BarChart3,
  trophy: Trophy,
  crown: Crown,
  users: Users,
  clipboard: ClipboardList,
  shield: Shield,
  settings: SettingsIcon,
  credit: CreditCard,
  user: User,
  practice: Gamepad2,
  flame: Flame,
  calendar: Calendar,
  scroll: ScrollText,
  gamepad: Gamepad2,
  companion: BookOpen,
}

const SENIOR_MODE_TABS = new Set<TabSlug>([
  "dashboard",
  "reader",
  "memorization",
  "qaidah",
  "quran-companion",
  "settings",
  "profile",
])

export function alfawz_get_bottom_nav_url(slug: TabSlug): string {
  return TAB_REGISTRY[slug]?.href ?? "/"
}

export function alfawz_get_nav_tabs(role: UserRole): TabDefinition[] {
  const tabSlugs = ROLE_TAB_MAP[role] ?? ROLE_TAB_MAP.student
  return tabSlugs.map((slug) => TAB_REGISTRY[slug])
}

function renderIcon(name: string) {
  const Icon = iconMap[name] ?? Sparkles
  return <Icon className="h-[0.833rem] w-[0.833rem]" aria-hidden="true" />
}

export function BottomNavigation() {
  const {
    profile,
    navigation,
    notifications,
    preferences,
    activeNav,
    setActiveNav,
  } = useUser()
  const pathname = usePathname()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [shadow, setShadow] = useState({ left: false, right: false })

  useEffect(() => {
    if (typeof window === "undefined") return
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setReduceMotion("matches" in event ? event.matches : (event as MediaQueryList).matches)
    }
    handleChange(query)
    query.addEventListener("change", handleChange)
    return () => query.removeEventListener("change", handleChange)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    document.body.classList.add("has-bottom-nav")
    return () => {
      document.body.classList.remove("has-bottom-nav")
    }
  }, [])

  const defaultTabs = useMemo(() => alfawz_get_nav_tabs(profile.role), [profile.role])

  const navLookup = useMemo(() => new Map(navigation.map((link) => [link.slug, link])), [navigation])

  const filteredNavigation = useMemo(() => {
    const merged = defaultTabs
      .map((tab) => {
        const override = navLookup.get(tab.slug)
        return override
          ? { ...tab, label: override.label, href: override.href, icon: override.icon }
          : tab
      })

    if (preferences.seniorMode) {
      return merged.filter((link) => SENIOR_MODE_TABS.has(link.slug))
    }

    return merged
  }, [defaultTabs, navLookup, preferences.seniorMode])

  useEffect(() => {
    const current = filteredNavigation.find((link) => pathname.startsWith(link.href))
    if (current) {
      setActiveNav(current.slug)
    }
  }, [filteredNavigation, pathname, setActiveNav])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container
      setShadow({ left: scrollLeft > 4, right: scrollLeft + clientWidth < scrollWidth - 4 })
    }

    handleScroll()
    container.addEventListener("scroll", handleScroll, { passive: true })
    return () => container.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollBy = useCallback(
    (direction: "left" | "right") => {
      const container = scrollRef.current
      if (!container) return
      container.scrollBy({
        left: direction === "left" ? -160 : 160,
        behavior: reduceMotion ? "auto" : "smooth",
      })
    },
    [reduceMotion],
  )

  const qaidaUpdates = useMemo(
    () =>
      notifications.filter((notification) => {
        if (notification.read) return false
        if (notification.type === "challenge") return true
        const text = `${notification.title} ${notification.message}`.toLowerCase()
        return text.includes("assignment") || text.includes("qaidah")
      }).length,
    [notifications],
  )

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-4xl flex-col gap-2 border-t border-maroon-100/70 bg-gradient-to-r from-cream-50/95 via-white/95 to-cream-50/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl shadow-[0_-18px_42px_rgba(122,46,37,0.15)] sm:rounded-t-3xl lg:hidden",
        reduceMotion ? "" : "transition-transform duration-300",
        isCollapsed ? "translate-y-[calc(100%-3.25rem)]" : "translate-y-0",
      )}
      aria-label="AlFawz navigation"
    >
      <button
        type="button"
        onClick={() => setIsCollapsed((prev) => !prev)}
        className="flex items-center gap-1 self-end rounded-full border border-maroon-100/70 bg-white/90 px-4 py-1 text-xs font-semibold text-maroon-700 shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon-300"
        aria-controls="alfawz-mobile-nav-content"
        aria-expanded={!isCollapsed}
      >
        {isCollapsed ? <span>Expand menu</span> : null}
        {isCollapsed ? (
          <ChevronUp className="h-[0.667rem] w-[0.667rem]" />
        ) : (
          <ChevronDown className="h-[0.667rem] w-[0.667rem]" />
        )}
      </button>
      <div
        id="alfawz-mobile-nav-content"
        className={cn(
          "relative",
          reduceMotion ? "" : "transition-[opacity,transform] duration-300",
          isCollapsed ? "pointer-events-none -translate-y-3 opacity-0" : "opacity-100",
        )}
        aria-hidden={isCollapsed}
      >
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-y-1 left-0 w-10 bg-gradient-to-r from-cream-50/95 via-cream-50/70 to-transparent transition-opacity duration-300",
            shadow.left ? "opacity-100" : "opacity-0",
          )}
        />
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-1 text-maroon-400">
          <button
            type="button"
            className={cn(
              "pointer-events-auto hidden rounded-full border border-transparent bg-white/90 p-1 text-maroon-600 shadow-sm transition hover:text-maroon-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon-400 sm:flex",
              shadow.left ? "opacity-100" : "opacity-0",
            )}
            aria-label="Scroll navigation left"
            onClick={() => scrollBy("left")}
          >
            <ChevronLeft className="h-[0.667rem] w-[0.667rem]" />
          </button>
        </div>
        <div
          ref={scrollRef}
          className={cn(
            "flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 pt-1",
            reduceMotion ? "" : "scroll-smooth",
          )}
          role="tablist"
        >
          {filteredNavigation.map((item) => {
            const isActive = activeNav === item.slug || pathname.startsWith(item.href)
            const Icon = () => renderIcon(item.icon)
            return (
              <Link
                key={item.slug}
                href={item.href}
                role="tab"
                aria-selected={isActive}
                data-current={isActive}
                className={cn(
                  "group relative flex min-w-[5.5rem] snap-center flex-col items-center justify-center gap-1 rounded-3xl border border-transparent px-4 py-2 text-xs font-semibold text-maroon-700 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50",
                  "bg-gradient-to-br from-amber-50/95 via-white/95 to-rose-50/90 text-maroon-800 shadow-[0_6px_18px_rgba(190,24,93,0.12)] backdrop-blur",
                  "hover:-translate-y-1 hover:bg-gradient-to-br hover:from-amber-100/85 hover:via-rose-100/85 hover:to-white/85 hover:shadow-[0_14px_28px_rgba(249,168,212,0.4)] hover:ring-2 hover:ring-amber-200/70",
                  isActive
                    ? "ring-2 ring-rose-300/80 shadow-[0_16px_32px_rgba(244,114,182,0.45)] text-maroon-900"
                    : "hover:text-maroon-900/90",
                )}
                onClick={() => setActiveNav(item.slug)}
              >
                <span
                  className={cn(
                    "relative flex h-[1.667rem] w-[1.667rem] items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-rose-500 to-maroon-600 text-white transition-all duration-300 shadow-[0_10px_25px_rgba(190,24,93,0.35)]",
                    isActive
                      ? "scale-110 shadow-[0_14px_32px_rgba(190,24,93,0.45)] ring-2 ring-white/40"
                      : "group-hover:scale-110 group-hover:shadow-[0_14px_32px_rgba(251,191,36,0.45)]",
                  )}
                >
                  <Icon />
                  {item.slug === "qaidah" && qaidaUpdates > 0 && (
                    <span className="absolute -right-1 -top-1 inline-flex h-4 w-4 items-center justify-center">
                      <span
                        className={cn(
                          "absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75",
                          reduceMotion ? "" : "animate-ping",
                        )}
                      />
                      <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[0.6rem] font-bold text-white">
                        {qaidaUpdates}
                      </span>
                    </span>
                  )}
                </span>
                <span className="text-[0.7rem] capitalize tracking-wide">{item.label}</span>
              </Link>
            )
          })}
        </div>
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-y-1 right-0 w-10 bg-gradient-to-l from-cream-50/95 via-cream-50/70 to-transparent transition-opacity duration-300",
            shadow.right ? "opacity-100" : "opacity-0",
          )}
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1 text-maroon-400">
          <button
            type="button"
            className={cn(
              "pointer-events-auto hidden rounded-full border border-transparent bg-white/90 p-1 text-maroon-600 shadow-sm transition hover:text-maroon-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon-400 sm:flex",
              shadow.right ? "opacity-100" : "opacity-0",
            )}
            aria-label="Scroll navigation right"
            onClick={() => scrollBy("right")}
          >
            <ChevronRight className="h-[0.667rem] w-[0.667rem]" />
          </button>
        </div>
      </div>
    </nav>
  )
}

export function alfawz_render_bottom_nav() {
  return <BottomNavigation />
}
