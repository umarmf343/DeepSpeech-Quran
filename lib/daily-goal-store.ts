export interface DailyGoalSnapshot {
  count: number
  target: number
  percentage: number
  remaining: number
  lastUpdated: string | null
}

interface DailyGoalState {
  count: number
  target: number
  lastUpdated: string | null
}

const DEFAULT_TARGET = 10

const dailyGoalStore = new Map<string, DailyGoalState>()

function createDefaultState(): DailyGoalState {
  return {
    count: 0,
    target: DEFAULT_TARGET,
    lastUpdated: null,
  }
}

function getState(userId: string): DailyGoalState {
  if (!dailyGoalStore.has(userId)) {
    dailyGoalStore.set(userId, createDefaultState())
  }

  return dailyGoalStore.get(userId) as DailyGoalState
}

function normalize(state: DailyGoalState): DailyGoalSnapshot {
  const remaining = Math.max(state.target - state.count, 0)
  const percentage = state.target === 0 ? 0 : Math.min(state.count / state.target, 1)

  return {
    count: state.count,
    target: state.target,
    remaining,
    percentage: Number(percentage.toFixed(4)),
    lastUpdated: state.lastUpdated,
  }
}

export function incrementDailyGoal(userId: string, verses = 1): DailyGoalSnapshot {
  if (verses <= 0) {
    return getDailyGoalState(userId)
  }

  const state = getState(userId)
  state.count += verses
  state.lastUpdated = new Date().toISOString()

  if (state.count >= state.target) {
    state.count = state.target
  }

  return normalize(state)
}

export function getDailyGoalState(userId: string): DailyGoalSnapshot {
  const state = getState(userId)
  return normalize(state)
}

export const dailyGoalConfig = {
  defaultTarget: DEFAULT_TARGET,
}
