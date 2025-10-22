export type WerResult = {
  wer: number
  cer: number
}

export type AlignmentOperation = {
  type: "match" | "substitution" | "insertion" | "deletion"
  reference?: string
  hypothesis?: string
}

export function tokenizeArabicWords(text: string): string[] {
  return text
    .trim()
    .replace(/[\u0640]/g, "")
    .replace(/[\p{P}\p{S}]+/gu, " ")
    .split(/\s+/)
    .filter(Boolean)
}

export function calculateWordErrorRate(reference: string, hypothesis: string): number {
  const refTokens = tokenizeArabicWords(reference)
  const hypTokens = tokenizeArabicWords(hypothesis)

  const rLen = refTokens.length
  const hLen = hypTokens.length

  const dp: number[][] = Array.from({ length: rLen + 1 }, () => Array(hLen + 1).fill(0))

  for (let i = 0; i <= rLen; i += 1) {
    dp[i][0] = i
  }
  for (let j = 0; j <= hLen; j += 1) {
    dp[0][j] = j
  }

  for (let i = 1; i <= rLen; i += 1) {
    for (let j = 1; j <= hLen; j += 1) {
      const cost = refTokens[i - 1] === hypTokens[j - 1] ? 0 : 1
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      )
    }
  }

  return rLen === 0 ? 0 : dp[rLen][hLen] / rLen
}

export function calculateCharacterErrorRate(reference: string, hypothesis: string): number {
  const refChars = Array.from(reference)
  const hypChars = Array.from(hypothesis)

  const rLen = refChars.length
  const hLen = hypChars.length

  const dp: number[][] = Array.from({ length: rLen + 1 }, () => Array(hLen + 1).fill(0))

  for (let i = 0; i <= rLen; i += 1) {
    dp[i][0] = i
  }
  for (let j = 0; j <= hLen; j += 1) {
    dp[0][j] = j
  }

  for (let i = 1; i <= rLen; i += 1) {
    for (let j = 1; j <= hLen; j += 1) {
      const cost = refChars[i - 1] === hypChars[j - 1] ? 0 : 1
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      )
    }
  }

  return rLen === 0 ? 0 : dp[rLen][hLen] / rLen
}

export function calculateWerMetrics(reference: string, hypothesis: string): WerResult {
  return {
    wer: Number(calculateWordErrorRate(reference, hypothesis).toFixed(4)),
    cer: Number(calculateCharacterErrorRate(reference, hypothesis).toFixed(4)),
  }
}

export function alignWordSequences(
  referenceTokens: string[],
  hypothesisTokens: string[],
): AlignmentOperation[] {
  const rLen = referenceTokens.length
  const hLen = hypothesisTokens.length

  if (rLen === 0 && hLen === 0) {
    return []
  }

  const dp: number[][] = Array.from({ length: rLen + 1 }, () => Array(hLen + 1).fill(0))

  for (let i = 0; i <= rLen; i += 1) {
    dp[i][0] = i
  }
  for (let j = 0; j <= hLen; j += 1) {
    dp[0][j] = j
  }

  for (let i = 1; i <= rLen; i += 1) {
    for (let j = 1; j <= hLen; j += 1) {
      const cost = referenceTokens[i - 1] === hypothesisTokens[j - 1] ? 0 : 1
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      )
    }
  }

  const operations: AlignmentOperation[] = []

  let i = rLen
  let j = hLen

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const cost = referenceTokens[i - 1] === hypothesisTokens[j - 1] ? 0 : 1
      if (dp[i][j] === dp[i - 1][j - 1] + cost) {
        operations.push({
          type: cost === 0 ? "match" : "substitution",
          reference: referenceTokens[i - 1],
          hypothesis: hypothesisTokens[j - 1],
        })
        i -= 1
        j -= 1
        continue
      }
    }

    if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      operations.push({
        type: "deletion",
        reference: referenceTokens[i - 1],
      })
      i -= 1
      continue
    }

    if (j > 0 && dp[i][j] === dp[i][j - 1] + 1) {
      operations.push({
        type: "insertion",
        hypothesis: hypothesisTokens[j - 1],
      })
      j -= 1
      continue
    }

    break
  }

  return operations.reverse()
}
