export interface GameStats {
  gamesCompleted: number
  bestScores: { [gameId: string]: number }
  totalGamePoints: number
  lastGameScore: number
}

export const DEFAULT_GAME_STATS: GameStats = {
  gamesCompleted: 0,
  bestScores: { matching: 0, spelling: 0, memory: 0 },
  totalGamePoints: 0,
  lastGameScore: 0,
}

export const loadGameStats = (): GameStats => {
  if (typeof window === "undefined") return DEFAULT_GAME_STATS
  const saved = localStorage.getItem("qkidGameStats")
  return saved ? JSON.parse(saved) : DEFAULT_GAME_STATS
}

export const saveGameStats = (stats: GameStats) => {
  if (typeof window === "undefined") return
  localStorage.setItem("qkidGameStats", JSON.stringify(stats))
}

export const updateGameStats = (gameId: string, score: number): GameStats => {
  const stats = loadGameStats()
  stats.gamesCompleted += 1
  stats.lastGameScore = score
  stats.totalGamePoints += score

  if (score > (stats.bestScores[gameId] || 0)) {
    stats.bestScores[gameId] = score
  }

  saveGameStats(stats)
  return stats
}
