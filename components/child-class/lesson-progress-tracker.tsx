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
    <div className="w-full mb-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-maroon">{lessonTitle}</h2>
          <p className="text-sm text-gray-600">
            Step {currentStep + 1} of {totalSteps}
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-gold">{score}</p>
          <p className="text-sm text-gray-600">Points</p>
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-maroon to-gold h-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      {/* Step indicators */}
      <div className="flex gap-2 mt-4">
        {Array.from({ length: totalSteps }).map((_, idx) => (
          <div
            key={idx}
            className={`h-2 flex-1 rounded-full transition-all duration-300 ${
              idx < currentStep + 1 ? "bg-maroon" : "bg-gray-300"
            }`}
          ></div>
        ))}
      </div>
    </div>
  )
}
