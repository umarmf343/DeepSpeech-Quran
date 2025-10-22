"use client"

import { useState, useEffect } from "react"
import { playSound } from "@/lib/sound-effects"
import { loadSettings } from "@/lib/settings-utils"

export default function LessonPage({ lesson, onComplete, onBack }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [score, setScore] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const [feedbackType, setFeedbackType] = useState("success")
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [draggedItem, setDraggedItem] = useState(null)
  const [settings, setSettings] = useState(null)
  const [showCompletion, setShowCompletion] = useState(false)

  useEffect(() => {
    setSettings(loadSettings())
  }, [])

  const steps = [
    {
      type: "intro",
      title: "Learn the Letter",
      content: `Let's learn about ${lesson.title}`,
    },
    {
      type: "pronunciation",
      title: "Pronunciation",
      content: `Listen to how ${lesson.title} is pronounced`,
    },
    {
      type: "practice",
      title: "Practice",
      content: "Click on the correct letter",
    },
    {
      type: "writing",
      title: "Writing Practice",
      content: "Trace the letter",
    },
    {
      type: "quiz",
      title: "Quiz",
      content: "Test your knowledge",
    },
  ]

  const handlePronounce = () => {
    const utterance = new SpeechSynthesisUtterance(lesson.arabic)
    utterance.lang = "ar-SA"
    utterance.rate = 0.8
    window.speechSynthesis.speak(utterance)
    if (settings?.soundEnabled) {
      playSound("correct")
    }
  }

  const handlePracticeAnswer = (isCorrect) => {
    if (isCorrect) {
      setScore(score + 25)
      setFeedbackMessage("Excellent! 🎉")
      setFeedbackType("success")
      if (settings?.soundEnabled) {
        playSound("correct")
      }
    } else {
      setFeedbackMessage("Try again! 💪")
      setFeedbackType("error")
      if (settings?.soundEnabled) {
        playSound("incorrect")
      }
    }
    setShowFeedback(true)
    setTimeout(() => setShowFeedback(false), 1500)
  }

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setShowCompletion(true)
      if (settings?.soundEnabled) {
        playSound("complete")
      }
      setTimeout(() => {
        onComplete(score)
      }, 2500)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-milk via-milk to-milk/95 px-4 py-8 md:px-8">
      {/* Completion Modal */}
      {showCompletion && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-12 text-center max-w-md animate-scale-in shadow-2xl border-2 border-gold/30">
            <div className="text-7xl mb-6 animate-bounce">🎉</div>
            <h2 className="text-4xl font-bold text-maroon mb-3">Lesson Complete!</h2>
            <p className="text-3xl font-bold text-gold mb-6">{score} Points</p>
            <p className="text-maroon/70 text-lg">Fantastic work! Keep learning!</p>
          </div>
        </div>
      )}

      {/* Premium Header */}
      <div className="flex justify-between items-center mb-8 animate-slide-down">
        <button
          onClick={onBack}
          className="bg-white hover:bg-maroon/10 text-maroon font-bold py-2 px-4 rounded-lg transition-all duration-300 border-2 border-maroon/20"
        >
          ← Back
        </button>
        <h1 className="text-3xl md:text-4xl font-bold text-maroon text-center flex-1">{lesson.title}</h1>
        <div className="text-2xl font-bold text-gold bg-white px-4 py-2 rounded-lg border-2 border-gold/30">
          {score} pts
        </div>
      </div>

      <div className="w-full bg-maroon/10 rounded-full h-3 mb-8 overflow-hidden">
        <div
          className="bg-gradient-to-r from-maroon via-gold to-maroon h-full transition-all duration-500 ease-out"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        ></div>
      </div>

      {/* Step Indicator */}
      <div className="flex justify-center gap-2 mb-8">
        {steps.map((_, idx) => (
          <div
            key={idx}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx <= currentStep ? "bg-maroon w-8" : "bg-maroon/20 w-2"
            }`}
          ></div>
        ))}
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto">
        <div className="card-premium p-8 md:p-12 animate-slide-up">
          {currentStep === 0 && (
            <div className="text-center">
              <h2 className="text-3xl font-bold text-maroon mb-8">{steps[0].title}</h2>
              <div className="text-9xl mb-8 animate-float">{lesson.arabic}</div>
              <p className="text-xl text-maroon/70 mb-8">{lesson.description}</p>
              <div className="bg-gradient-to-br from-maroon/5 to-gold/5 rounded-2xl p-8 mb-8 border-2 border-maroon/10">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-maroon/60 mb-2">Transliteration</p>
                    <p className="text-2xl font-bold text-maroon">{lesson.translit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-maroon/60 mb-2">Rule</p>
                    <p className="text-2xl font-bold text-gold">{lesson.rule}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="text-center">
              <h2 className="text-3xl font-bold text-maroon mb-8">{steps[1].title}</h2>
              <div className="text-9xl mb-12 animate-float">{lesson.arabic}</div>
              <button
                onClick={handlePronounce}
                className="btn-primary hover:shadow-lg transition-all py-8 px-12 text-2xl mb-8 transform hover:scale-105 inline-block"
              >
                🔊 Listen to Pronunciation
              </button>
              <p className="text-maroon/70 text-lg">Click the button to hear the correct pronunciation</p>
            </div>
          )}

          {currentStep === 2 && (
            <div className="text-center">
              <h2 className="text-3xl font-bold text-maroon mb-8">{steps[2].title}</h2>
              <p className="text-xl text-maroon/70 mb-10">Which one is {lesson.title}?</p>
              <div className="grid grid-cols-2 gap-6 mb-8">
                {[lesson.arabic, "ب", "ت", "ث"].map((letter, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePracticeAnswer(letter === lesson.arabic)}
                    className="card-premium p-8 text-6xl font-bold hover:shadow-lg transition-all transform hover:scale-105 border-2 border-maroon/10 hover:border-gold/50"
                  >
                    {letter}
                  </button>
                ))}
              </div>
              {showFeedback && (
                <div
                  className={`text-2xl font-bold p-4 rounded-lg animate-scale-in ${
                    feedbackType === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {feedbackMessage}
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="text-center">
              <h2 className="text-3xl font-bold text-maroon mb-8">{steps[3].title}</h2>
              <p className="text-lg text-maroon/70 mb-10">Trace the letter below</p>
              <div className="card-premium p-12 mb-8 border-2 border-gold/30">
                <div className="text-9xl mb-8 opacity-20">{lesson.arabic}</div>
                <p className="text-maroon/70 mb-8">Try to write the letter in the space above</p>
                <button
                  onClick={() => {
                    setScore(score + 25)
                    setFeedbackMessage("Perfect tracing! 🎉")
                    setFeedbackType("success")
                    setShowFeedback(true)
                    setTimeout(() => setShowFeedback(false), 1500)
                  }}
                  className="btn-secondary hover:shadow-lg transition-all py-4 px-8"
                >
                  ✓ I've traced it
                </button>
              </div>
              {showFeedback && (
                <div
                  className={`text-2xl font-bold p-4 rounded-lg animate-scale-in ${
                    feedbackType === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {feedbackMessage}
                </div>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div className="text-center">
              <h2 className="text-3xl font-bold text-maroon mb-8">{steps[4].title}</h2>
              <div className="card-premium p-8 mb-8 border-2 border-gold/30">
                <p className="text-xl text-maroon mb-8">What is the transliteration of {lesson.arabic}?</p>
                <div className="grid grid-cols-2 gap-4">
                  {[lesson.translit, "Ba", "Ta", "Tha"].map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePracticeAnswer(option === lesson.translit)}
                      className="card-premium p-6 text-lg font-bold hover:shadow-lg transition-all transform hover:scale-105 border-2 border-maroon/10 hover:border-gold/50"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              {showFeedback && (
                <div
                  className={`text-2xl font-bold p-4 rounded-lg animate-scale-in ${
                    feedbackType === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {feedbackMessage}
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-12">
            <button
              onClick={onBack}
              className="flex-1 bg-white hover:bg-maroon/10 text-maroon font-bold py-4 px-6 rounded-xl transition-all duration-300 border-2 border-maroon/20"
            >
              Cancel
            </button>
            <button onClick={handleNextStep} className="flex-1 btn-primary hover:shadow-lg transition-all py-4 text-lg">
              {currentStep === steps.length - 1 ? "Complete Lesson" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
