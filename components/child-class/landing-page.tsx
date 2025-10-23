"use client"

interface LandingPageProps {
  onStart: () => void
}

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-kid-candy px-4 py-10 text-maroon">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-8 top-12 h-36 w-36 rounded-3xl bg-white/40 blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-16 right-10 h-40 w-40 rounded-full bg-gradient-to-br from-maroon/25 via-amber-200/50 to-transparent blur-3xl animate-bounce-soft"></div>
        <div className="absolute inset-x-0 top-1/2 h-72 bg-gradient-to-r from-transparent via-white/30 to-transparent blur-2xl"></div>
      </div>

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center font-kid">
        <div className="mb-10 animate-fade-in">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white/70 shadow-lg ring-4 ring-white/60">
            <span className="text-5xl">🌙</span>
          </div>
          <h1 className="mt-6 text-6xl md:text-7xl font-extrabold tracking-tight text-maroon">Q-KID</h1>
          <p className="mt-3 text-xl md:text-2xl text-maroon/70">Where Quranic Learning Feels Like Playtime!</p>
        </div>

        <div className="kid-card w-full p-8 md:p-12 animate-slide-up">
          <div className="mb-10 space-y-4">
            <div className="text-6xl">📚✨</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-maroon">Adventure Awaits in Every Lesson!</h2>
            <p className="text-lg text-maroon/70">
              Dive into colorful stories, joyful recitations, and playful challenges that make Arabic letters and Quranic
              words unforgettable. Learn step-by-step over 60 delightful days crafted especially for young hearts.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="kid-pill rounded-2xl p-5 text-left shadow-lg">
              <div className="text-4xl">🎮</div>
              <h3 className="mt-2 text-xl font-bold text-maroon">Interactive Fun</h3>
              <p className="text-sm text-maroon/70">Mini games, friendly mascots, and songs keep every lesson exciting.</p>
            </div>
            <div className="kid-pill rounded-2xl p-5 text-left shadow-lg">
              <div className="text-4xl">🏆</div>
              <h3 className="mt-2 text-xl font-bold text-maroon">Sparkly Rewards</h3>
              <p className="text-sm text-maroon/70">Collect stars, stickers, and badges as you master new sounds.</p>
            </div>
            <div className="kid-pill rounded-2xl p-5 text-left shadow-lg">
              <div className="text-4xl">🌈</div>
              <h3 className="mt-2 text-xl font-bold text-maroon">Happy Progress</h3>
              <p className="text-sm text-maroon/70">Watch your rainbow progress meter glow brighter every day.</p>
            </div>
          </div>

          <button
            onClick={() => {
              onStart()
            }}
            className="mt-10 w-full rounded-3xl bg-gradient-to-r from-maroon via-maroon/90 to-maroon/80 py-4 text-xl font-extrabold text-[var(--color-milk)] shadow-[0_15px_40px_rgba(123,51,96,0.25)] transition-transform duration-300 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-maroon/30"
          >
            Let&apos;s Start the Journey!
          </button>
        </div>

        <p className="mt-8 text-sm text-maroon/60">No login needed • Friendly for beginners • Parents can track every smile</p>
      </div>
    </div>
  )
}
