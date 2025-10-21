"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

type WorkflowSummary = {
  key: string
  script: string
  description: string
  defaultArgs: string[]
}

type TrainingRunnerProps = {
  workflows: WorkflowSummary[]
}

const trainingProfiles = [
  {
    value: "quran",
    label: "Qur'an Baseline (bin/run-quran.sh)",
  },
  {
    value: "quran-tusers",
    label: "Imams + Tarteel Users (bin/run-quran-tusers.sh)",
  },
  {
    value: "custom",
    label: "Custom entrypoint (DeepSpeech.py or another script)",
  },
]

function stringifyResult(result: unknown) {
  if (!result) {
    return "No output yet."
  }

  if (typeof result === "string") {
    return result
  }

  try {
    return JSON.stringify(result, null, 2)
  } catch (error) {
    return String(error)
  }
}

export function TrainingRunner({ workflows }: TrainingRunnerProps) {
  const [profile, setProfile] = useState<string>(trainingProfiles[0]?.value ?? "quran")
  const [extraArgs, setExtraArgs] = useState<string>("")
  const [customEntryPoint, setCustomEntryPoint] = useState<string>("")
  const [useDocker, setUseDocker] = useState(false)
  const [dockerBuildOnly, setDockerBuildOnly] = useState(true)
  const [dockerTag, setDockerTag] = useState<string>("")
  const [trainingResult, setTrainingResult] = useState<unknown>(null)
  const [taskclusterResult, setTaskclusterResult] = useState<unknown>(null)
  const [taskclusterWorkflow, setTaskclusterWorkflow] = useState<string>(workflows[0]?.key ?? "train-tests")
  const [taskclusterArgs, setTaskclusterArgs] = useState<string>("")
  const [isTraining, setIsTraining] = useState(false)
  const [isRunningWorkflow, setIsRunningWorkflow] = useState(false)

  const selectedWorkflow = useMemo(() => workflows.find((entry) => entry.key === taskclusterWorkflow), [
    workflows,
    taskclusterWorkflow,
  ])

  async function runTraining() {
    setIsTraining(true)
    setTrainingResult(null)
    try {
      const payload: Record<string, unknown> = {
        profile,
        useDocker,
      }

      if (extraArgs.trim()) {
        payload.extraArgs = extraArgs.split(/\s+/).filter(Boolean)
      }

      if (profile === "custom" && customEntryPoint.trim()) {
        payload.customEntryPoint = customEntryPoint.trim()
      }

      if (useDocker) {
        payload.dockerBuildOnly = dockerBuildOnly
        if (dockerTag.trim()) {
          payload.dockerTag = dockerTag.trim()
        }
      }

      const response = await fetch("/api/deepspeech/train", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || `Training failed with status ${response.status}`)
      }

      const json = await response.json()
      setTrainingResult(json)
    } catch (error) {
      setTrainingResult({ error: (error as Error).message })
    } finally {
      setIsTraining(false)
    }
  }

  async function runTaskcluster() {
    setIsRunningWorkflow(true)
    setTaskclusterResult(null)
    try {
      const payload: Record<string, unknown> = {
        workflow: taskclusterWorkflow,
      }

      if (taskclusterArgs.trim()) {
        payload.args = taskclusterArgs.split(/\s+/).filter(Boolean)
      }

      const response = await fetch("/api/deepspeech/taskcluster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || `Workflow failed with status ${response.status}`)
      }

      const json = await response.json()
      setTaskclusterResult(json)
    } catch (error) {
      setTaskclusterResult({ error: (error as Error).message })
    } finally {
      setIsRunningWorkflow(false)
    }
  }

  return (
    <Tabs defaultValue="training" className="w-full">
      <TabsList className="grid grid-cols-2">
        <TabsTrigger value="training">Training</TabsTrigger>
        <TabsTrigger value="taskcluster">Taskcluster Workflows</TabsTrigger>
      </TabsList>

      <TabsContent value="training" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>DeepSpeech Training Orchestrator</CardTitle>
            <CardDescription>
              Launch the bundled Qur'an fine-tuning pipelines or invoke a custom training entrypoint directly from the app.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile">Training profile</Label>
              <Select value={profile} onValueChange={setProfile}>
                <SelectTrigger id="profile">
                  <SelectValue placeholder="Select a training recipe" />
                </SelectTrigger>
                <SelectContent>
                  {trainingProfiles.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {profile === "custom" ? (
              <div className="space-y-2">
                <Label htmlFor="entrypoint">Custom entrypoint</Label>
                <Input
                  id="entrypoint"
                  placeholder="DeepSpeech.py"
                  value={customEntryPoint}
                  onChange={(event) => setCustomEntryPoint(event.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Provide a Python module (DeepSpeech.py) or an executable script relative to the repository root.
                </p>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="extra-args">Extra CLI arguments</Label>
              <Input
                id="extra-args"
                placeholder="--epochs 3 --learning_rate 0.0001"
                value={extraArgs}
                onChange={(event) => setExtraArgs(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">Arguments are split on whitespace and appended to the command.</p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label className="text-base">Build GPU Docker image</Label>
                <p className="text-xs text-muted-foreground">
                  Hydrates Dockerfile.train.tmpl and executes a docker build for isolated GPU training.
                </p>
              </div>
              <Switch checked={useDocker} onCheckedChange={setUseDocker} />
            </div>

            {useDocker ? (
              <div className="space-y-4 rounded-lg border p-4">
                <div className="space-y-2">
                  <Label htmlFor="docker-tag">Docker image tag</Label>
                  <Input
                    id="docker-tag"
                    placeholder="deepspeech-quran:latest"
                    value={dockerTag}
                    onChange={(event) => setDockerTag(event.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Build only</Label>
                    <p className="text-xs text-muted-foreground">
                      Keep docker build as the terminal step. Disable to immediately run the Qur'an recipe inside the image.
                    </p>
                  </div>
                  <Switch checked={dockerBuildOnly} onCheckedChange={setDockerBuildOnly} />
                </div>
              </div>
            ) : null}

            <Button onClick={runTraining} disabled={isTraining} className="w-full">
              {isTraining ? "Running training..." : "Run training"}
            </Button>

            <div className="space-y-2">
              <Label>Command output</Label>
              <ScrollArea className="h-64 rounded-md border p-3 bg-muted/30">
                <pre className="text-xs whitespace-pre-wrap break-words">
                  {stringifyResult(trainingResult)}
                </pre>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="taskcluster" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Taskcluster Regression Harness</CardTitle>
            <CardDescription>
              Execute the upstream Taskcluster scripts locally to validate training, transcription, and scorer generation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workflow">Workflow</Label>
              <Select value={taskclusterWorkflow} onValueChange={setTaskclusterWorkflow}>
                <SelectTrigger id="workflow">
                  <SelectValue placeholder="Choose a Taskcluster recipe" />
                </SelectTrigger>
                <SelectContent>
                  {workflows.map((workflowOption) => (
                    <SelectItem key={workflowOption.key} value={workflowOption.key}>
                      {workflowOption.key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedWorkflow ? (
                <p className="text-xs text-muted-foreground">
                  {selectedWorkflow.description} (script: {selectedWorkflow.script})
                </p>
              ) : null}
            </div>

            {selectedWorkflow && selectedWorkflow.defaultArgs.length ? (
              <p className="text-xs text-muted-foreground">
                Default arguments: {selectedWorkflow.defaultArgs.join(" ")}
              </p>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="workflow-args">Override arguments</Label>
              <Textarea
                id="workflow-args"
                placeholder="3.7.6:m 16k --pypi"
                value={taskclusterArgs}
                onChange={(event) => setTaskclusterArgs(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to reuse the defaults shipped with the upstream configuration.
              </p>
            </div>

            <Button onClick={runTaskcluster} disabled={isRunningWorkflow} className="w-full">
              {isRunningWorkflow ? "Running workflow..." : "Run Taskcluster workflow"}
            </Button>

            <div className="space-y-2">
              <Label>Workflow output</Label>
              <ScrollArea className="h-64 rounded-md border p-3 bg-muted/30">
                <pre className="text-xs whitespace-pre-wrap break-words">
                  {stringifyResult(taskclusterResult)}
                </pre>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
