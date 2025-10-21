# Hasanat System Specification

## Overview
The Hasanat System rewards Quran readers for every letter they recite while interacting with the Quran Reader page. The system integrates live hasanat calculation, celebratory animations, daily goal tracking, and Ramadan-specific multipliers. The implementation targets the existing Node.js + Next.js application and leverages Tailwind CSS for styling and Framer Motion (or an equivalent animation library) for interactions.

## Core Concepts
- **Hasanat per letter:** 10 hasanat for every Arabic letter shown in the Quran verse container. Diacritics (harakat) are excluded from the count.
- **Trigger point:** Hasanat is calculated and queued when the "Next" navigation button is pressed to display the subsequent verse/ayah.
- **Visual feedback:** Animated sparkle particles spawn from the "Next" button to the fixed hasanat counter, showing the earned amount.
- **Milestone celebrations:** Celebratory modals, confetti, and sound cues for every 100 hasanat, completed surah, or achieved goal.
- **Progress tracking:** Persistent storage of hasanat totals, daily progress, goals, and leaderboard data.

## Detailed Requirements

### 1. Letter Counting Logic
1. Extract the Arabic text from the currently displayed verse in the Quran container.
2. Normalize the text by removing diacritics, punctuation, numerals, and whitespace.
3. Count the resulting characters; example: `"بِسْمِ" → "بسم"` → 3 letters.
4. Multiply the letter count by 10 to get hasanat earned for the verse.
5. Expose utility functions for:
   - `normalizeVerseText(text: string): string`
   - `countLetters(text: string): number`
   - `calculateHasanat(letterCount: number, multiplier = 10): number`
6. Provide unit tests covering Arabic edge cases, including ligatures, hamzat, and verses with tanween or shadda.

### 2. UI/UX Layout Changes
1. **Fixed Hasanat Container:**
   - Position at the top-right of the Quran Reader page.
   - Display current hasanat, streaks, goal progress, and Ramadan multiplier indicator.
   - Responsive design for mobile and desktop using Tailwind utility classes.

2. **Navigation Controls:**
   - Wrap existing "Next" button with an animated component that:
     - Displays sparkle emission and floating hasanat badge on click.
     - Triggers hasanat calculation and updates the counter.

3. **Sparkle Animation:**
   - Use Tailwind for styling, Framer Motion or React Spring for animation.
   - Emit 3–5 sparkle particles that travel upwards toward the hasanat container.
   - Floating badge displays `+{earnedHasanat}` and fades once it reaches the container.

4. **Celebration Pop-up:**
   - Modal overlay with congratulatory message and badge icons.
   - Trigger conditions:
     - Total hasanat divisible by 100.
     - Surah completion event.
     - Goal completion (daily, weekly, or user-defined).
   - Include call-to-action buttons: "Continue Reading", "Share", and "View Dashboard".

### 3. Daily Goals & Progress Tracking
1. **Goal Setup Flow:**
   - Onboarding modal prompting users to set daily verse/page/time goals.
   - Store goals in user profile (`/api/user/goals`).

2. **Progress Calculation:**
   - Track verses read, letters counted, pages approximated (based on 604-page Mushaf), and reading time per session.
   - Update progress after each verse.
   - Display progress rings/bars in the hasanat container and on the dashboard.

3. **Reminders & Nudges:**
   - Optional notifications or in-app reminders when behind schedule.
   - Tailwind alert components with motivational messages.

### 4. Gamification Elements
1. **Badges:**
   - Define milestone badges (e.g., "First Surah", "1000 Hasanat", "Daily Streak 7").
   - Show newly earned badge in celebration modal and store in profile.

2. **Streaks:**
   - Track consecutive days meeting daily goal.
   - Show streak counter in hasanat container and dashboard.

3. **Leaderboard:**
   - Global and friends-only leaderboards.
   - Columns: username, total hasanat, streak, last active.
   - Reusable component for dashboard integration.

### 5. Ramadan Special Rewards
1. **Ramadan Mode Toggle:**
   - Automatically detect Ramadan dates (server-configured) or allow manual override.
   - Display Ramadan badge and multiplier (e.g., x2, x3) in hasanat container.

2. **Multiplier Logic:**
   - Apply configurable multiplier to hasanat calculations during Ramadan.
   - For full Quran completion in Ramadan, award bonus up to 30,000,000 hasanat.

3. **Ramadan Challenges:**
   - Time-bound goals encouraging completion of juz or the entire Quran.
   - Leaderboard filter for Ramadan achievements.

### 6. Data & State Management
1. **Client State:**
   - Utilize React Context or Zustand for hasanat and goal state across components.
   - Persist to local storage for offline continuity.

2. **Server API:**
   - Endpoints:
     - `GET /api/hasanat/summary`
     - `POST /api/hasanat/record` (verse ID, letters, hasanat, timestamp)
     - `GET /api/leaderboard`
     - `POST /api/goals`
     - `PATCH /api/goals/:id`
   - Database tables/collections: `users`, `verses_read`, `hasanat_entries`, `goals`, `badges`, `leaderboard_snapshots`.

3. **Analytics:**
   - Track verse traversal events, goal completions, and celebration triggers for future insights.

### 7. Accessibility & Localization
1. Ensure animations respect reduced motion preferences (`prefers-reduced-motion`).
2. Provide ARIA labels and screen reader text for visual-only feedback (sparkles, pop-ups).
3. Support multilingual UI strings, especially Arabic and English.

### 8. Implementation Roadmap
1. **Phase 1:** Core counting logic, API endpoints, and database schema updates.
2. **Phase 2:** UI integration on Quran Reader page (hasanat container, sparkles, celebrations).
3. **Phase 3:** Daily goals onboarding, progress visualization, and streak logic.
4. **Phase 4:** Leaderboard, dashboard integration, and badge system.
5. **Phase 5:** Ramadan-specific features, multiplier toggles, and special challenges.

### 9. Testing Strategy
1. Unit tests for text normalization and counting utilities.
2. Integration tests for API endpoints and state synchronization.
3. UI snapshot and interaction tests for hasanat counter and celebrations.
4. Manual QA checklist covering goal setting, milestone celebrations, and Ramadan mode.

### 10. Performance & Monitoring
1. Optimize verse text processing by caching normalized verses server-side.
2. Debounce API writes when users rapidly navigate verses.
3. Monitor with application metrics (e.g., hasanat events per minute) and error logging.

## Appendix
- **Example Calculation:**
  - Verse: `"بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"`
  - Normalized: `"بسماللهالرحمنالرحيم"`
  - Letters: 19 → Hasanat: 190.
- **Animation References:** Tailwind CSS gradients, `drop-shadow` utilities, Framer Motion `AnimatePresence`, Lottie files for celebratory confetti.
- **Inspiration:** Gamified Quran apps, Duolingo streak mechanics, Ramadan reward multipliers.
