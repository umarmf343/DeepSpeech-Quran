import ffmpeg from "fluent-ffmpeg"
import ffmpegStatic from "ffmpeg-static"
import { mkdir } from "node:fs/promises"
import { dirname, resolve } from "node:path"

if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic)
}

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
    ffmpeg(inputPath)
      .noVideo()
      .audioChannels(channels)
      .audioFrequency(sampleRate)
      .format("wav")
      .on("end", () => resolvePromise())
      .on("error", (error) => rejectPromise(error))
      .save(resolvedOutput)
  })
}
