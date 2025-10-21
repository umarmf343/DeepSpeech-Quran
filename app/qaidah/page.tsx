"use client"

import { useMemo, useState } from "react"
import Image from "next/image"

import AppLayout from "@/components/app-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Activity,
  AudioLines,
  BadgeCheck,
  BookOpen,
  CalendarClock,
  Flame,
  Headphones,
  Mic,
  Sparkles,
  Waves,
} from "lucide-react"

interface QaidaAssignment {
  id: string
  title: string
  surah: string
  lessonFocus: string[]
  dueDate: string
  status: "active" | "scheduled" | "completed"
  newUpdates: number
  reviewProgress: number
  audioHotspots: Array<{ id: string; label: string; description: string }>
  resources: Array<{ id: string; title: string; description: string; image: string }>
}

const assignments: QaidaAssignment[] = [
  {
    id: "qaidah-1",
    title: "Makharij Focus Drill",
    surah: "Lesson 7 · Qa'idah Noorania",
    lessonFocus: ["Makharij", "Qalqalah", "Stretching"],
    dueDate: "Due in 2 days",
    status: "active",
    newUpdates: 3,
    reviewProgress: 72,
    audioHotspots: [
      { id: "h1", label: "ق", description: "Deep Qaf articulation with rounded lips" },
      { id: "h2", label: "ط", description: "Full tongue contact and emphatic release" },
      { id: "h3", label: "م", description: "Complete closure before transitioning to vowel" },
    ],
    resources: [
      {
        id: "r1",
        title: "Makharij reference sheet",
        description: "Printable chart covering throat, tongue, and lips articulation points.",
        image: "/mushaf-page-with-highlighted-verses.jpg",
      },
      {
        id: "r2",
        title: "Teacher audio walkthrough",
        description: "Step-by-step recitation with slow and natural pace variations.",
        image: "/arabic-calligraphy-with-quranic-verses.jpg",
      },
    ],
  },
  {
    id: "qaidah-2",
    title: "Stretching rules practice",
    surah: "Lesson 8 · Qa'idah Noorania",
    lessonFocus: ["Madd Tabee'i", "Ikhfa", "Nasal Resonance"],
    dueDate: "Scheduled for Monday",
    status: "scheduled",
    newUpdates: 1,
    reviewProgress: 48,
    audioHotspots: [
      { id: "h1", label: "ـَا", description: "Sustain natural stretch for two counts" },
      { id: "h2", label: "ـِي", description: "Keep the jaw relaxed and airflow gentle" },
    ],
    resources: [
      {
        id: "r1",
        title: "Student warm-up routine",
        description: "Voice and breathing primer before practice starts.",
        image: "/placeholder.jpg",
      },
    ],
  },
  {
    id: "qaidah-3",
    title: "Closing reflections",
    surah: "Lesson 5 · Qa'idah Noorania",
    lessonFocus: ["Khushū'", "Pacing", "Mindful breathing"],
    dueDate: "Completed yesterday",
    status: "completed",
    newUpdates: 0,
    reviewProgress: 100,
    audioHotspots: [
      { id: "h1", label: "Flow", description: "Combine breathing technique with mindful pauses." },
    ],
    resources: [
      {
        id: "r1",
        title: "Reflection journal prompts",
        description: "Guided writing prompts for after-class reflections.",
        image: "/islamic-geometric-patterns-with-arabic-text.jpg",
      },
    ],
  },
]

const streakHighlights = [
  {
    id: "h1",
    title: "Class readiness",
    description: "Students who joined the live Qa'idah room and completed warm-ups.",
    metric: "86% ready",
    icon: Activity,
  },
  {
    id: "h2",
    title: "Audio submissions",
    description: "Clips waiting for review with AI-assisted scoring cues.",
    metric: "12 pending",
    icon: Headphones,
  },
  {
    id: "h3",
    title: "Feedback loops",
    description: "Personalized feedback shared with families this week.",
    metric: "7 sent",
    icon: Sparkles,
  },
]

