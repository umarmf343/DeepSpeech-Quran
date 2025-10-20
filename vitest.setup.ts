import "@testing-library/jest-dom/vitest"

class MatchMediaMock implements MediaQueryList {
  matches: boolean
  media: string
  onchange: MediaQueryList['onchange'] = null
  private listeners = new Set<(event: MediaQueryListEvent) => void>()

  constructor(media: string, matches = false) {
    this.media = media
    this.matches = matches
  }

  addEventListener(_type: "change", listener: (event: MediaQueryListEvent) => void) {
    this.listeners.add(listener)
  }

  removeEventListener(_type: "change", listener: (event: MediaQueryListEvent) => void) {
    this.listeners.delete(listener)
  }

  addListener(listener: (event: MediaQueryListEvent) => void) {
    this.addEventListener("change", listener)
  }

  removeListener(listener: (event: MediaQueryListEvent) => void) {
    this.removeEventListener("change", listener)
  }

  dispatchEvent(event: MediaQueryListEvent): boolean {
    this.matches = event.matches
    this.listeners.forEach((listener) => listener(event))
    return true
  }
}

if (typeof window !== "undefined" && !window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => new MatchMediaMock(query),
  })
}

if (typeof window !== "undefined" && !window.requestAnimationFrame) {
  window.requestAnimationFrame = (callback: FrameRequestCallback) =>
    window.setTimeout(() => callback(performance.now()), 16)
  window.cancelAnimationFrame = (handle: number) => window.clearTimeout(handle)
}

if (typeof window !== "undefined" && !window.cancelAnimationFrame) {
  window.cancelAnimationFrame = (handle: number) => window.clearTimeout(handle)
}

if (typeof globalThis.ResizeObserver === "undefined") {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  ;(globalThis as typeof globalThis & { ResizeObserver: typeof ResizeObserverMock }).ResizeObserver = ResizeObserverMock
}
