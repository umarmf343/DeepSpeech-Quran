export interface StreakData {
  currentStreak: number
  lastLessonDate: string
  longestStreak: number
  totalDaysLearned: number
}

export const DEFAULT_STREAK: StreakData = {
  currentStreak: 0,
  lastLessonDate: "",
  longestStreak: 0,
  totalDaysLearned: 0,
}

export const loadStreakData = (): StreakData => {
  if (typeof window === "undefined") return DEFAULT_STREAK
  const saved = localStorage.getItem("qkidStreak")
  return saved ? JSON.parse(saved) : DEFAULT_STREAK
}

export const saveStreakData = (data: StreakData) => {
  if (typeof window === "undefined") return
  localStorage.setItem("qkidStreak", JSON.stringify(data))
}

export const updateStreak = (): StreakData => {
  const streak = loadStreakData()
  const today = new Date().toISOString().split("T")[0]
  const lastDate = streak.lastLessonDate

  if (lastDate === today) {
    return streak
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]

  if (lastDate === yesterday) {
    streak.currentStreak += 1
  } else if (lastDate !== today) {
    streak.currentStreak = 1
  }

  streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak)
  streak.lastLessonDate = today
  streak.totalDaysLearned += 1

  saveStreakData(streak)
  return streak
}
