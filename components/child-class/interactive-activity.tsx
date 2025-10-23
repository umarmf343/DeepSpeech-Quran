"use client"

import { useState } from "react"

interface InteractiveActivityProps {
  title: string
  description: string
  items: Array<{ id: string; label: string; correct?: string }>
  onComplete: (score: number) => void
}

export function InteractiveActivity({ title, description, items, onComplete }: InteractiveActivityProps) {
  const [completed, setCompleted] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState("")

  const handleItemClick = (itemId: string) => {
    if (completed.includes(itemId)) return

    const nextCompleted = [...completed, itemId]
    const nextScore = score + 10
    setCompleted(nextCompleted)
    setScore(nextScore)
    setFeedback("Great! ✓")

    const resetFeedback = () => setFeedback("")
    const completeActivity = () => onComplete(nextScore)

    if (typeof window !== "undefined") {
      window.setTimeout(resetFeedback, 1000)
      if (nextCompleted.length === items.length) {
        window.setTimeout(completeActivity, 500)
      }
    } else {
      resetFeedback()
      if (nextCompleted.length === items.length) {
        completeActivity()
      }
    }
  }

  return (
    <div className="w-full">
      <h3 className="mb-2 text-2xl font-extrabold text-maroon">{title}</h3>
      <p className="mb-6 text-maroon/70">{description}</p>

      <div className="mb-6 grid grid-cols-2 gap-4">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => handleItemClick(item.id)}
            disabled={completed.includes(item.id)}
            className={`rounded-2xl p-4 font-extrabold transition-all duration-300 ${
              completed.includes(item.id)
                ? "bg-green-200 text-green-800 shadow-inner"
                : "bg-white/90 text-maroon shadow-lg hover:-translate-y-1 hover:scale-105"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {feedback && <div className="text-center text-lg font-extrabold text-maroon animate-bounce-soft">{feedback}</div>}
    </div>
  )
}
