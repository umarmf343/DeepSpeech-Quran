export interface ChildLesson {
  id: number
  day: number
  title: string
  level: string
  arabic: string
  translit: string
  rule: string
  description: string
}

export interface ChildProgress {
  currentDay: number
  completedLessons: number[]
  totalPoints: number
  streak: number
  achievements: string[]
  perfectScores: number
  quizzesCompleted: number
}

export interface QuizQuestion {
  id: number
  question: string
  type: "multiple-choice" | "matching"
  options: string[]
  correct: string
}
