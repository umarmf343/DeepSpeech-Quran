export interface ParentalControls {
  enabled: boolean
  dailyTimeLimit: number // in minutes
  sessionTimeLimit: number // in minutes
  contentFilter: "all" | "beginner" | "foundation"
  breakReminder: boolean
  breakInterval: number // in minutes
}

export const DEFAULT_PARENTAL_CONTROLS: ParentalControls = {
  enabled: false,
  dailyTimeLimit: 60,
  sessionTimeLimit: 30,
  contentFilter: "all",
  breakReminder: true,
  breakInterval: 15,
}

export const loadParentalControls = (): ParentalControls => {
  if (typeof window === "undefined") return DEFAULT_PARENTAL_CONTROLS
  const saved = localStorage.getItem("qkidParentalControls")
  return saved ? JSON.parse(saved) : DEFAULT_PARENTAL_CONTROLS
}

export const saveParentalControls = (controls: ParentalControls) => {
  if (typeof window === "undefined") return
  localStorage.setItem("qkidParentalControls", JSON.stringify(controls))
}

export interface SessionTime {
  startTime: number
  totalTime: number
}

export const loadSessionTime = (): SessionTime => {
  if (typeof window === "undefined") return { startTime: Date.now(), totalTime: 0 }
  const saved = localStorage.getItem("qkidSessionTime")
  return saved ? JSON.parse(saved) : { startTime: Date.now(), totalTime: 0 }
}

export const saveSessionTime = (session: SessionTime) => {
  if (typeof window === "undefined") return
  localStorage.setItem("qkidSessionTime", JSON.stringify(session))
}

export const isSessionLimitExceeded = (): boolean => {
  const controls = loadParentalControls()
  if (!controls.enabled) return false

  const session = loadSessionTime()
  const elapsedMinutes = (Date.now() - session.startTime) / 60000
  return elapsedMinutes > controls.sessionTimeLimit
}
