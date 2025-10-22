export const ACHIEVEMENT_DEFINITIONS = [
  {
    id: "first-step",
    name: "First Step",
    description: "Complete your first lesson",
    icon: "👣",
    condition: (progress) => progress.completedLessons.length >= 1,
    points: 50,
  },
  {
    id: "letter-master",
    name: "Letter Master",
    description: "Complete 10 lessons",
    icon: "🔤",
    condition: (progress) => progress.completedLessons.length >= 10,
    points: 100,
  },
  {
    id: "word-builder",
    name: "Word Builder",
    description: "Complete 20 lessons",
    icon: "📝",
    condition: (progress) => progress.completedLessons.length >= 20,
    points: 150,
  },
  {
    id: "sentence-creator",
    name: "Sentence Creator",
    description: "Complete 40 lessons",
    icon: "✍️",
    condition: (progress) => progress.completedLessons.length >= 40,
    points: 200,
  },
  {
    id: "quran-master",
    name: "Quran Master",
    description: "Complete all 60 lessons",
    icon: "🏆",
    condition: (progress) => progress.completedLessons.length === 60,
    points: 500,
  },
  {
    id: "consistent-learner",
    name: "Consistent Learner",
    description: "Maintain a 7-day streak",
    icon: "🔥",
    condition: (progress) => progress.streak >= 7,
    points: 100,
  },
  {
    id: "week-warrior",
    name: "Week Warrior",
    description: "Maintain a 14-day streak",
    icon: "⚔️",
    condition: (progress) => progress.streak >= 14,
    points: 200,
  },
  {
    id: "month-master",
    name: "Month Master",
    description: "Maintain a 30-day streak",
    icon: "👑",
    condition: (progress) => progress.streak >= 30,
    points: 300,
  },
  {
    id: "perfect-score",
    name: "Perfect Score",
    description: "Score 100 points in a single lesson",
    icon: "💯",
    condition: (progress) => progress.perfectScores >= 1,
    points: 150,
  },
  {
    id: "quiz-champion",
    name: "Quiz Champion",
    description: "Complete 5 quizzes",
    icon: "🎯",
    condition: (progress) => progress.quizzesCompleted >= 5,
    points: 100,
  },
]

export function getUnlockedAchievements(progress) {
  return ACHIEVEMENT_DEFINITIONS.filter((achievement) => achievement.condition(progress))
}

export function getNextAchievements(progress) {
  return ACHIEVEMENT_DEFINITIONS.filter((achievement) => !achievement.condition(progress)).slice(0, 3)
}
