"use client"

interface LessonProgressTrackerProps {
  currentStep: number
  totalSteps: number
  score: number
  lessonTitle: string
}

export function LessonProgressTracker({ currentStep, totalSteps, score, lessonTitle }: LessonProgressTrackerProps) {
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100

  return (
    <div className="mb-8 w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-maroon">{lessonTitle}</h2>
          <p className="text-sm text-maroon/70">
            Step {currentStep + 1} of {totalSteps}
          </p>
        </div>
        <div className="rounded-full bg-white/80 px-4 py-2 text-right shadow-inner">
          <p className="text-3xl font-black text-maroon">{score}</p>
          <p className="text-xs font-semibold uppercase tracking-widest text-maroon/60">Points</p>
        </div>
      </div>

      <div className="h-3 w-full overflow-hidden rounded-full bg-maroon/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-maroon via-amber-300 to-pink-400 transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      {/* Step indicators */}
      <div className="mt-4 flex gap-2">
        {Array.from({ length: totalSteps }).map((_, idx) => (
          <div
            key={idx}
            className={`h-2 flex-1 rounded-full transition-all duration-300 ${
              idx < currentStep + 1 ? "bg-gradient-to-r from-maroon via-pink-300 to-amber-300" : "bg-white/60"
            }`}
          ></div>
        ))}
      </div>
    </div>
  )
}
