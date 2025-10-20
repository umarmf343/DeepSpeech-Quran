import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface ColorfulPageProps {
  children: ReactNode
  className?: string
  contentClassName?: string
  showGrid?: boolean
}

export function ColorfulPage({ children, className, contentClassName, showGrid = true }: ColorfulPageProps) {
  return (
    <div
      className={cn(
        "relative isolate min-h-full w-full overflow-hidden bg-gradient-to-br from-[#fef6f4] via-[#f5f7ff] to-[#f1fdf4]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-48 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-rose-300/35 blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[440px] w-[440px] rounded-full bg-emerald-300/30 blur-3xl" />
        <div className="absolute left-[-12%] top-1/3 h-[360px] w-[360px] rounded-full bg-sky-300/30 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.7),_transparent_60%)]" />
        {showGrid ? (
          <div className="absolute inset-0 opacity-[0.35] mix-blend-soft-light">
            <div className="h-full w-full bg-[linear-gradient(to_right,_rgba(255,255,255,0.35)_1px,transparent_1px)] bg-[size:40px]" />
            <div className="absolute inset-0 h-full w-full bg-[linear-gradient(to_bottom,_rgba(255,255,255,0.3)_1px,transparent_1px)] bg-[size:56px]" />
          </div>
        ) : null}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.45),_transparent_65%)]" />
      </div>
      <div className={cn("relative z-10 mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-12", contentClassName)}>{children}</div>
    </div>
  )
}

export default ColorfulPage
