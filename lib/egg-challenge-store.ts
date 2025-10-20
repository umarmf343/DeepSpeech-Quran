export type EggChallengePhase = "egg" | "growth"

export interface EggChallengeCelebration {
  target: number
  completedAt: string
  phase: EggChallengePhase
  level: number
  growthStage?: number
}

export interface EggChallengeSnapshot {
  count: number
  target: number
  previousTarget: number | null
  lastCompletionTimestamp: string | null
  level: number
  remaining: number
  percentage: number
  crackedEggs: number
  phase: EggChallengePhase
  celebration: EggChallengeCelebration | null
  stepSize: number
  finalEggTarget: number
  growth: {
    totalStages: number
    completedStages: number
    activeStage: number
    percentageToNextStage: number
  }
}

interface EggChallengeState {
  currentCount: number
  activeTarget: number
  previousTarget: number | null
  lastCompletionTimestamp: string | null
  completedEggs: number
  growthStagesCompleted: number
  inGrowthPhase: boolean
  pendingCelebration: EggChallengeCelebration | null
}

const BASE_TARGET = 20
const LEVEL_STEP = 5
const MAX_LEVELS = 5
const FINAL_EGG_TARGET = BASE_TARGET + LEVEL_STEP * (MAX_LEVELS - 1)
const TOTAL_GROWTH_STAGES = 5

const eggChallengeStore = new Map<string, EggChallengeState>()

function createDefaultState(): EggChallengeState {
  return {
    currentCount: 0,
    activeTarget: BASE_TARGET,
    previousTarget: null,
    lastCompletionTimestamp: null,
    completedEggs: 0,
    growthStagesCompleted: 0,
    inGrowthPhase: false,
    pendingCelebration: null,
  }
}

function getState(userId: string): EggChallengeState {
  if (!eggChallengeStore.has(userId)) {
    eggChallengeStore.set(userId, createDefaultState())
  }

  return eggChallengeStore.get(userId) as EggChallengeState
}

export function calculateEggChallengeLevel(target: number): number {
  if (target <= BASE_TARGET) {
    return 1
  }

  const levelIncrement = Math.floor((target - BASE_TARGET) / LEVEL_STEP)
  const level = 1 + levelIncrement
  return Math.min(Math.max(level, 1), MAX_LEVELS)
}

function resolveEggChallengePhase(state: EggChallengeState): {
  phase: EggChallengePhase
  completedStages: number
  activeStage: number
} {
  if (state.inGrowthPhase) {
    return {
      phase: "growth",
      completedStages: state.growthStagesCompleted,
      activeStage: state.growthStagesCompleted + 1,
    }
  }

  const hasFinishedFinalEgg = state.previousTarget !== null && state.previousTarget >= FINAL_EGG_TARGET

  if (hasFinishedFinalEgg) {
    return {
      phase: "growth",
      completedStages: state.growthStagesCompleted,
      activeStage: state.growthStagesCompleted + 1,
    }
  }

  return {
    phase: "egg",
    completedStages: 0,
    activeStage: 1,
  }
}

function normalizeState(state: EggChallengeState, includeCelebration = false): EggChallengeSnapshot {
  const { phase, completedStages, activeStage } = resolveEggChallengePhase(state)
  const target = phase === "growth" ? FINAL_EGG_TARGET : state.activeTarget
  const remaining = Math.max(target - state.currentCount, 0)
  const percentage = target === 0 ? 0 : Math.min(state.currentCount / target, 1)
  const celebration = includeCelebration ? state.pendingCelebration : null

  return {
    count: state.currentCount,
    target,
    previousTarget: state.previousTarget,
    lastCompletionTimestamp: state.lastCompletionTimestamp,
    level: calculateEggChallengeLevel(target),
    remaining,
    percentage: Number(percentage.toFixed(4)),
    crackedEggs: Math.min(state.completedEggs, MAX_LEVELS),
    phase,
    celebration,
    stepSize: LEVEL_STEP,
    finalEggTarget: FINAL_EGG_TARGET,
    growth: {
      totalStages: TOTAL_GROWTH_STAGES,
      completedStages,
      activeStage,
      percentageToNextStage: phase === "growth" ? Number(percentage.toFixed(4)) : 0,
    },
  }
}

function completeEgg(state: EggChallengeState) {
  const completionTimestamp = new Date().toISOString()
  state.previousTarget = state.activeTarget
  state.lastCompletionTimestamp = completionTimestamp
  state.completedEggs = Math.min(state.completedEggs + 1, MAX_LEVELS)

  state.pendingCelebration = {
    target: state.activeTarget,
    completedAt: completionTimestamp,
    phase: "egg",
    level: calculateEggChallengeLevel(state.activeTarget),
  }

  if (state.activeTarget >= FINAL_EGG_TARGET) {
    state.inGrowthPhase = true
    state.activeTarget = FINAL_EGG_TARGET
  } else {
    state.activeTarget = Math.min(state.activeTarget + LEVEL_STEP, FINAL_EGG_TARGET)
  }

  state.currentCount = 0
}

function completeGrowthStage(state: EggChallengeState) {
  const completionTimestamp = new Date().toISOString()
  state.previousTarget = FINAL_EGG_TARGET
  state.lastCompletionTimestamp = completionTimestamp
  state.growthStagesCompleted += 1
  state.completedEggs = MAX_LEVELS

  state.pendingCelebration = {
    target: FINAL_EGG_TARGET,
    completedAt: completionTimestamp,
    phase: "growth",
    level: MAX_LEVELS,
    growthStage: state.growthStagesCompleted,
  }

  state.currentCount = 0
}

export function incrementEggChallenge(userId: string, verses = 1): EggChallengeSnapshot {
  if (verses <= 0) {
    return getEggChallengeState(userId)
  }

  const state = getState(userId)
  state.currentCount += verses

  if (state.inGrowthPhase) {
    if (state.currentCount >= FINAL_EGG_TARGET) {
      completeGrowthStage(state)
    }
  } else if (state.currentCount >= state.activeTarget) {
    completeEgg(state)
  }

  const snapshot = normalizeState(state, true)
  state.pendingCelebration = null
  return snapshot
}

export function getEggChallengeState(userId: string): EggChallengeSnapshot {
  const state = getState(userId)
  return normalizeState(state)
}

export const eggChallengeConfig = {
  baseTarget: BASE_TARGET,
  levelStep: LEVEL_STEP,
  maxLevels: MAX_LEVELS,
  finalEggTarget: FINAL_EGG_TARGET,
  growthStages: TOTAL_GROWTH_STAGES,
}

export const eggChallengeSettings = {
  enabled: true,
}
