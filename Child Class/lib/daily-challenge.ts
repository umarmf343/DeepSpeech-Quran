export interface DailyChallenge {
  date: string
  lessonId: number
  completed: boolean
  bonusPoints: number
  challengeType: "speed" | "accuracy" | "perfect"
}

export const generateDailyChallenge = (): DailyChallenge => {
  const today = new Date().toISOString().split("T")[0]
  const lessonId = Math.floor(Math.random() * 60) + 1
  const types: Array<"speed" | "accuracy" | "perfect"> = ["speed", "accuracy", "perfect"]
  const challengeType = types[Math.floor(Math.random() * types.length)]

  return {
    date: today,
    lessonId,
    completed: false,
    bonusPoints: challengeType === "perfect" ? 50 : challengeType === "accuracy" ? 30 : 20,
    challengeType,
  }
}

export const loadDailyChallenge = (): DailyChallenge => {
  if (typeof window === "undefined") return generateDailyChallenge()
  const saved = localStorage.getItem("qkidDailyChallenge")
  if (!saved) return generateDailyChallenge()

  const challenge = JSON.parse(saved)
  const today = new Date().toISOString().split("T")[0]

  if (challenge.date !== today) {
    return generateDailyChallenge()
  }

  return challenge
}

export const saveDailyChallenge = (challenge: DailyChallenge) => {
  if (typeof window === "undefined") return
  localStorage.setItem("qkidDailyChallenge", JSON.stringify(challenge))
}

export const completeDailyChallenge = (challenge: DailyChallenge) => {
  challenge.completed = true
  saveDailyChallenge(challenge)
}
