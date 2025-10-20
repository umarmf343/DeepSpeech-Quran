import type { EggChallengeSnapshot } from "@/lib/egg-challenge-store"

declare global {
  interface WindowEventMap {
    "alfawz:egg-updated": CustomEvent<EggChallengeSnapshot>
  }
}

export {}
