import { constants } from "node:fs"
import { access } from "node:fs/promises"
import path from "node:path"
import { resolveDeepSpeechConfig } from "./config"
import { buildTrainingDockerImage } from "./docker"
import { spawnAndCapture, type SpawnAndCaptureResult } from "./process"

export type TrainingProfile = "quran" | "quran-tusers" | "custom"

const profileToScript: Record<Exclude<TrainingProfile, "custom">, string> = {
  quran: "bin/run-quran.sh",
  "quran-tusers": "bin/run-quran-tusers.sh",
}

export type RunDeepSpeechTrainingOptions = {
  profile?: TrainingProfile
  extraArgs?: string[]
  env?: NodeJS.ProcessEnv
  useDocker?: boolean
  dockerTag?: string
  dockerfilePath?: string
  customEntryPoint?: string | null
  dockerBuildOnly?: boolean
}

export type RunDeepSpeechTrainingResult = SpawnAndCaptureResult & {
  profile: TrainingProfile
  entryPoint: string
  usedDocker: boolean
  dockerImageTag?: string
}

async function ensureExecutable(filePath: string) {
  await access(filePath, constants.X_OK)
}

export async function runDeepSpeechTraining(
  options: RunDeepSpeechTrainingOptions = {},
): Promise<RunDeepSpeechTrainingResult> {
  const config = resolveDeepSpeechConfig()
  const profile: TrainingProfile = options.profile ?? "quran"
  const extraArgs = options.extraArgs ?? []

  if (options.useDocker) {
    const build = await buildTrainingDockerImage({
      tag: options.dockerTag,
      dockerfilePath: options.dockerfilePath,
    })

    if (options.dockerBuildOnly ?? true) {
      return {
        profile,
        entryPoint: build.result.command,
        usedDocker: true,
        dockerImageTag: build.imageTag,
        ...build.result,
      }
    }

    let dockerCommand: string
    if (profile === "custom") {
      const entry = options.customEntryPoint ?? "DeepSpeech.py"
      const commandParts = entry.endsWith(".py")
        ? ["python3", entry, ...extraArgs]
        : [entry, ...extraArgs]
      dockerCommand = commandParts.join(" ")
    } else {
      const script = profileToScript[profile]
      dockerCommand = [`./${script}`, ...extraArgs].join(" ")
    }

    const dockerRunArgs = ["run", "--rm", build.imageTag, "bash", "-lc", dockerCommand]
    const runResult = await spawnAndCapture("docker", dockerRunArgs)
    return {
      profile,
      entryPoint: "docker",
      usedDocker: true,
      dockerImageTag: build.imageTag,
      ...runResult,
    }
  }

  let entryPoint: string
  let args: string[]

  if (profile === "custom") {
    const entry = options.customEntryPoint ?? path.join(config.projectRoot, "DeepSpeech.py")
    entryPoint = entry
    if (entry.endsWith(".py")) {
      args = [entry, ...extraArgs]
      const result = await spawnAndCapture(config.pythonExecutable, args, {
        cwd: config.projectRoot,
        env: options.env ?? process.env,
      })
      return {
        profile,
        entryPoint,
        usedDocker: false,
        ...result,
      }
    }

    const absoluteEntry = path.isAbsolute(entry) ? entry : path.join(config.projectRoot, entry)
    await ensureExecutable(absoluteEntry)
    const result = await spawnAndCapture(absoluteEntry, extraArgs, {
      cwd: config.projectRoot,
      env: options.env ?? process.env,
    })
    return {
      profile,
      entryPoint: absoluteEntry,
      usedDocker: false,
      ...result,
    }
  }

  const scriptRelative = profileToScript[profile]
  const scriptPath = path.join(config.projectRoot, "DeepSpeech", scriptRelative)
  await ensureExecutable(scriptPath)

  const result = await spawnAndCapture(scriptPath, extraArgs, {
    cwd: path.join(config.projectRoot, "DeepSpeech"),
    env: options.env ?? process.env,
  })

  return {
    profile,
    entryPoint: scriptPath,
    usedDocker: false,
    ...result,
  }
}
