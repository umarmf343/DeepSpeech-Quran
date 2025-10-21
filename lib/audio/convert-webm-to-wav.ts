import ffmpegStatic from "ffmpeg-static"
import { spawn } from "node:child_process"
import { mkdir } from "node:fs/promises"
import { dirname, resolve } from "node:path"

const ffmpegPath = ffmpegStatic ?? "ffmpeg"

export type ConvertOptions = {
  inputPath: string
  outputPath: string
  sampleRate?: number
  channels?: number
}

export async function convertWebmToWav({
  inputPath,
  outputPath,
  sampleRate = 16000,
  channels = 1,
}: ConvertOptions): Promise<void> {
  const resolvedOutput = resolve(outputPath)
  const parentDir = dirname(resolvedOutput)
  await mkdir(parentDir, { recursive: true })

  await new Promise<void>((resolvePromise, rejectPromise) => {
    const ffmpegArgs = [
      "-i",
      inputPath,
      "-vn",
      "-ac",
      channels.toString(),
      "-ar",
      sampleRate.toString(),
      "-f",
      "wav",
      resolvedOutput,
    ]

    const process = spawn(ffmpegPath, ffmpegArgs)

    process.on("error", (error) => rejectPromise(error))

    process.on("close", (code, signal) => {
      if (code === 0) {
        resolvePromise()
      } else {
        const reason =
          typeof code === "number"
            ? `exit code ${code}`
            : signal
              ? `signal ${signal}`
              : "an unknown error"
        rejectPromise(new Error(`ffmpeg failed with ${reason}`))
      }
    })
  })
}
