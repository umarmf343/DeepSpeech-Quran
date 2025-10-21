import { NextResponse } from "next/server"
import { runDeepSpeechTraining } from "@/lib/deepspeech/training"
import { getTrainingDocumentation } from "@/lib/deepspeech/training-docs"

export const runtime = "nodejs"

export async function GET() {
  const documentation = await getTrainingDocumentation()
  return NextResponse.json(documentation)
}

export async function POST(request: Request) {
  const payload = await request.json()

  let extraArgs: string[] | undefined
  if (Array.isArray(payload.extraArgs)) {
    extraArgs = payload.extraArgs.map((value: unknown) => String(value))
  } else if (typeof payload.extraArgs === "string" && payload.extraArgs.trim()) {
    extraArgs = payload.extraArgs
      .split(/\s+/)
      .map((value: string) => value.trim())
      .filter(Boolean)
  }

  try {
    const result = await runDeepSpeechTraining({
      profile: payload.profile,
      extraArgs,
      env: payload.env,
      useDocker: payload.useDocker,
      dockerTag: payload.dockerTag,
      dockerfilePath: payload.dockerfilePath,
      customEntryPoint: payload.customEntryPoint,
      dockerBuildOnly: payload.dockerBuildOnly,
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
