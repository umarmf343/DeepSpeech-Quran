export function calculateLevel(totalPoints) {
  if (totalPoints < 500) return 1
  if (totalPoints < 1000) return 2
  if (totalPoints < 2000) return 3
  if (totalPoints < 3500) return 4
  if (totalPoints < 5000) return 5
  return 6
}

export function getPointsToNextLevel(totalPoints) {
  const currentLevel = calculateLevel(totalPoints)
  const levelThresholds = [0, 500, 1000, 2000, 3500, 5000]
  const nextThreshold = levelThresholds[currentLevel] || 5000
  return Math.max(0, nextThreshold - totalPoints)
}

export function getLevelName(level) {
  const names = ["Beginner", "Learner", "Scholar", "Master", "Expert", "Legend"]
  return names[level - 1] || "Legend"
}

export function getProgressPercentage(completedLessons) {
  return Math.round((completedLessons.length / 60) * 100)
}

export function calculateStreak(lastActivityDate) {
  if (!lastActivityDate) return 0
  const today = new Date()
  const lastDate = new Date(lastActivityDate)
  const diffTime = Math.abs(today.getTime() - lastDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= 1 ? 1 : 0
}
