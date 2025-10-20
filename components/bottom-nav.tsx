"use client"

import type { ComponentType } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  BookOpen,
  Calendar,
  ClipboardList,
  Crown,
  CreditCard,
  Flame,
  Gamepad2,
  Home,
  Shield,
  Sparkles,
  Target,
  Trophy,
  User,
  Users,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useUser } from "@/hooks/use-user"

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
  credit: CreditCard,
  user: User,
  practice: Gamepad2,
  flame: Flame,
  calendar: Calendar,
}

const SENIOR_MODE_TABS = new Set(["dashboard", "reader", "progress", "profile"])

function renderIcon(name: string) {
  const Icon = iconMap[name] ?? Sparkles
  return <Icon className="h-5 w-5" aria-hidden="true" />
}

export function BottomNavigation() {
  const {
    navigation,
    notifications,
    preferences,
    activeNav,
    setActiveNav,
    toggleSeniorMode,
    gamification,
    celebration,
  } = useUser()
  const pathname = usePathname()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [reduceMotion, setReduceMotion] = useState(false)
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

  const filteredNavigation = useMemo(() => {
    if (preferences.seniorMode) {
      return navigation.filter((link) => SENIOR_MODE_TABS.has(link.slug))
    }
    return navigation
  }, [navigation, preferences.seniorMode])

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
      setShadow({ left: scrollLeft > 8, right: scrollLeft + clientWidth < scrollWidth - 8 })
    }

    handleScroll()
    container.addEventListener("scroll", handleScroll, { passive: true })
    return () => container.removeEventListener("scroll", handleScroll)
  }, [])

  const unreadCount = notifications.filter((notification) => !notification.read).length
  const streak = gamification.streak

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-maroon-100 bg-gradient-to-r from-cream-50/95 via-white/95 to-cream-50/95 backdrop-blur-xl shadow-[0_-12px_40px_rgba(122,46,37,0.08)] lg:hidden">
      <div className="flex items-center justify-between px-4 pt-2">
        <button
          type="button"
          onClick={() => toggleSeniorMode()}
          className={cn(
            "rounded-full border border-maroon-200 bg-white px-3 py-1 text-xs font-medium text-maroon-700 transition-all",
            preferences.seniorMode
              ? "shadow-inner shadow-maroon-200"
              : "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-maroon-100",
          )}
          aria-pressed={preferences.seniorMode}
        >
          {preferences.seniorMode ? "Senior mode on" : "Senior mode"}
        </button>
        <div className="flex items-center gap-2 text-xs text-maroon-600">
          <span className="inline-flex items-center gap-1 rounded-full bg-maroon-50 px-3 py-1 font-semibold">
            <Sparkles className="h-4 w-4 text-amber-500" aria-hidden="true" />
            {celebration.active ? "Takbir!" : "Streak"} {celebration.active ? "" : `${streak}d`}
          </span>
          {unreadCount > 0 && (
            <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-1 font-semibold text-amber-700">
              {unreadCount} alerts
            </span>
          )}
        </div>
      </div>
      <div className="relative mt-2">
        <div
          ref={scrollRef}
          className={cn(
            "flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-3",
            reduceMotion ? "scroll-smooth" : "scroll-smooth",
          )}
          role="tablist"
          aria-label="Primary navigation"
        >
          {filteredNavigation.map((item) => {
            const isActive = activeNav === item.slug
            const Icon = () => renderIcon(item.icon)
            return (
              <Link
                key={item.slug}
                href={item.href}
                role="tab"
                aria-selected={isActive}
                data-current={isActive}
                className={cn(
                  "group relative flex min-w-[5.5rem] snap-center flex-col items-center justify-center gap-1 rounded-3xl border border-transparent px-4 py-2 text-xs font-semibold text-maroon-700 transition-all duration-300",
                  "bg-white/80 backdrop-blur hover:-translate-y-1",
                  isActive
                    ? "shadow-lg shadow-amber-200/40 ring-2 ring-maroon-200"
                    : "hover:shadow hover:shadow-maroon-100",
                )}
                onClick={() => setActiveNav(item.slug)}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-r from-maroon-500 to-maroon-600 text-white transition-all duration-300",
                    isActive ? "scale-105 shadow-inner" : "group-hover:scale-105",
                  )}
                >
                  <Icon />
                </span>
                <span className="text-[0.7rem] capitalize tracking-wide">{item.label}</span>
              </Link>
            )
          })}
        </div>
        <div
          className={cn(
            "pointer-events-none absolute inset-y-2 left-0 w-8 bg-gradient-to-r from-cream-50 via-cream-50/40 to-transparent transition-opacity",
            shadow.left ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          className={cn(
            "pointer-events-none absolute inset-y-2 right-0 w-8 bg-gradient-to-l from-cream-50 via-cream-50/40 to-transparent transition-opacity",
            shadow.right ? "opacity-100" : "opacity-0",
          )}
        />
      </div>
    </nav>
  )
}

export function alfawz_render_bottom_nav() {
  return <BottomNavigation />
}
