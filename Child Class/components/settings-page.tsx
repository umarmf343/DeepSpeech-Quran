"use client"

import { useState, useEffect } from "react"
import { type UserSettings, loadSettings, saveSettings, DEFAULT_SETTINGS } from "@/lib/settings-utils"
import { loadParentalControls, saveParentalControls } from "@/lib/parental-controls"

interface SettingsPageProps {
  onBack: () => void
}

export default function SettingsPage({ onBack }: SettingsPageProps) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS)
  const [saved, setSaved] = useState(false)
  const [parentalControls, setParentalControls] = useState(null)
  const [showParentalSection, setShowParentalSection] = useState(false)

  useEffect(() => {
    setSettings(loadSettings())
    setParentalControls(loadParentalControls())
  }, [])

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    setSaved(false)
  }

  const handleParentalChange = (key: string, value: any) => {
    const newControls = { ...parentalControls, [key]: value }
    setParentalControls(newControls)
    setSaved(false)
  }

  const handleSaveSettings = () => {
    saveSettings(settings)
    if (parentalControls) {
      saveParentalControls(parentalControls)
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleResetSettings = () => {
    setSettings(DEFAULT_SETTINGS)
    saveSettings(DEFAULT_SETTINGS)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen px-4 py-8 md:px-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-maroon">Settings</h1>
        <button
          onClick={onBack}
          className="bg-maroon hover:bg-maroon/90 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300"
        >
          Back
        </button>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Display Settings */}
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-maroon mb-6">Display Settings</h2>

          <div className="space-y-6">
            {/* Theme */}
            <div className="flex justify-between items-center pb-6 border-b border-gray-200">
              <div>
                <p className="font-bold text-maroon">Theme</p>
                <p className="text-sm text-gray-600">Choose your preferred theme</p>
              </div>
              <select
                value={settings.theme}
                onChange={(e) => handleSettingChange("theme", e.target.value)}
                className="px-4 py-2 border-2 border-maroon/20 rounded-lg focus:outline-none focus:border-maroon"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            {/* Font Size */}
            <div className="flex justify-between items-center pb-6 border-b border-gray-200">
              <div>
                <p className="font-bold text-maroon">Font Size</p>
                <p className="text-sm text-gray-600">Adjust text size for readability</p>
              </div>
              <select
                value={settings.fontSize}
                onChange={(e) => handleSettingChange("fontSize", e.target.value)}
                className="px-4 py-2 border-2 border-maroon/20 rounded-lg focus:outline-none focus:border-maroon"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>

            {/* Language */}
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-maroon">Language</p>
                <p className="text-sm text-gray-600">Select your preferred language</p>
              </div>
              <select
                value={settings.language}
                onChange={(e) => handleSettingChange("language", e.target.value)}
                className="px-4 py-2 border-2 border-maroon/20 rounded-lg focus:outline-none focus:border-maroon"
              >
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </div>
          </div>
        </div>

        {/* Audio Settings */}
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-maroon mb-6">Audio Settings</h2>

          <div className="space-y-6">
            {/* Sound Effects */}
            <div className="flex justify-between items-center pb-6 border-b border-gray-200">
              <div>
                <p className="font-bold text-maroon">Sound Effects</p>
                <p className="text-sm text-gray-600">Enable/disable sound effects</p>
              </div>
              <button
                onClick={() => handleSettingChange("soundEnabled", !settings.soundEnabled)}
                className={`w-14 h-8 rounded-full transition-all duration-300 ${
                  settings.soundEnabled ? "bg-maroon" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-6 h-6 bg-white rounded-full transition-all duration-300 ${
                    settings.soundEnabled ? "translate-x-7" : "translate-x-1"
                  }`}
                ></div>
              </button>
            </div>

            {/* Auto-play Pronunciation */}
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-maroon">Auto-play Pronunciation</p>
                <p className="text-sm text-gray-600">Automatically play letter pronunciation</p>
              </div>
              <button
                onClick={() => handleSettingChange("autoPlayPronunciation", !settings.autoPlayPronunciation)}
                className={`w-14 h-8 rounded-full transition-all duration-300 ${
                  settings.autoPlayPronunciation ? "bg-maroon" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-6 h-6 bg-white rounded-full transition-all duration-300 ${
                    settings.autoPlayPronunciation ? "translate-x-7" : "translate-x-1"
                  }`}
                ></div>
              </button>
            </div>
          </div>
        </div>

        {/* Parental Controls */}
        {parentalControls && (
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-maroon">Parental Controls</h2>
              <button onClick={() => setShowParentalSection(!showParentalSection)} className="text-maroon font-bold">
                {showParentalSection ? "▼" : "▶"}
              </button>
            </div>

            {showParentalSection && (
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-6 border-b border-gray-200">
                  <div>
                    <p className="font-bold text-maroon">Enable Parental Controls</p>
                    <p className="text-sm text-gray-600">Restrict learning time and content</p>
                  </div>
                  <button
                    onClick={() => handleParentalChange("enabled", !parentalControls.enabled)}
                    className={`w-14 h-8 rounded-full transition-all duration-300 ${
                      parentalControls.enabled ? "bg-maroon" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 bg-white rounded-full transition-all duration-300 ${
                        parentalControls.enabled ? "translate-x-7" : "translate-x-1"
                      }`}
                    ></div>
                  </button>
                </div>

                {parentalControls.enabled && (
                  <>
                    <div className="flex justify-between items-center pb-6 border-b border-gray-200">
                      <div>
                        <p className="font-bold text-maroon">Daily Time Limit (minutes)</p>
                        <p className="text-sm text-gray-600">Maximum learning time per day</p>
                      </div>
                      <input
                        type="number"
                        value={parentalControls.dailyTimeLimit}
                        onChange={(e) => handleParentalChange("dailyTimeLimit", Number.parseInt(e.target.value))}
                        className="px-4 py-2 border-2 border-maroon/20 rounded-lg focus:outline-none focus:border-maroon w-20"
                      />
                    </div>

                    <div className="flex justify-between items-center pb-6 border-b border-gray-200">
                      <div>
                        <p className="font-bold text-maroon">Session Time Limit (minutes)</p>
                        <p className="text-sm text-gray-600">Maximum continuous learning time</p>
                      </div>
                      <input
                        type="number"
                        value={parentalControls.sessionTimeLimit}
                        onChange={(e) => handleParentalChange("sessionTimeLimit", Number.parseInt(e.target.value))}
                        className="px-4 py-2 border-2 border-maroon/20 rounded-lg focus:outline-none focus:border-maroon w-20"
                      />
                    </div>

                    <div className="flex justify-between items-center pb-6 border-b border-gray-200">
                      <div>
                        <p className="font-bold text-maroon">Content Filter</p>
                        <p className="text-sm text-gray-600">Restrict to beginner content</p>
                      </div>
                      <select
                        value={parentalControls.contentFilter}
                        onChange={(e) => handleParentalChange("contentFilter", e.target.value)}
                        className="px-4 py-2 border-2 border-maroon/20 rounded-lg focus:outline-none focus:border-maroon"
                      >
                        <option value="all">All Levels</option>
                        <option value="beginner">Beginner Only</option>
                        <option value="foundation">Beginner + Foundation</option>
                      </select>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-maroon">Break Reminder</p>
                        <p className="text-sm text-gray-600">Remind to take breaks</p>
                      </div>
                      <button
                        onClick={() => handleParentalChange("breakReminder", !parentalControls.breakReminder)}
                        className={`w-14 h-8 rounded-full transition-all duration-300 ${
                          parentalControls.breakReminder ? "bg-maroon" : "bg-gray-300"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 bg-white rounded-full transition-all duration-300 ${
                            parentalControls.breakReminder ? "translate-x-7" : "translate-x-1"
                          }`}
                        ></div>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Notification Settings */}
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-maroon mb-6">Notifications</h2>

          <div className="space-y-6">
            {/* Enable Notifications */}
            <div className="flex justify-between items-center pb-6 border-b border-gray-200">
              <div>
                <p className="font-bold text-maroon">Enable Notifications</p>
                <p className="text-sm text-gray-600">Receive app notifications</p>
              </div>
              <button
                onClick={() => handleSettingChange("notificationsEnabled", !settings.notificationsEnabled)}
                className={`w-14 h-8 rounded-full transition-all duration-300 ${
                  settings.notificationsEnabled ? "bg-maroon" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-6 h-6 bg-white rounded-full transition-all duration-300 ${
                    settings.notificationsEnabled ? "translate-x-7" : "translate-x-1"
                  }`}
                ></div>
              </button>
            </div>

            {/* Daily Reminder */}
            <div className="flex justify-between items-center pb-6 border-b border-gray-200">
              <div>
                <p className="font-bold text-maroon">Daily Reminder</p>
                <p className="text-sm text-gray-600">Get reminded to practice daily</p>
              </div>
              <button
                onClick={() => handleSettingChange("dailyReminder", !settings.dailyReminder)}
                className={`w-14 h-8 rounded-full transition-all duration-300 ${
                  settings.dailyReminder ? "bg-maroon" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-6 h-6 bg-white rounded-full transition-all duration-300 ${
                    settings.dailyReminder ? "translate-x-7" : "translate-x-1"
                  }`}
                ></div>
              </button>
            </div>

            {/* Reminder Time */}
            {settings.dailyReminder && (
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-maroon">Reminder Time</p>
                  <p className="text-sm text-gray-600">Set your daily reminder time</p>
                </div>
                <input
                  type="time"
                  value={settings.reminderTime}
                  onChange={(e) => handleSettingChange("reminderTime", e.target.value)}
                  className="px-4 py-2 border-2 border-maroon/20 rounded-lg focus:outline-none focus:border-maroon"
                />
              </div>
            )}
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-maroon mb-6">Data Management</h2>

          <div className="space-y-4">
            <button
              onClick={() => {
                const progress = localStorage.getItem("qkidProgress")
                const gameStats = localStorage.getItem("qkidGameStats")
                const streak = localStorage.getItem("qkidStreak")
                const data = {
                  progress: progress ? JSON.parse(progress) : null,
                  gameStats: gameStats ? JSON.parse(gameStats) : null,
                  streak: streak ? JSON.parse(streak) : null,
                  exportDate: new Date().toISOString(),
                }
                const element = document.createElement("a")
                element.setAttribute(
                  "href",
                  "data:text/plain;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2)),
                )
                element.setAttribute("download", `qkid-progress-${new Date().toISOString().split("T")[0]}.json`)
                element.style.display = "none"
                document.body.appendChild(element)
                element.click()
                document.body.removeChild(element)
              }}
              className="w-full bg-gradient-to-r from-maroon/10 to-gold/10 hover:from-maroon/20 hover:to-gold/20 border-2 border-maroon/20 hover:border-maroon text-maroon font-bold py-3 px-6 rounded-2xl transition-all duration-300"
            >
              📥 Export All Progress
            </button>

            <button
              onClick={handleResetSettings}
              className="w-full bg-gradient-to-r from-orange-100 to-orange-50 hover:from-orange-200 hover:to-orange-100 border-2 border-orange-300 text-orange-700 font-bold py-3 px-6 rounded-2xl transition-all duration-300"
            >
              Reset Settings to Default
            </button>

            <button
              onClick={() => {
                if (confirm("Are you sure you want to clear all progress? This cannot be undone.")) {
                  localStorage.removeItem("qkidProgress")
                  localStorage.removeItem("qkidSettings")
                  window.location.reload()
                }
              }}
              className="w-full bg-gradient-to-r from-red-100 to-red-50 hover:from-red-200 hover:to-red-100 border-2 border-red-300 text-red-700 font-bold py-3 px-6 rounded-2xl transition-all duration-300"
            >
              Clear All Data
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-4">
          <button
            onClick={handleSaveSettings}
            className="flex-1 bg-gradient-to-r from-maroon to-maroon/80 hover:from-maroon/90 hover:to-maroon/70 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105"
          >
            Save All Settings
          </button>
        </div>

        {/* Success Message */}
        {saved && (
          <div className="bg-green-100 border-2 border-green-400 text-green-700 font-bold py-4 px-6 rounded-2xl text-center">
            All settings saved successfully!
          </div>
        )}

        {/* About Section */}
        <div className="bg-gradient-to-br from-maroon/10 to-gold/10 rounded-3xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-maroon mb-4">About QKid</h2>
          <p className="text-gray-700 mb-4">
            QKid is an interactive learning platform designed to help you master Arabic reading and Quranic
            pronunciation through engaging lessons, games, and progress tracking.
          </p>
          <div className="space-y-2 text-sm text-gray-600">
            <p>Version: 1.0.0</p>
            <p>Last Updated: October 2025</p>
            <p>© 2025 QKid. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
