export type TajweedAlignmentOperation = {
  type: "match" | "substitution" | "insertion" | "deletion"
  reference?: string
  hypothesis?: string
}

export type TajweedPaceInsight = {
  wordsPerMinute: number
  rating: "slow" | "balanced" | "fast"
  comment: string
}

export type TajweedMistakeSummary = {
  rule: string
  severity: "low" | "medium" | "high"
  description: string
}
