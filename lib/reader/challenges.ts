export type ReaderChallengeId =
  | "break-egg"
  | "mystery-box"
  | "chain-reaction"
  | "focus-mode"
  | "time-trial"
  | "progressive-focus"

export interface ReaderChallengeDefinition {
  id: ReaderChallengeId
  title: string
  tagline: string
  description: string
  baseGoal: number
  goalIncrement: number
  roundsToAdvance: number
  icon: string
  gradientClass: string
  accentClass: string
  celebrationCopy: string
}

export interface ReaderChallengeHistoryEntry {
  challengeId: ReaderChallengeId
  completedAt: string
  durationSeconds: number
  goal: number
  difficultyLevel: number
}

export interface ReaderChallengeState {
  currentChallengeId: ReaderChallengeId
  currentChallengeIndex: number
  progress: number
  goal: number
  roundsCompleted: number
  totalCompletions: number
  difficultyLevel: number
  startedAt: string
  lastCompletedAt?: string
  history: ReaderChallengeHistoryEntry[]
}

export interface ReaderChallengeSnapshot {
  state: ReaderChallengeState
  current: ReaderChallengeDefinition
  next: ReaderChallengeDefinition
}

export interface ReaderChallengeCelebration {
  challengeId: ReaderChallengeId
  challengeTitle: string
  completedRound: number
  roundsTarget: number
  durationSeconds: number
  versesCompleted: number
  difficultyLevel: number
  totalCompletions: number
  switchedChallenge: boolean
  nextChallengeId: ReaderChallengeId
  nextChallengeTitle: string
  completedAt: string
}

export interface ReaderChallengeUpdateResult {
  snapshot: ReaderChallengeSnapshot
  celebration: ReaderChallengeCelebration | null
}

export const READER_CHALLENGE_SEQUENCE: ReaderChallengeId[] = [
  "break-egg",
  "mystery-box",
  "chain-reaction",
  "focus-mode",
  "time-trial",
  "progressive-focus",
]

export const READER_CHALLENGE_DEFINITIONS: Record<ReaderChallengeId, ReaderChallengeDefinition> = {
  "break-egg": {
    id: "break-egg",
    title: "Break the Egg",
    tagline: "Warm up the egg with steady recitation",
    description: "",
    baseGoal: 10,
    goalIncrement: 2,
    roundsToAdvance: 5,
    icon: "🥚",
    gradientClass: "from-amber-50 via-rose-50 to-emerald-50",
    accentClass: "bg-amber-500",
    celebrationCopy: "Takbir! The egg cracked and nur overflows.",
  },
  "mystery-box": {
    id: "mystery-box",
    title: "Mystery Box",
    tagline: "Unlock the hidden blessing inside",
    description: "Recite diligently to gather keys that reveal the surprise inside the mystery box.",
    baseGoal: 12,
    goalIncrement: 3,
    roundsToAdvance: 1,
    icon: "🎁",
    gradientClass: "from-purple-50 via-indigo-50 to-sky-50",
    accentClass: "bg-purple-500",
    celebrationCopy: "Allahu Akbar! The box opens with radiant light.",
  },
  "chain-reaction": {
    id: "chain-reaction",
    title: "Chain Reaction",
    tagline: "Build an unbroken chain of focus",
    description: "Maintain consecutive verses without skipping to keep the chain reaction alive.",
    baseGoal: 5,
    goalIncrement: 1,
    roundsToAdvance: 1,
    icon: "⛓️",
    gradientClass: "from-emerald-50 via-teal-50 to-cyan-50",
    accentClass: "bg-emerald-500",
    celebrationCopy: "MashaAllah! Your chain of remembrance is intact.",
  },
  "focus-mode": {
    id: "focus-mode",
    title: "Focus Mode",
    tagline: "Recite without distraction",
    description: "Slow down and recite attentively to complete the calm focus session.",
    baseGoal: 8,
    goalIncrement: 2,
    roundsToAdvance: 1,
    icon: "🧘",
    gradientClass: "from-slate-50 via-emerald-50 to-amber-50",
    accentClass: "bg-emerald-600",
    celebrationCopy: "Peace settles in your heart—focus mastered.",
  },
  "time-trial": {
    id: "time-trial",
    title: "Time Trial",
    tagline: "Recite with gentle urgency",
    description: "Complete the target verses efficiently while maintaining serenity.",
    baseGoal: 10,
    goalIncrement: 3,
    roundsToAdvance: 1,
    icon: "⏱️",
    gradientClass: "from-sky-50 via-blue-50 to-indigo-50",
    accentClass: "bg-sky-500",
    celebrationCopy: "Swift and steady—your pace is inspiring.",
  },
  "progressive-focus": {
    id: "progressive-focus",
    title: "Progressive Focus",
    tagline: "Stretch your recitation muscles",
    description: "Each round gently increases the number of verses to grow your recitation stamina.",
    baseGoal: 14,
    goalIncrement: 4,
    roundsToAdvance: 1,
    icon: "🌱",
    gradientClass: "from-lime-50 via-emerald-50 to-amber-50",
    accentClass: "bg-lime-500",
    celebrationCopy: "Your focus is flourishing like a garden of nur.",
  },
}

export function calculateChallengeGoal(
  definition: ReaderChallengeDefinition,
  difficultyLevel: number,
): number {
  return Math.max(1, definition.baseGoal + (difficultyLevel - 1) * definition.goalIncrement)
}

export function createInitialReaderChallengeState(now = new Date()): ReaderChallengeState {
  const currentChallengeId = READER_CHALLENGE_SEQUENCE[0]
  const definition = READER_CHALLENGE_DEFINITIONS[currentChallengeId]
  const startedAt = now.toISOString()
  return {
    currentChallengeId,
    currentChallengeIndex: 0,
    progress: 0,
    goal: calculateChallengeGoal(definition, 1),
    roundsCompleted: 0,
    totalCompletions: 0,
    difficultyLevel: 1,
    startedAt,
    history: [],
  }
}

export function getChallengeDefinition(id: ReaderChallengeId): ReaderChallengeDefinition {
  return READER_CHALLENGE_DEFINITIONS[id]
}

export function getNextChallengeId(currentIndex: number): ReaderChallengeId {
  const nextIndex = (currentIndex + 1) % READER_CHALLENGE_SEQUENCE.length
  return READER_CHALLENGE_SEQUENCE[nextIndex]
}

export function buildSnapshot(state: ReaderChallengeState): ReaderChallengeSnapshot {
  const current = getChallengeDefinition(state.currentChallengeId)
  const next = getChallengeDefinition(getNextChallengeId(state.currentChallengeIndex))
  return {
    state: { ...state, history: state.history.slice(-25) },
    current,
    next,
  }
}
