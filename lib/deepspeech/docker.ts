import { promises as fs } from "node:fs"
import path from "node:path"
import { resolveDeepSpeechConfig } from "./config"
import { spawnAndCapture } from "./process"

export type PrepareTrainingDockerfileOptions = {
  outputPath?: string
  repositoryUrl?: string
  commitSha?: string
}

export type PreparedDockerfile = {
  dockerfilePath: string
  repositoryUrl: string
  commitSha: string
}

async function resolveGitMetadata(directory: string): Promise<{
  repositoryUrl: string | null
  commitSha: string | null
}> {
  try {
    const remote = await spawnAndCapture("git", ["config", "--get", "remote.origin.url"], { cwd: directory })
    const sha = await spawnAndCapture("git", ["rev-parse", "HEAD"], { cwd: directory })
    return {
      repositoryUrl: remote.stdout.trim() || null,
      commitSha: sha.stdout.trim() || null,
    }
  } catch (error) {
    console.warn("Unable to resolve git metadata for DeepSpeech", error)
    return { repositoryUrl: null, commitSha: null }
  }
}

export async function prepareTrainingDockerfile(
  options: PrepareTrainingDockerfileOptions = {},
): Promise<PreparedDockerfile> {
  const config = resolveDeepSpeechConfig()
  const deepSpeechRoot = path.join(config.projectRoot, "DeepSpeech")
  const templatePath = path.join(deepSpeechRoot, "Dockerfile.train.tmpl")

  const template = await fs.readFile(templatePath, "utf8")

  const gitInfo = await resolveGitMetadata(deepSpeechRoot)

  const repositoryUrl = options.repositoryUrl ?? gitInfo.repositoryUrl ?? "https://github.com/mozilla/DeepSpeech.git"
  const commitSha = options.commitSha ?? gitInfo.commitSha ?? "main"

  const hydrated = template
    .replace(/#DEEPSPEECH_REPO#/g, repositoryUrl)
    .replace(/#DEEPSPEECH_SHA#/g, commitSha)

  const dockerfilePath = options.outputPath ?? path.join(deepSpeechRoot, "Dockerfile.train.generated")
  await fs.writeFile(dockerfilePath, hydrated, "utf8")

  return {
    dockerfilePath,
    repositoryUrl,
    commitSha,
  }
}

export type BuildTrainingDockerImageOptions = {
  tag?: string
  dockerfilePath?: string
  buildContext?: string
}

export async function buildTrainingDockerImage(
  options: BuildTrainingDockerImageOptions = {},
): Promise<{ imageTag: string; result: Awaited<ReturnType<typeof spawnAndCapture>> }> {
  const config = resolveDeepSpeechConfig()
  const prepared = await prepareTrainingDockerfile({ outputPath: options.dockerfilePath })
  const tag = options.tag ?? `deepspeech-training:${prepared.commitSha.slice(0, 7)}`
  const buildContext = options.buildContext ?? config.projectRoot

  const buildResult = await spawnAndCapture("docker", [
    "build",
    "-f",
    prepared.dockerfilePath,
    "-t",
    tag,
    buildContext,
  ])

  return {
    imageTag: tag,
    result: buildResult,
  }
}
