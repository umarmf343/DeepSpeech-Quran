export interface UserSettings {
  theme: "light" | "dark"
  soundEnabled: boolean
  notificationsEnabled: boolean
  dailyReminder: boolean
  reminderTime: string
  language: "en" | "ar"
  fontSize: "small" | "medium" | "large"
  autoPlayPronunciation: boolean
}

export const DEFAULT_SETTINGS: UserSettings = {
  theme: "light",
  soundEnabled: true,
  notificationsEnabled: true,
  dailyReminder: true,
  reminderTime: "09:00",
  language: "en",
  fontSize: "medium",
  autoPlayPronunciation: true,
}

export function loadSettings(): UserSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS
  const saved = localStorage.getItem("qkidSettings")
  return saved ? JSON.parse(saved) : DEFAULT_SETTINGS
}

export function saveSettings(settings: UserSettings) {
  if (typeof window !== "undefined") {
    localStorage.setItem("qkidSettings", JSON.stringify(settings))
  }
}
