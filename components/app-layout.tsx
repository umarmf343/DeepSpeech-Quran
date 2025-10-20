"use client"

import { Children, type ReactNode } from "react"

import Navigation from "@/components/navigation"
import { ColorfulPage } from "@/components/ui/colorful-page"

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const sections = Children.toArray(children).map((child, index) => (
    <section
      key={index}
      className="relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/85 p-6 shadow-2xl shadow-rose-100/40 backdrop-blur-xl sm:p-8"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-0 h-56 w-56 rounded-full bg-rose-200/40 blur-3xl" />
        <div className="absolute bottom-[-30%] right-0 h-64 w-64 rounded-full bg-emerald-200/35 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.75),_transparent_65%)]" />
      </div>
      <div className="relative z-10 flex flex-col gap-10">{child}</div>
    </section>
  ))

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-gradient-to-br from-[#fbeff0] via-white to-[#eefcf5]">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-rose-200/50 blur-3xl" />
        <div className="absolute bottom-[-20%] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute -right-28 top-24 h-[420px] w-[420px] rounded-full bg-sky-200/45 blur-3xl" />
      </div>
      <Navigation />
      <main className="relative z-10 flex-1 overflow-y-auto bg-transparent lg:ml-64">
        <ColorfulPage contentClassName="pb-20">
          <div className="flex flex-col gap-12">
            {sections.length > 0 ? sections : null}
          </div>
        </ColorfulPage>
      </main>
    </div>
  )
}

export { AppLayout }
