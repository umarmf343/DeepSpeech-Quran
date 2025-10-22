"use client"

import { useState } from "react"

export default function LandingPage({ onStart }) {
  const [isAnimating, setIsAnimating] = useState(false)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-br from-milk via-amber-50 to-orange-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-maroon/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gold/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-2xl text-center">
        {/* Logo/Title */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-6xl md:text-7xl font-bold text-maroon mb-2">Q-KID</h1>
          <p className="text-xl md:text-2xl text-maroon/70 font-semibold">Learn Quranic Arabic</p>
        </div>

        {/* Main Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 mb-8 animate-slide-up">
          <div className="mb-8">
            <div className="text-5xl mb-4">📚</div>
            <h2 className="text-3xl md:text-4xl font-bold text-maroon mb-4">Start Your Quranic Journey Today!</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Join thousands of kids learning Arabic letters, Harakat, and Quranic words through fun, interactive
              lessons. Master 60 days of curriculum designed just for you!
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-maroon/10 to-gold/10 rounded-2xl p-4">
              <div className="text-3xl mb-2">✨</div>
              <h3 className="font-bold text-maroon mb-2">Interactive Lessons</h3>
              <p className="text-sm text-gray-600">Learn through games and flashcards</p>
            </div>
            <div className="bg-gradient-to-br from-maroon/10 to-gold/10 rounded-2xl p-4">
              <div className="text-3xl mb-2">🏆</div>
              <h3 className="font-bold text-maroon mb-2">Earn Badges</h3>
              <p className="text-sm text-gray-600">Unlock achievements as you progress</p>
            </div>
            <div className="bg-gradient-to-br from-maroon/10 to-gold/10 rounded-2xl p-4">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-bold text-maroon mb-2">Track Progress</h3>
              <p className="text-sm text-gray-600">See your learning journey unfold</p>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => {
              setIsAnimating(true)
              setTimeout(onStart, 300)
            }}
            className="w-full bg-gradient-to-r from-maroon to-maroon/80 hover:from-maroon/90 hover:to-maroon/70 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl active:scale-95"
          >
            Start Learning Now
          </button>
        </div>

        {/* Footer Info */}
        <p className="text-maroon/60 text-sm">No login required • Start immediately • Learn at your own pace</p>
      </div>
    </div>
  )
}
