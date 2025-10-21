import { randomUUID } from "crypto"

export type EggChallengeSessionStatus = "active" | "completed" | "aborted"

export interface EggChallengeSession {
  id: string
  duration: number
  startedAt: string
  completedAt?: string | null
  status: EggChallengeSessionStatus
}

interface EggChallengeSessionState {
  activeSession: EggChallengeSession | null
  sessions: EggChallengeSession[]
}

export interface EggChallengeSessionSnapshot {
  activeSession: EggChallengeSession | null
  sessions: EggChallengeSession[]
  totalCompleted: number
  lastCompletedAt: string | null
}

const sessionStore = new Map<string, EggChallengeSessionState>()

function createDefaultState(): EggChallengeSessionState {
  return {
    activeSession: null,
    sessions: [],
  }
}

function getState(userId: string): EggChallengeSessionState {
  if (!sessionStore.has(userId)) {
    sessionStore.set(userId, createDefaultState())
  }

  return sessionStore.get(userId) as EggChallengeSessionState
}

function normalize(state: EggChallengeSessionState): EggChallengeSessionSnapshot {
  const totalCompleted = state.sessions.filter((session) => session.status === "completed").length
  const lastCompleted = state.sessions
    .filter((session) => session.status === "completed" && session.completedAt)
    .sort((a, b) => new Date(b.completedAt ?? 0).getTime() - new Date(a.completedAt ?? 0).getTime())[0]

  return {
    activeSession: state.activeSession,
    sessions: [...state.sessions],
    totalCompleted,
    lastCompletedAt: lastCompleted?.completedAt ?? null,
  }
}

export function startEggChallengeSession(userId: string, duration: number): EggChallengeSessionSnapshot {
  const state = getState(userId)

  if (state.activeSession) {
    // Abort any existing active session before starting a new one
    state.activeSession.status = "aborted"
    state.sessions = state.sessions.map((session) =>
      session.id === state.activeSession?.id ? { ...session, status: "aborted" } : session,
    )
    state.activeSession = null
  }

  const session: EggChallengeSession = {
    id: randomUUID(),
    duration,
    startedAt: new Date().toISOString(),
    status: "active",
  }

  state.sessions.push(session)
  state.activeSession = session

  return normalize(state)
}

export function completeEggChallengeSession(
  userId: string,
  sessionId: string,
): EggChallengeSessionSnapshot {
  const state = getState(userId)
  if (!sessionId) {
    return normalize(state)
  }

  state.sessions = state.sessions.map((session) => {
    if (session.id !== sessionId) {
      return session
    }

    if (session.status === "completed") {
      return session
    }

    const completedAt = new Date().toISOString()

    return {
      ...session,
      status: "completed",
      completedAt,
    }
  })

  if (state.activeSession?.id === sessionId) {
    const active = state.sessions.find((session) => session.id === sessionId)
    state.activeSession = active && active.status === "active" ? active : null
  }

  if (state.activeSession && state.activeSession.id === sessionId && state.activeSession.status !== "active") {
    state.activeSession = null
  }

  return normalize(state)
}

export function resetEggChallengeSession(userId: string, sessionId?: string | null): EggChallengeSessionSnapshot {
  const state = getState(userId)

  if (sessionId && state.activeSession?.id === sessionId) {
    state.activeSession = null
  }

  state.sessions = state.sessions.map((session) => {
    if (session.id === sessionId && session.status === "active") {
      return { ...session, status: "aborted", completedAt: null }
    }
    return session
  })

  return normalize(state)
}

export function getEggChallengeSessionState(userId: string): EggChallengeSessionSnapshot {
  const state = getState(userId)
  return normalize(state)
}
