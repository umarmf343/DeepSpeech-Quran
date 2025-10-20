import fs from "node:fs"
import path from "node:path"

import { Model } from "deepspeech"
import { decode } from "node-wav"

export type DeepSpeechEngineConfig = {
  modelPath: string
  scorerPath?: string | null
  hotWords?: Array<{ phrase: string; boost: number }>
}

let cachedModel: Model | null = null
let cachedConfigKey: string | null = null
let loadingPromise: Promise<Model> | null = null

export function getConfiguredModelPaths(): DeepSpeechEngineConfig | null {
  const modelPath = process.env.DEEPSPEECH_MODEL_PATH?.trim()
  if (!modelPath) {
    return null
  }

  const scorerPath = process.env.DEEPSPEECH_SCORER_PATH?.trim()
  const hotWordsRaw = process.env.DEEPSPEECH_HOTWORDS?.trim()
  const hotWords = hotWordsRaw
    ? hotWordsRaw
        .split(",")
        .map((chunk) => chunk.trim())
        .filter(Boolean)
        .map((entry) => {
          const [phrase, boostRaw] = entry.split(":")
          const boost = Number.parseFloat(boostRaw ?? "0")
          return { phrase, boost: Number.isFinite(boost) ? boost : 0 }
        })
        .filter(({ phrase }) => phrase.length > 0)
    : undefined

  return {
    modelPath,
    scorerPath: scorerPath && scorerPath.length > 0 ? scorerPath : null,
    hotWords,
  }
}

async function ensureModelLoaded(config: DeepSpeechEngineConfig): Promise<Model> {
  const configKey = JSON.stringify({
    modelPath: path.resolve(config.modelPath),
    scorerPath: config.scorerPath ? path.resolve(config.scorerPath) : null,
    hotWords: config.hotWords?.map(({ phrase, boost }) => ({ phrase, boost })),
  })

  if (cachedModel && cachedConfigKey === configKey) {
    return cachedModel
  }

  if (loadingPromise && cachedConfigKey === configKey) {
    return loadingPromise
  }

  const promise = (async () => {
    const resolvedModelPath = path.resolve(config.modelPath)
    if (!fs.existsSync(resolvedModelPath)) {
      throw new Error(`DeepSpeech model not found at ${resolvedModelPath}`)
    }

    const model = new Model(resolvedModelPath)

    if (config.scorerPath) {
      const resolvedScorerPath = path.resolve(config.scorerPath)
      if (!fs.existsSync(resolvedScorerPath)) {
        console.warn(`DeepSpeech scorer file declared but not found at ${resolvedScorerPath}`)
      } else {
        model.enableExternalScorer(resolvedScorerPath)
      }
    }

    if (Array.isArray(config.hotWords)) {
      for (const { phrase, boost } of config.hotWords) {
        try {
          model.addHotWord(phrase, boost)
        } catch (error) {
          console.warn(`Failed to add DeepSpeech hot word "${phrase}"`, error)
        }
      }
    }

    cachedModel?.freeModel()
    cachedModel = model
    cachedConfigKey = configKey
    loadingPromise = null
    return model
  })()

  loadingPromise = promise
  cachedConfigKey = configKey

  return promise
}

export interface DeepSpeechTranscriptionOptions {
  config?: DeepSpeechEngineConfig
}

function resample(
  channelData: Float32Array,
  sourceRate: number,
  targetRate: number,
): Float32Array {
  if (sourceRate === targetRate) {
    return channelData
  }

  const ratio = targetRate / sourceRate
  const newLength = Math.round(channelData.length * ratio)
  const result = new Float32Array(newLength)

  for (let index = 0; index < newLength; index += 1) {
    const sourceIndex = index / ratio
    const lower = Math.floor(sourceIndex)
    const upper = Math.min(lower + 1, channelData.length - 1)
    const weight = sourceIndex - lower
    const sample = channelData[lower] * (1 - weight) + channelData[upper] * weight
    result[index] = sample
  }

  return result
}

function floatToInt16(float32: Float32Array): Int16Array {
  const buffer = new Int16Array(float32.length)
  for (let index = 0; index < float32.length; index += 1) {
    const value = Math.max(-1, Math.min(1, float32[index]))
    buffer[index] = value < 0 ? value * 0x8000 : value * 0x7fff
  }
  return buffer
}

export async function transcribeWithDeepSpeech(
  file: File | Blob,
  options: DeepSpeechTranscriptionOptions = {},
): Promise<{ transcript: string; modelSampleRate: number }> {
  const config = options.config ?? getConfiguredModelPaths()
  if (!config) {
    throw new Error("DeepSpeech model path not configured")
  }

  const [arrayBuffer, model] = await Promise.all([
    file.arrayBuffer(),
    ensureModelLoaded(config),
  ])

  const decoded = decode(Buffer.from(arrayBuffer))
  if (!decoded.sampleRate || !Array.isArray(decoded.channelData) || decoded.channelData.length === 0) {
    throw new Error("Unable to decode WAV audio for DeepSpeech")
  }

  const monoChannel = decoded.channelData[0]
  const targetRate = model.sampleRate()
  const processed = resample(monoChannel, decoded.sampleRate, targetRate)
  const int16 = floatToInt16(processed)
  const transcript = model.stt(int16)

  return { transcript, modelSampleRate: targetRate }
}

export function releaseDeepSpeechModel() {
  if (cachedModel) {
    try {
      cachedModel.freeModel()
    } catch (error) {
      console.warn("Failed to release DeepSpeech model", error)
    }
  }
  cachedModel = null
  cachedConfigKey = null
  loadingPromise = null
}
