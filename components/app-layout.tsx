"use client"

import type React from "react"

import Navigation from "@/components/navigation"

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-gradient-to-br from-cream-50 via-white to-maroon-50">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-amber-200/50 blur-3xl" />
        <div className="absolute -bottom-16 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute -right-24 top-24 h-96 w-96 rounded-full bg-maroon-200/40 blur-3xl" />
      </div>
      <Navigation />
      <main className="relative z-10 flex-1 overflow-y-auto bg-transparent lg:ml-64">
        <div className="relative min-h-screen">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(244,208,215,0.45),_transparent_55%),_radial-gradient(circle_at_bottom,_rgba(204,233,246,0.45),_transparent_60%)]" />
          <div className="relative z-10">{children}</div>
        </div>
      </main>
    </div>
  )
}

export { AppLayout }
