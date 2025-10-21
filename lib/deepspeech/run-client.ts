import { spawn } from "node:child_process"
import { once } from "node:events"
import { resolveDeepSpeechConfig } from "./config"

export type DeepSpeechTranscriptWord = {
  word: string
  start_time: number
  duration: number
}

export type DeepSpeechTranscript = {
  confidence: number
  words: DeepSpeechTranscriptWord[]
}

export type DeepSpeechJsonResult = {
  transcripts: DeepSpeechTranscript[]
}

export type RunClientOptions = {
  audioPath: string
  modelPath?: string | null
  scorerPath?: string | null
}

export async function runDeepSpeechClient({
  audioPath,
  modelPath,
  scorerPath,
}: RunClientOptions): Promise<DeepSpeechJsonResult> {
  const config = resolveDeepSpeechConfig()

  const resolvedModelPath = modelPath ?? config.modelPath
  if (!resolvedModelPath) {
    throw new Error("DeepSpeech model path is not configured. Set DEEPSPEECH_MODEL_PATH in your environment.")
  }

  const args = [config.clientScriptPath, "--model", resolvedModelPath, "--audio", audioPath, "--json"]

  const resolvedScorer = scorerPath ?? config.scorerPath
  if (resolvedScorer) {
    args.push("--scorer", resolvedScorer)
  }

  if (config.candidateTranscripts) {
    args.push("--candidate_transcripts", String(config.candidateTranscripts))
  }

  const pythonArgs = args

  const child = spawn(config.pythonExecutable, pythonArgs, {
    stdio: ["ignore", "pipe", "pipe"],
    env: process.env,
  })

  const stdoutChunks: string[] = []
  const stderrChunks: string[] = []

  if (child.stdout) {
    child.stdout.setEncoding("utf8")
    child.stdout.on("data", (chunk) => stdoutChunks.push(chunk))
  }

  if (child.stderr) {
    child.stderr.setEncoding("utf8")
    child.stderr.on("data", (chunk) => stderrChunks.push(chunk))
  }

  const [code] = (await once(child, "close")) as [number | null]

  if (code !== 0) {
    throw new Error(`DeepSpeech client exited with code ${code}: ${stderrChunks.join("")}`)
  }

  const rawOutput = stdoutChunks.join("").trim()
  if (!rawOutput) {
    throw new Error("DeepSpeech client did not return any output")
  }

  try {
    return JSON.parse(rawOutput) as DeepSpeechJsonResult
  } catch (error) {
    throw new Error(`Unable to parse DeepSpeech JSON output: ${(error as Error).message}. Output was: ${rawOutput}`)
  }
}
