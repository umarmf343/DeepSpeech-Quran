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
      <h3 className="text-2xl font-bold text-maroon mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => handleItemClick(item.id)}
            disabled={completed.includes(item.id)}
            className={`p-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 ${
              completed.includes(item.id)
                ? "bg-green-100 border-2 border-green-400 text-green-700"
                : "bg-gradient-to-br from-maroon/10 to-gold/10 border-2 border-maroon/20 hover:border-maroon text-maroon"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {feedback && <div className="text-center text-lg font-bold text-maroon animate-bounce">{feedback}</div>}
    </div>
  )
}
