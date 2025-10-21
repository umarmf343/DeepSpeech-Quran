"use client"

import type React from "react"

import Navigation from "@/components/navigation"
import { CelebrationOverlay } from "@/components/celebration-overlay"

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-cream-50 via-white to-maroon-50 text-maroon-900">
      <div className="hidden lg:block">
        <Navigation />
      </div>
      <div className="relative flex-1 lg:ml-64">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(209,145,102,0.18),transparent_65%)]" />
        <main className="relative z-10 min-h-screen overflow-x-hidden pb-[calc(7rem+env(safe-area-inset-bottom))] pl-0 pr-0 lg:pb-24 xl:pb-12 2xl:pb-10">
          {children}
        </main>
      </div>
      <CelebrationOverlay />
    </div>
  )
}

export { AppLayout }
