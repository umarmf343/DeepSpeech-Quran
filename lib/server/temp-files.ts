import { mkdir, writeFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { randomUUID } from "node:crypto"

export type TempFile = {
  webmPath: string
  wavPath: string
  dispose: () => Promise<void>
}

export async function createAudioTempFiles(webmBuffer: Buffer): Promise<TempFile> {
  const baseDir = join(tmpdir(), "deepspeech-quran")
  await mkdir(baseDir, { recursive: true })

  const id = randomUUID()
  const webmPath = join(baseDir, `${id}.webm`)
  const wavPath = join(baseDir, `${id}.wav`)

  await writeFile(webmPath, webmBuffer)

  return {
    webmPath,
    wavPath,
    dispose: async () => {
      await Promise.allSettled([
        rm(webmPath, { force: true }),
        rm(wavPath, { force: true }),
      ])
    },
  }
}
