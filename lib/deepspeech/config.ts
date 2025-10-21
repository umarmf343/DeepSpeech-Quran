export type DeepSpeechConfig = {
  pythonExecutable: string
  clientScriptPath: string
  modelPath: string | null
  scorerPath: string | null
  candidateTranscripts: number
}

export function resolveDeepSpeechConfig(): DeepSpeechConfig {
  const projectRoot = process.cwd()
  const pythonExecutable = process.env.DEEPSPEECH_PYTHON ?? process.env.PYTHON ?? "python3"
  const clientScriptPath = process.env.DEEPSPEECH_CLIENT_PATH ?? `${projectRoot}/DeepSpeech/native_client/python/client.py`
  const modelPath = process.env.DEEPSPEECH_MODEL_PATH ?? null
  const scorerPath = process.env.DEEPSPEECH_SCORER_PATH ?? null
  const candidateTranscripts = Number.parseInt(process.env.DEEPSPEECH_CANDIDATES ?? "3", 10)

  return {
    pythonExecutable,
    clientScriptPath,
    modelPath,
    scorerPath,
    candidateTranscripts: Number.isNaN(candidateTranscripts) ? 3 : candidateTranscripts,
  }
}
