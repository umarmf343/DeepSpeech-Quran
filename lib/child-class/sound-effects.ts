export const playSound = (soundType: "correct" | "incorrect" | "complete" | "achievement") => {
  if (typeof window === "undefined") return

  const globalWindow = window as typeof window & { webkitAudioContext?: typeof window.AudioContext }
  const AudioContextCtor = globalWindow.AudioContext ?? globalWindow.webkitAudioContext
  if (!AudioContextCtor) return

  const audioContext = new AudioContextCtor()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  const now = audioContext.currentTime

  switch (soundType) {
    case "correct":
      oscillator.frequency.value = 800
      gainNode.gain.setValueAtTime(0.3, now)
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2)
      oscillator.start(now)
      oscillator.stop(now + 0.2)
      break
    case "incorrect":
      oscillator.frequency.value = 300
      gainNode.gain.setValueAtTime(0.2, now)
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
      oscillator.start(now)
      oscillator.stop(now + 0.3)
      break
    case "complete":
      oscillator.frequency.value = 1000
      gainNode.gain.setValueAtTime(0.3, now)
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5)
      oscillator.start(now)
      oscillator.stop(now + 0.5)
      break
    case "achievement":
      oscillator.frequency.value = 1200
      gainNode.gain.setValueAtTime(0.3, now)
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.6)
      oscillator.start(now)
      oscillator.stop(now + 0.6)
      break
  }

  oscillator.addEventListener("ended", () => {
    gainNode.disconnect()
    oscillator.disconnect()
    audioContext.close().catch(() => undefined)
  })
}
