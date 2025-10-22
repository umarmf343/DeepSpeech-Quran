import {
  alignWordSequences,
  tokenizeArabicWords,
  type AlignmentOperation as InternalAlignmentOperation,
} from "@/lib/deepspeech/metrics"
import type {
  TajweedAlignmentOperation,
  TajweedPaceInsight,
  TajweedMistakeSummary,
} from "@/types/deepspeech-analysis"

const severityRank: Record<TajweedMistakeSummary["severity"], number> = {
  high: 0,
  medium: 1,
  low: 2,
}

const formatWordList = (words: (string | undefined)[], limit = 3) => {
  return words
    .filter((word): word is string => Boolean(word))
    .slice(0, limit)
    .map((word) => `«${word}»`)
    .join("، ")
}

type GenerateTajweedFeedbackOptions = {
  referenceText: string
  recognizedText: string
  durationSeconds: number
  metrics: { wer: number; cer: number; loss: number }
}

type TajweedFeedbackResult = {
  alignment: TajweedAlignmentOperation[]
  mistakes: TajweedMistakeSummary[]
  recommendations: string[]
  pace: TajweedPaceInsight | null
}

const normalizeAlignment = (
  operations: InternalAlignmentOperation[],
): TajweedAlignmentOperation[] => {
  return operations.map((operation) => ({ ...operation }))
}

const addMistake = (
  list: TajweedMistakeSummary[],
  entry: TajweedMistakeSummary,
): void => {
  if (!list.some((item) => item.rule === entry.rule)) {
    list.push(entry)
  }
}

export function generateTajweedFeedback({
  referenceText,
  recognizedText,
  durationSeconds,
  metrics,
}: GenerateTajweedFeedbackOptions): TajweedFeedbackResult {
  const referenceTokens = tokenizeArabicWords(referenceText)
  const hypothesisTokens = tokenizeArabicWords(recognizedText)
  const alignment = normalizeAlignment(alignWordSequences(referenceTokens, hypothesisTokens))

  const mistakes: TajweedMistakeSummary[] = []
  const recommendations = new Set<string>([
    "Play back the recording while following the color-coded Mushaf to observe each tajweed cue.",
  ])

  const substitutionOps = alignment.filter((operation) => operation.type === "substitution")
  if (substitutionOps.length > 0) {
    const examples = formatWordList(
      substitutionOps.map((operation) => `${operation.reference ?? ""} → ${operation.hypothesis ?? ""}`),
    )
    addMistake(mistakes, {
      rule: "Makharij Precision",
      severity: substitutionOps.length >= 3 ? "high" : "medium",
      description:
        examples.length > 0
          ? `DeepSpeech detected articulation drift on ${examples}. Focus on articulation points and maintain consistent ghunnah.`
          : "DeepSpeech detected articulation drift on multiple words. Focus on articulation points and maintain consistent ghunnah.",
    })
    recommendations.add(
      "Slow down around the substituted words and exaggerate the makharij until the recognition aligns with the Mushaf.",
    )
  }

  const deletionOps = alignment.filter((operation) => operation.type === "deletion")
  if (deletionOps.length > 0) {
    const droppedWords = formatWordList(deletionOps.map((operation) => operation.reference))
    addMistake(mistakes, {
      rule: "Madd Completion",
      severity: deletionOps.length >= 2 ? "high" : "medium",
      description:
        droppedWords.length > 0
          ? `The model could not hear ${droppedWords}. Sustain elongations and nasalisation through the full measure.`
          : "The model could not hear several expected syllables. Sustain elongations and nasalisation through the full measure.",
    })
    recommendations.add("Hold each madd letter for two counts and keep your airflow steady to avoid truncating words.")
  }

  const insertionOps = alignment.filter((operation) => operation.type === "insertion")
  if (insertionOps.length > 0) {
    const extraWords = formatWordList(insertionOps.map((operation) => operation.hypothesis))
    addMistake(mistakes, {
      rule: "Rhythmic Balance",
      severity: insertionOps.length >= 2 ? "medium" : "low",
      description:
        extraWords.length > 0
          ? `Extra sounds such as ${extraWords} appeared in the transcript. Keep pauses purposeful and avoid echoing letters.`
          : "Extra sounds appeared in the transcript. Keep pauses purposeful and avoid echoing letters.",
    })
    recommendations.add("Use a steady metronome-style count on each ayah to prevent unintended repetitions.")
  }

  if (metrics.wer >= 0.25) {
    addMistake(mistakes, {
      rule: "Overall Clarity",
      severity: "high",
      description: `WER ${metrics.wer.toFixed(2)} indicates numerous mismatches. Revisit the ayah slowly with the tajweed legend visible.`,
    })
  } else if (metrics.wer >= 0.15) {
    addMistake(mistakes, {
      rule: "Consistency Check",
      severity: "medium",
      description: `WER ${metrics.wer.toFixed(2)} shows some drift. Focus on steady breath control and precise exits from qalqalah letters.`,
    })
  }

  let pace: TajweedPaceInsight | null = null
  if (durationSeconds > 0 && hypothesisTokens.length > 0) {
    const wordsPerMinute = Number(((hypothesisTokens.length / durationSeconds) * 60).toFixed(1))
    let rating: TajweedPaceInsight["rating"] = "balanced"
    let comment = "Measured pacing suitable for tajweed drills."

    if (wordsPerMinute > 150) {
      rating = "fast"
      comment = `Average pace ${wordsPerMinute} wpm. Ease into each madd and allow brief pauses at natural waqf points.`
      addMistake(mistakes, {
        rule: "Rhythm Control",
        severity: "medium",
        description: `Your pace averaged ${wordsPerMinute} words per minute. Slow slightly to let elongations and ghunnah resonate.`,
      })
      recommendations.add("Breathe between phrases and let elongations settle before moving to the next word.")
    } else if (wordsPerMinute < 60) {
      rating = "slow"
      comment = `Average pace ${wordsPerMinute} wpm. Maintain breath support so elongations stay rich without breaking flow.`
      recommendations.add("Gradually increase tempo once articulation feels secure to build stamina for longer recitations.")
    }

    pace = { wordsPerMinute, rating, comment }
  }

  if (mistakes.length === 0) {
    addMistake(mistakes, {
      rule: "Consistent Tajweed Control",
      severity: "low",
      description: "DeepSpeech aligned every word with the Mushaf reference. Keep reinforcing this measured articulation in future sessions.",
    })
    recommendations.add("Document this attempt as a reference recording for future comparisons.")
  }

  const sortedMistakes = mistakes.sort(
    (a, b) => severityRank[a.severity] - severityRank[b.severity],
  )

  return {
    alignment,
    mistakes: sortedMistakes,
    recommendations: Array.from(recommendations),
    pace,
  }
}
