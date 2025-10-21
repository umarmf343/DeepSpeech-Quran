import { promises as fs } from "node:fs"
import path from "node:path"
import { resolveDeepSpeechConfig } from "./config"
import { listTaskclusterWorkflows } from "./taskcluster"

export type TrainingDocumentation = {
  quranReadme: string
  shellHelpers: Array<{ name: string; description: string }>
  taskcluster: ReturnType<typeof listTaskclusterWorkflows>
}

async function readFileIfExists(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, "utf8")
  } catch (error) {
    console.warn(`Unable to load documentation at ${filePath}`, error)
    return "Documentation not available."
  }
}

export async function getTrainingDocumentation(): Promise<TrainingDocumentation> {
  const config = resolveDeepSpeechConfig()
  const quranReadmePath = path.join(config.projectRoot, "DeepSpeech", "data", "quran", "README.md")

  return {
    quranReadme: await readFileIfExists(quranReadmePath),
    shellHelpers: [
      {
        name: "bin/run-quran.sh",
        description:
          "Launches end-to-end DeepSpeech training with the curated Qur'an corpus bundled under DeepSpeech/data/quran.",
      },
      {
        name: "bin/run-quran-tusers.sh",
        description:
          "Runs the extended training recipe that blends imam recitations and crowd-sourced Tarteel submissions.",
      },
      {
        name: "bin/run-ldc93s1.sh",
        description:
          "Provides the canonical DeepSpeech baseline run against the LDC93S1 dataset, useful for sanity checks and benchmarking.",
      },
    ],
    taskcluster: listTaskclusterWorkflows(),
  }
}
