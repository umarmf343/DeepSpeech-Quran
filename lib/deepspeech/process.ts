import { spawn } from "node:child_process"
import { once } from "node:events"

export type SpawnAndCaptureOptions = {
  cwd?: string
  env?: NodeJS.ProcessEnv
  shell?: boolean
}

export type SpawnAndCaptureResult = {
  command: string
  args: string[]
  code: number
  stdout: string
  stderr: string
}

export async function spawnAndCapture(
  command: string,
  args: string[],
  { cwd, env, shell }: SpawnAndCaptureOptions = {},
): Promise<SpawnAndCaptureResult> {
  const child = spawn(command, args, {
    cwd,
    env: env ?? process.env,
    shell: shell ?? false,
    stdio: ["ignore", "pipe", "pipe"],
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

  return {
    command,
    args,
    code: code ?? -1,
    stdout: stdoutChunks.join("")
      .split(/\r?\n/)
      .map((line) => line.trimEnd())
      .join("\n"),
    stderr: stderrChunks.join("")
      .split(/\r?\n/)
      .map((line) => line.trimEnd())
      .join("\n"),
  }
}
