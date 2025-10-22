"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-gradient-to-r from-sky-100 via-rose-50 to-amber-100 shadow-[inset_0_0_12px_rgba(255,255,255,0.7)] ring-1 ring-white/60",
      className,
    )}
    {...props}
  >
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,rgba(255,255,255,0.65),transparent_60%),radial-gradient(circle_at_80%_60%,rgba(255,255,255,0.45),transparent_55%)] mix-blend-screen" />
    <ProgressPrimitive.Indicator
      className="relative h-full w-full flex-1 overflow-hidden rounded-full bg-gradient-to-r from-sky-400 via-rose-400 to-amber-300 shadow-[0_0_18px_rgba(255,255,255,0.6)] transition-all duration-500 ease-out data-[state=indeterminate]:animate-disney-wave"
      style={value != null ? { transform: `translateX(-${100 - value}%)` } : undefined}
    >
      <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-2/3 bg-gradient-to-r from-transparent via-white to-transparent opacity-70 mix-blend-screen animate-disney-shimmer" />
      <span className="pointer-events-none absolute left-1/3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-white/80 blur-md mix-blend-screen animate-disney-sparkle" />
      <span className="pointer-events-none absolute left-2/3 top-1/3 h-4 w-4 rounded-full bg-white/70 blur-sm mix-blend-screen animate-disney-sparkle [animation-delay:1.2s]" />
    </ProgressPrimitive.Indicator>
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
