import path from "node:path"
import { resolveDeepSpeechConfig } from "./config"
import { spawnAndCapture, type SpawnAndCaptureResult } from "./process"

export const taskclusterWorkflows = {
  "train-tests": {
    script: "tc-train-tests.sh",
    description:
      "Runs the Taskcluster training integration test harness, verifying DeepSpeech training against baseline corpora.",
    defaultArgs: ["3.7.6:m", "16k", "--pypi"],
  },
  "transcribe-tests": {
    script: "tc-transcribe-tests.sh",
    description: "Exercises the inference/transcription Taskcluster workflow on reference audio to validate checkpoints.",
    defaultArgs: ["3.6.10:m", "16k"],
  },
  "generate-scorer": {
    script: "tc-scorer-tests.sh",
    description: "Builds a KenLM scorer using the Taskcluster helper for regression coverage.",
    defaultArgs: [],
  },
} as const

export type TaskclusterWorkflowKey = keyof typeof taskclusterWorkflows

export function listTaskclusterWorkflows(): Array<{
  key: TaskclusterWorkflowKey
  script: string
  description: string
  defaultArgs: string[]
}> {
  return Object.entries(taskclusterWorkflows).map(([key, value]) => ({
    key: key as TaskclusterWorkflowKey,
    script: value.script,
    description: value.description,
    defaultArgs: value.defaultArgs,
  }))
}

export type RunTaskclusterWorkflowOptions = {
  args?: string[]
  env?: NodeJS.ProcessEnv
}

export type RunTaskclusterWorkflowResult = SpawnAndCaptureResult & {
  workflow: TaskclusterWorkflowKey
  scriptPath: string
}

export async function runTaskclusterWorkflow(
  workflow: TaskclusterWorkflowKey,
  options: RunTaskclusterWorkflowOptions = {},
): Promise<RunTaskclusterWorkflowResult> {
  const config = resolveDeepSpeechConfig()
  const workflowConfig = taskclusterWorkflows[workflow]
  const taskclusterRoot = path.join(config.projectRoot, "DeepSpeech", "taskcluster")
  const scriptPath = path.join(taskclusterRoot, workflowConfig.script)

  const args = options.args?.length ? options.args : workflowConfig.defaultArgs

  const result = await spawnAndCapture("bash", [scriptPath, ...args], {
    cwd: taskclusterRoot,
    env: options.env ?? process.env,
  })

  return {
    workflow,
    scriptPath,
    ...result,
  }
}
