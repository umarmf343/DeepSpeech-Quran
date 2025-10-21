export type WerResult = {
  wer: number
  cer: number
}

function tokenize(text: string): string[] {
  return text
    .trim()
    .replace(/[\u0640]/g, "")
    .replace(/[\p{P}\p{S}]+/gu, " ")
    .split(/\s+/)
    .filter(Boolean)
}

export function calculateWordErrorRate(reference: string, hypothesis: string): number {
  const refTokens = tokenize(reference)
  const hypTokens = tokenize(hypothesis)

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
