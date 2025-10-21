import { getTrainingDocumentation } from "@/lib/deepspeech/training-docs"
import { TrainingRunner } from "./training-runner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

export default async function DeepSpeechTrainingPage() {
  const documentation = await getTrainingDocumentation()

  return (
    <div className="space-y-8 p-6">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">DeepSpeech Qur'an Training Workbench</h1>
        <p className="text-muted-foreground max-w-3xl">
          Launch full DeepSpeech fine-tuning runs, hydrate the GPU-enabled Docker image, and mirror Taskcluster QA flows without
          leaving the app. The bundled shell helpers and documentation from the upstream DeepSpeech project are now accessible
          alongside the Node.js orchestration layer.
        </p>
      </header>

      <TrainingRunner workflows={documentation.taskcluster} />

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Bundled shell helpers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {documentation.shellHelpers.map((helper) => (
              <div key={helper.name} className="space-y-1">
                <Badge variant="secondary">{helper.name}</Badge>
                <p className="text-sm text-muted-foreground">{helper.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Taskcluster harness overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {documentation.taskcluster.map((workflow) => (
              <div key={workflow.key} className="space-y-1">
                <Badge>{workflow.key}</Badge>
                <p className="text-sm text-muted-foreground">{workflow.description}</p>
                <p className="text-xs text-muted-foreground">Script: {workflow.script}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Qur'an corpus preparation notes</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96 rounded-md border bg-muted/30 p-4">
              <pre className="text-xs whitespace-pre-wrap break-words">{documentation.quranReadme}</pre>
            </ScrollArea>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
