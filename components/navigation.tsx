"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useUser } from "@/hooks/use-user"
import {
  BookOpen,
  Users,
  Trophy,
  CreditCard,
  Settings,
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
  Home,
  Target,
  Crown,
  Shield,
  Bell,
  Gamepad2,
  Sparkles,
} from "lucide-react"

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { profile, isPremium, signOut } = useUser()

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Play Games", href: "/games", icon: Gamepad2 },
    { name: "Habit Quest", href: "/habits", icon: Gamepad2 },
    { name: "Qur'an Reader", href: "/reader", icon: BookOpen },
    { name: "Tajweed Lab", href: "/tajweed-lab", icon: Sparkles },
    { name: "Memorization", href: "/student/memorization", icon: Target },
    { name: "Progress", href: "/progress", icon: BarChart3 },
    { name: "Achievements", href: "/achievements", icon: Trophy },
    { name: "Leaderboard", href: "/leaderboard", icon: Crown },
    { name: "Billing", href: "/billing", icon: CreditCard },
    { name: "Account", href: "/account", icon: User },
  ]

  const teacherNavigation = [
    { name: "Teacher Dashboard", href: "/teacher/dashboard", icon: Users },
    { name: "Create Assignment", href: "/teacher/assignments/create", icon: Settings },
  ]

  const adminNavigation = [
    { name: "Admin Panel", href: "/admin", icon: Shield },
    { name: "System Settings", href: "/admin/settings", icon: Settings },
  ]

  const isActive = (href: string) => pathname === href

  const planLabel = useMemo(() => {
    const roleLabel = profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
    const planName = isPremium ? "Premium" : "Free"
    return `${planName} ${roleLabel}`
  }, [profile.role, isPremium])

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
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white/80 shadow-xl backdrop-blur-xl ring-1 ring-white/60 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 p-6 border-b border-white/50 bg-gradient-to-r from-maroon-600 via-maroon-500 to-amber-500 text-white">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-semibold">AlFawz</h1>
              <p className="text-xs text-white/80">Qur&apos;an Institute</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-3 bg-gradient-to-b from-white/70 via-white/40 to-white/10">
            {/* Main Navigation */}
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                      isActive(item.href)
                        ? "bg-gradient-to-r from-maroon-500/90 to-amber-400/90 text-white shadow-lg"
                        : "text-gray-700 hover:bg-white/80 hover:shadow"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/40 text-maroon-700 transition-all group-hover:bg-white/60 ${
                        isActive(item.href) ? "bg-white/20 text-white" : ""
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    {item.name}
                    {item.name === "Habit Quest" && !isPremium && (
                      <Badge className="ml-auto flex items-center gap-1 border-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                        <Sparkles className="h-3 w-3" />
                        New
                      </Badge>
                    )}
                    {item.name === "Achievements" && (
                      <Badge className="ml-auto border-0 bg-amber-100 text-amber-800">3</Badge>
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Teacher Section */}
            <div className="pt-4">
              <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Teaching</h3>
              <div className="space-y-1">
                {teacherNavigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                        isActive(item.href)
                          ? "bg-gradient-to-r from-emerald-500/80 to-teal-400/80 text-white shadow-lg"
                          : "text-gray-700 hover:bg-white/80 hover:shadow"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <span
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 transition-colors ${
                          isActive(item.href) ? "bg-white/20 text-white" : ""
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Admin Section */}
            <div className="pt-4">
              <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Administration</h3>
              <div className="space-y-1">
                {adminNavigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                        isActive(item.href)
                          ? "bg-gradient-to-r from-indigo-500/80 to-purple-500/80 text-white shadow-lg"
                          : "text-gray-700 hover:bg-white/80 hover:shadow"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <span
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 transition-colors ${
                          isActive(item.href) ? "bg-white/20 text-white" : ""
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      {item.name}
                      {item.name === "Admin Panel" && (
                        <Badge className="ml-auto border-0 bg-rose-100 text-rose-700">2</Badge>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          </nav>

          {/* User Profile */}
          <div className="border-t border-white/70 bg-white/70 p-4 backdrop-blur">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-maroon-500 to-amber-400 text-white shadow">
                <User className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">{profile.name}</p>
                <p className="text-xs text-gray-500">{planLabel}</p>
              </div>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start bg-white/80 text-gray-700 shadow-sm transition hover:bg-white"
              onClick={() => {
                console.log("[v0] User logging out")
                signOut()
                setIsOpen(false)
                router.push("/auth/login")
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setIsOpen(false)} />
      )}
    </>
  )
}
