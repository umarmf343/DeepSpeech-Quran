"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useUser } from "@/hooks/use-user"
import {
  BadgeCheck,
  Bell,
  BookOpen,
  ClipboardList,
  Crown,
  Home,
  LogOut,
  Menu,
  Settings,
  Shield,
  Sparkles,
  Target,
  Trophy,
  User,
  Users,
  X,
} from "lucide-react"

const iconForSlug = (slug: string) => {
  switch (slug) {
    case "dashboard":
      return Home
    case "reader":
      return BookOpen
    case "practice":
      return Sparkles
    case "memorization":
      return Target
    case "progress":
      return BadgeCheck
    case "achievements":
      return Trophy
    case "leaderboard":
      return Crown
    case "teacher-dashboard":
      return Users
    case "assignments":
      return ClipboardList
    case "admin":
      return Shield
    case "billing":
      return Settings
    case "profile":
    default:
      return User
  }
}

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { profile, isPremium, navigation, notifications, setActiveNav, activeNav } = useUser()

  const planLabel = useMemo(() => {
    const roleLabel = profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
    const planName = isPremium ? "Premium" : "Free"
    return `${planName} ${roleLabel}`
  }, [profile.role, isPremium])

  const segmentedNavigation = useMemo(() => {
    const teacher = navigation.filter((item) => item.slug.startsWith("teacher"))
    const admin = navigation.filter((item) => item.slug === "admin")
    const primary = navigation.filter((item) => !teacher.includes(item) && !admin.includes(item))
    return { primary, teacher, admin }
  }, [navigation])

  const unreadCount = useMemo(() => notifications.filter((notification) => !notification.read).length, [notifications])

  const checkActive = (href: string, slug: string) => pathname.startsWith(href) || activeNav === slug

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="sm" onClick={() => setIsOpen(!isOpen)} className="bg-white/90 backdrop-blur-sm">
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 p-6 border-b">
            <div className="w-10 h-10 bg-gradient-to-br from-maroon-600 to-maroon-700 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-maroon-900">AlFawz</h1>
              <p className="text-xs text-maroon-600">Qur'an Institute</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-4">
            <div className="space-y-1">
              {segmentedNavigation.primary.map((item) => {
                const Icon = iconForSlug(item.slug)
                const active = checkActive(item.href, item.slug)
                return (
                  <Link
                    key={item.slug}
                    href={item.href}
                    data-current={active}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      active ? "bg-maroon-100 text-maroon-900 shadow-inner" : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => {
                      setIsOpen(false)
                      setActiveNav(item.slug)
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                    {item.slug === "achievements" && unreadCount > 0 && (
                      <Badge className="ml-auto bg-yellow-100 text-yellow-800 border-yellow-200 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        {unreadCount}
                      </Badge>
                    )}
                  </Link>
                )
              })}
            </div>

            {segmentedNavigation.teacher.length > 0 && (
              <div className="space-y-1">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Teaching</h3>
                {segmentedNavigation.teacher.map((item) => {
                  const Icon = iconForSlug(item.slug)
                  const active = checkActive(item.href, item.slug)
                  return (
                    <Link
                      key={item.slug}
                      href={item.href}
                      data-current={active}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        active ? "bg-maroon-100 text-maroon-900 shadow-inner" : "text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() => {
                        setIsOpen(false)
                        setActiveNav(item.slug)
                      }}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            )}

            {segmentedNavigation.admin.length > 0 && (
              <div className="space-y-1">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Administration</h3>
                {segmentedNavigation.admin.map((item) => {
                  const Icon = iconForSlug(item.slug)
                  const active = checkActive(item.href, item.slug)
                  return (
                    <Link
                      key={item.slug}
                      href={item.href}
                      data-current={active}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        active ? "bg-maroon-100 text-maroon-900 shadow-inner" : "text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() => {
                        setIsOpen(false)
                        setActiveNav(item.slug)
                      }}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                      {item.slug === "admin" && (
                        <Badge className="ml-auto bg-red-100 text-red-800 border-red-200">Live</Badge>
                      )}
                    </Link>
                  )
                })}
              </div>
            )}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-maroon-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-maroon-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{profile.name}</p>
                <p className="text-xs text-gray-500">{planLabel}</p>
              </div>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-gray-700 bg-transparent"
              onClick={() => {
                console.log("[v0] User logging out")
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
