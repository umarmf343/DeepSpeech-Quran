import { NextResponse } from "next/server"
import { listTaskclusterWorkflows, runTaskclusterWorkflow } from "@/lib/deepspeech/taskcluster"

export const runtime = "nodejs"

export async function GET() {
  return NextResponse.json({ workflows: listTaskclusterWorkflows() })
}

export async function POST(request: Request) {
  const payload = await request.json()
  const workflow = payload.workflow
  const workflows = listTaskclusterWorkflows()

  if (!workflow || !workflows.some((entry) => entry.key === workflow)) {
    return NextResponse.json(
      { error: `Unknown Taskcluster workflow: ${workflow}` },
      { status: 400 },
    )
  }

  let args: string[] | undefined
  if (Array.isArray(payload.args)) {
    args = payload.args.map((value: unknown) => String(value))
  } else if (typeof payload.args === "string" && payload.args.trim()) {
    args = payload.args
      .split(/\s+/)
      .map((value: string) => value.trim())
      .filter(Boolean)
  }

  try {
    const result = await runTaskclusterWorkflow(workflow, {
      args,
      env: payload.env,
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    )
  }
}