export default function QaidahAssignmentsPage() {
  const [open, setOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<QaidaAssignment | null>(null)

  const activeAssignment = useMemo(() => selectedAssignment ?? assignments[0], [selectedAssignment])

  return (
    <AppLayout>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-maroon-900">Qa'idah assignments</h1>
            <p className="text-sm text-maroon-600">
              Track lesson readiness, audio hotspots, and personalized resources for every learner in your class.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-100 text-emerald-700">
              <Flame className="mr-1 h-3 w-3" /> 9 day streak
            </Badge>
            <Button className="bg-maroon-600 hover:bg-maroon-700">
              <Mic className="mr-2 h-4 w-4" /> Start live session
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur">
            <TabsTrigger value="overview">Active lessons</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-4 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              {assignments.map((assignment) => {
                const isActive = assignment.id === activeAssignment.id
                return (
                  <Card
                    key={assignment.id}
                    className="border border-maroon-200/60 bg-white/80 backdrop-blur transition-all hover:border-maroon-300 hover:shadow-lg"
                  >
                    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-xl font-semibold text-maroon-900">
                          {assignment.title}
                        </CardTitle>
                        <CardDescription className="text-sm text-maroon-600">{assignment.surah}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">
                          <CalendarClock className="mr-1 h-3 w-3" /> {assignment.dueDate}
                        </Badge>
                        {assignment.newUpdates > 0 && (
                          <Badge className="bg-maroon-600 text-white">
                            <Sparkles className="mr-1 h-3 w-3" /> {assignment.newUpdates} updates
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {assignment.lessonFocus.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="bg-maroon-50 text-maroon-700"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div>
                        <div className="mb-1 flex items-center justify-between text-xs font-medium text-maroon-600">
                          <span>Class mastery</span>
                          <span>{assignment.reviewProgress}%</span>
                        </div>
                        <Progress value={assignment.reviewProgress} className="h-2 bg-maroon-100" />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Card className="border-maroon-100 bg-white/60 p-3 shadow-none">
                          <div className="flex items-start gap-3">
                            <BookOpen className="mt-1 h-4 w-4 text-maroon-500" />
                            <div>
                              <p className="text-sm font-semibold text-maroon-900">Hotspot focus</p>
                              <p className="text-xs text-maroon-600">
                                {assignment.audioHotspots.length} articulation checkpoints highlighted
                              </p>
                            </div>
                          </div>
                        </Card>
                        <Card className="border-maroon-100 bg-white/60 p-3 shadow-none">
                          <div className="flex items-start gap-3">
                            <Headphones className="mt-1 h-4 w-4 text-maroon-500" />
                            <div>
                              <p className="text-sm font-semibold text-maroon-900">Audio submissions</p>
                              <p className="text-xs text-maroon-600">AI-assisted scoring ready for review</p>
                            </div>
                          </div>
                        </Card>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant={isActive ? "default" : "outline"}
                          className="border-maroon-300 bg-maroon-600 text-white hover:bg-maroon-700"
                          onClick={() => {
                            setSelectedAssignment(assignment)
                            setOpen(true)
                          }}
                        >
                          <AudioLines className="mr-2 h-4 w-4" /> View lesson workspace
                        </Button>
                        <Button variant="ghost" className="text-maroon-700 hover:bg-maroon-50">
                          <BadgeCheck className="mr-2 h-4 w-4" /> Mark checkpoints
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            <div className="space-y-6">
              <Card className="border-maroon-200/60 bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-lg text-maroon-900">Live hotspot tracker</CardTitle>
                  <CardDescription className="text-sm text-maroon-600">
                    Preview articulation hotspots and jump directly into student submissions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64 pr-4">
                    <div className="space-y-4">
                      {assignments[0].audioHotspots.map((hotspot) => (
                        <div
                          key={hotspot.id}
                          className="rounded-2xl border border-maroon-100 bg-white/70 p-4 transition hover:border-maroon-200 hover:shadow-md"
                        >
                          <div className="flex items-center justify-between">
                            <Badge className="bg-maroon-600 text-white">{hotspot.label}</Badge>
                            <Button variant="ghost" size="sm" className="text-maroon-700">
                              <Waves className="mr-1 h-4 w-4" /> Play focus clip
                            </Button>
                          </div>
                          <p className="mt-2 text-sm text-maroon-700">{hotspot.description}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="border-maroon-200/60 bg-gradient-to-br from-white via-cream-50 to-amber-50">
                <CardHeader>
                  <CardTitle className="text-lg text-maroon-900">Weekly momentum</CardTitle>
                  <CardDescription className="text-sm text-maroon-600">
                    Celebrate consistent progress and stay ahead of upcoming lessons.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {streakHighlights.map((highlight) => {
                    const Icon = highlight.icon
                    return (
                      <div
                        key={highlight.id}
                        className="flex items-start gap-4 rounded-2xl border border-maroon-100 bg-white/80 p-4"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-maroon-100 text-maroon-700">
                          <Icon className="h-5 w-5" />
                        </span>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-maroon-900">{highlight.title}</p>
                          <p className="text-xs text-maroon-600">{highlight.description}</p>
                        </div>
                        <span className="ml-auto text-sm font-semibold text-maroon-700">{highlight.metric}</span>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="insights" className="mt-4">
            <Card className="border-maroon-200/60 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg text-maroon-900">Lesson readiness insights</CardTitle>
                <CardDescription className="text-sm text-maroon-600">
                  Aggregate analytics summarizing student engagement across Qa'idah lessons.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="space-y-3 rounded-2xl border border-maroon-100 bg-white/70 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-maroon-900">{assignment.title}</p>
                        <p className="text-xs text-maroon-600">{assignment.surah}</p>
                      </div>
                      <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                        {assignment.reviewProgress}% mastery
                      </Badge>
                    </div>
                    <Progress value={assignment.reviewProgress} className="h-2 bg-maroon-100" />
                    <div className="flex items-center gap-2 text-xs text-maroon-600">
                      <Waves className="h-4 w-4" />
                      {assignment.audioHotspots.length} hotspots · {assignment.lessonFocus.length} focus tags
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog
        open={open}
        onOpenChange={(value) => {
          setOpen(value)
          if (!value) {
            setSelectedAssignment(null)
          }
        }}
      >
        <DialogContent className="max-w-3xl border-maroon-200 bg-white/95">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-maroon-900">
              {activeAssignment.title}
            </DialogTitle>
            <DialogDescription className="text-sm text-maroon-600">
              {activeAssignment.surah}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <div className="rounded-3xl border border-maroon-100 bg-gradient-to-br from-maroon-50 to-white p-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-maroon-200 text-maroon-700">
                    {activeAssignment.dueDate}
                  </Badge>
                  <span className="text-xs font-medium text-maroon-600">
                    Class mastery {activeAssignment.reviewProgress}%
                  </span>
                </div>
                <Progress value={activeAssignment.reviewProgress} className="mt-3 h-2 bg-maroon-200/40" />
                <div className="mt-4 flex flex-wrap gap-2">
                  {activeAssignment.lessonFocus.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-maroon-100 text-maroon-700">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-maroon-900">Audio hotspots</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {activeAssignment.audioHotspots.map((hotspot) => (
                    <div
                      key={hotspot.id}
                      className="rounded-2xl border border-maroon-100 bg-white/80 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <Badge className="bg-maroon-600 text-white">{hotspot.label}</Badge>
                        <Button variant="ghost" size="sm" className="text-maroon-700">
                          <AudioLines className="mr-1 h-4 w-4" /> Listen
                        </Button>
                      </div>
                      <p className="mt-2 text-sm text-maroon-700">{hotspot.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="overflow-hidden rounded-3xl border border-maroon-100 bg-white/60">
                <Image
                  src="/placeholder.jpg"
                  alt="Qa'idah lesson board"
                  width={640}
                  height={400}
                  className="h-48 w-full object-cover"
                />
                <div className="space-y-2 p-4">
                  <p className="text-sm font-semibold text-maroon-900">Lesson board</p>
                  <p className="text-xs text-maroon-600">
                    Use the annotated board while presenting to the class or sharing in live sessions.
                  </p>
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-maroon-900">Resources</h3>
                <div className="space-y-3">
                  {activeAssignment.resources.map((resource) => (
                    <div
                      key={resource.id}
                      className="flex items-center gap-3 rounded-2xl border border-maroon-100 bg-white/70 p-3"
                    >
                      <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-maroon-100">
                        <Image src={resource.image} alt={resource.title} fill sizes="48px" className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-maroon-900">{resource.title}</p>
                        <p className="text-xs text-maroon-600">{resource.description}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-maroon-700">
                        <BookOpen className="mr-1 h-4 w-4" /> Open
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs text-maroon-600">
              <AudioLines className="h-4 w-4" />
              Lesson audio ready · Last updated 3 minutes ago
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" className="text-maroon-700 hover:bg-maroon-50">
                <BadgeCheck className="mr-2 h-4 w-4" /> Mark as reviewed
              </Button>
              <Button className="bg-maroon-600 text-white hover:bg-maroon-700">
                <Mic className="mr-2 h-4 w-4" /> Launch guided session
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
