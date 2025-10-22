"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import AppLayout from "@/components/app-layout"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { Assignment, AssignmentHotspot } from "@/types/assignments"
import {
  AlertCircle,
  ArrowRight,
  AudioLines,
  Download,
  Headphones,
  HelpCircle,
  Loader2,
  Mic,
  Pause,
  Play,
  Send,
  Sparkles,
} from "lucide-react"

interface StudentRecording {
  hotspotId: string
  audioUrl: string
  status: "saved" | "pending"
}

const encouragementMessage = "May Allah accept your effort. You’re growing beautifully."

const parentSummaryPrefixes = ["Today’s focus", "Practice intention", "Suggested family activity"]

const studentProfile = {
  id: "amina",
  name: "Amina Rahman",
  classes: ["foundation"],
}

export default function QaidahAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(false)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null)
  const [currentMode, setCurrentMode] = useState<"hotspot" | "linear" | "audio">("hotspot")
  const [imageFailed, setImageFailed] = useState(false)
  const [playingHotspotId, setPlayingHotspotId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [studentRecordings, setStudentRecordings] = useState<StudentRecording[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [recordingHotspotId, setRecordingHotspotId] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingChunksRef = useRef<Blob[]>([])
  const [reflectionNotes, setReflectionNotes] = useState("")
  const [parentView, setParentView] = useState(false)
  const [syncingOffline, setSyncingOffline] = useState(false)

  const visibleAssignments = useMemo(() => {
    const classSet = new Set(studentProfile.classes)
    return assignments.filter((assignment) => {
      if (assignment.status && assignment.status !== "sent") {
        return false
      }

      if (!assignment.recipients) {
        return false
      }

      if (assignment.recipients.type === "class") {
        return assignment.recipients.ids.some((id) => classSet.has(id))
      }

      return assignment.recipients.ids.includes(studentProfile.id)
    })
  }, [assignments])

  const selectedAssignment = useMemo(
    () => visibleAssignments.find((assignment) => assignment.id === selectedAssignmentId) ?? null,
    [visibleAssignments, selectedAssignmentId],
  )

  useEffect(() => {
    const fetchAssignments = async () => {
      setLoading(true)
      try {
        const response = await fetch("/api/assignments")
        const data = await response.json()
        setAssignments(data)
      } finally {
        setLoading(false)
      }
    }

    void fetchAssignments()
  }, [])

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop()
      }
      audioRef.current?.pause()
    }
  }, [])

  useEffect(() => {
    if (!selectedAssignmentId) return
    const stillVisible = visibleAssignments.some((assignment) => assignment.id === selectedAssignmentId)
    if (!stillVisible) {
      setSelectedAssignmentId(null)
      setViewerOpen(false)
    }
  }, [selectedAssignmentId, visibleAssignments])

  const openAssignment = (assignment: Assignment) => {
    setSelectedAssignmentId(assignment.id)
    setCurrentMode(assignment.mode ?? "hotspot")
    setImageFailed(false)
    setViewerOpen(true)
  }

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setPlayingHotspotId(null)
  }

  const playHotspotAudio = (hotspot: AssignmentHotspot) => {
    if (!hotspot.audioUrl) return
    if (playingHotspotId === hotspot.id) {
      stopPlayback()
      return
    }
    stopPlayback()
    const audio = new Audio(hotspot.audioUrl)
    audioRef.current = audio
    setPlayingHotspotId(hotspot.id)
    audio.onended = () => setPlayingHotspotId(null)
    void audio.play()
  }

  const startStudentRecording = async (hotspotId: string) => {
    if (isRecording) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      recordingChunksRef.current = []
      setRecordingHotspotId(hotspotId)
      setIsRecording(true)
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordingChunksRef.current.push(event.data)
        }
      }
      recorder.onstop = () => {
        const blob = new Blob(recordingChunksRef.current, { type: "audio/webm" })
        const url = URL.createObjectURL(blob)
        setStudentRecordings((prev) => {
          const filtered = prev.filter((recording) => recording.hotspotId !== hotspotId)
          return [...filtered, { hotspotId, audioUrl: url, status: "pending" }]
        })
        setRecordingHotspotId(null)
        setIsRecording(false)
        stream.getTracks().forEach((track) => track.stop())
      }
      recorder.start()
    } catch (error) {
      console.error(error)
      alert("Microphone unavailable. Please ask a family member to read the instruction aloud.")
    }
  }

  const stopStudentRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }
  }

  const acknowledgeRecording = (hotspotId: string) => {
    setStudentRecordings((prev) =>
      prev.map((recording) =>
        recording.hotspotId === hotspotId ? { ...recording, status: "saved" } : recording,
      ),
    )
  }

  const requestHelp = (assignment: Assignment, hotspot?: AssignmentHotspot) => {
    const topic = hotspot ? `${hotspot.objective} – ${hotspot.instruction}` : assignment.title
    alert(`Your ustadh has been notified that you need help with: ${topic}`)
  }

  const syncOfflineResources = async (assignment: Assignment) => {
    if (typeof window === "undefined" || !("caches" in window)) {
      alert("Offline caching unavailable. Please download audio manually if needed.")
      return
    }
    setSyncingOffline(true)
    try {
      const cache = await caches.open("qaidah-assignments")
      if (assignment.imageUrl) {
        await cache.add(assignment.imageUrl)
      }
      await Promise.all(
        assignment.hotspots
          .filter((hotspot) => hotspot.audioUrl)
          .map((hotspot) => cache.add(hotspot.audioUrl as string)),
      )
      alert("Assignment cached for offline review. Remember to recite away from screens too.")
    } catch (error) {
      console.error(error)
      alert("Unable to cache offline. Try again when connected.")
    } finally {
      setSyncingOffline(false)
    }
  }

  const activeStudentRecording = (hotspotId: string) =>
    studentRecordings.find((recording) => recording.hotspotId === hotspotId)

  const renderHotspotButton = (hotspot: AssignmentHotspot) => (
    <button
      key={hotspot.id}
      className={cn(
        "absolute flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-sm font-semibold",
        playingHotspotId === hotspot.id
          ? "border-emerald-200 bg-emerald-500 text-white"
          : "border-white bg-maroon-600 text-white shadow-lg",
      )}
      style={{ left: `${hotspot.x * 100}%`, top: `${hotspot.y * 100}%` }}
      onClick={() => playHotspotAudio(hotspot)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          playHotspotAudio(hotspot)
        }
      }}
      aria-label={`Hotspot ${hotspot.order}: ${hotspot.instruction}. Press Enter to play audio.`}
    >
      {hotspot.order}
    </button>
  )

  const renderLinearStep = (hotspot: AssignmentHotspot) => (
    <Card key={hotspot.id} className="border-maroon-100 bg-maroon-50/50">
      <CardContent className="space-y-2 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-maroon-600 text-sm font-semibold text-white">
            {hotspot.order}
          </span>
          <div>
            <p className="text-sm font-semibold text-maroon-900">
              {hotspot.icon} {hotspot.instruction}
            </p>
            {hotspot.transliteration && <p className="text-xs text-maroon-600">{hotspot.transliteration}</p>}
          </div>
        </div>
        {hotspot.textFallback && <p className="text-sm text-maroon-800">{hotspot.textFallback}</p>}
        {hotspot.linearDescription && <p className="text-xs text-muted-foreground">{hotspot.linearDescription}</p>}
        {hotspot.audioUrl && (
          <Button variant="secondary" className="w-full" onClick={() => playHotspotAudio(hotspot)}>
            {playingHotspotId === hotspot.id ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}Listen
          </Button>
        )}
        <div className="rounded-lg border border-dashed border-maroon-200 bg-white/60 p-3 text-sm text-maroon-700">
          <p className="font-semibold">Practice only – no right or wrong.</p>
          <p>{encouragementMessage}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant={isRecording && recordingHotspotId === hotspot.id ? "destructive" : "outline"}
              onClick={() =>
                isRecording && recordingHotspotId === hotspot.id
                  ? stopStudentRecording()
                  : startStudentRecording(hotspot.id)
              }
            >
              {isRecording && recordingHotspotId === hotspot.id ? (
                <>
                  <Pause className="mr-2 h-4 w-4" /> Stop recording
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-4 w-4" /> Record your recitation
                </>
              )}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => requestHelp(selectedAssignment as Assignment, hotspot)}>
              <HelpCircle className="mr-2 h-4 w-4" /> I don’t understand
            </Button>
            {activeStudentRecording(hotspot.id) && (
              <Button size="sm" variant="secondary" onClick={() => acknowledgeRecording(hotspot.id)}>
                <Send className="mr-2 h-4 w-4" /> Send to ustadh
              </Button>
            )}
          </div>
          {activeStudentRecording(hotspot.id) && (
            <audio controls src={activeStudentRecording(hotspot.id)?.audioUrl} className="mt-2 w-full" />
          )}
        </div>
      </CardContent>
    </Card>
  )

  const parentSummary = selectedAssignment
    ? [
        `${parentSummaryPrefixes[0]}: ${selectedAssignment.hotspots?.[0]?.instruction ?? selectedAssignment.description ?? "Recitation practice"}`,
        `${parentSummaryPrefixes[1]}: Encourage warmth and repetition together.`,
        `${parentSummaryPrefixes[2]}: Listen together and repeat aloud three times away from the screen.`,
      ]
    : []

  return (
    <AppLayout>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-16 pt-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-maroon-900">Qa’idah practice hub</h1>
            <p className="text-sm text-maroon-600">
              Listen, repeat, and reflect at your own pace. Screens are helpers—the real recitation happens in your heart.
            </p>
          </div>
          <Badge className="bg-emerald-600/90">All audio expires after 90 days</Badge>
        </div>

        <Tabs defaultValue="assignments">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="reflection">Reflection journal</TabsTrigger>
          </TabsList>
          <TabsContent value="assignments" className="mt-4 space-y-4">
            {loading && <p className="text-sm text-muted-foreground">Loading assignments…</p>}
            {!loading && visibleAssignments.length === 0 && (
              <Alert>
                <AlertTitle>No assignments yet</AlertTitle>
                <AlertDescription>
                  Your teacher hasn’t sent a new activity. Review previous lessons aloud three times, then make dua.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 lg:grid-cols-2">
              {visibleAssignments.map((assignment) => {
                const formattedCreatedAt = new Date(assignment.createdAt).toLocaleString()
                const practicePoints = assignment.hotspots?.length ?? 0
                const modeLabel =
                  assignment.mode === "hotspot"
                    ? "hotspot"
                    : assignment.mode === "linear"
                      ? "linear"
                      : "audio"
                const modeDisplay = modeLabel.charAt(0).toUpperCase() + modeLabel.slice(1)

                return (
                  <div
                    key={assignment.id}
                    data-slot="card"
                    className="text-card-foreground flex flex-col gap-6 rounded-xl border border-maroon-100/60 bg-white/80 py-6 shadow-sm"
                  >
                    <div
                      data-slot="card-header"
                      className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] space-y-2"
                    >
                      <div data-slot="card-title" className="text-xl font-semibold text-maroon-900">
                        {assignment.title}
                      </div>
                      <div
                        data-slot="card-description"
                        className="flex flex-wrap items-center gap-2 text-sm text-maroon-600"
                      >
                        <span>From {assignment.teacherName ?? "your ustadh"}</span>
                        <span aria-hidden="true">•</span>
                        <span>{formattedCreatedAt}</span>
                        <span
                          data-slot="badge"
                          className="inline-flex w-fit shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 [&>svg]:pointer-events-none [&>svg]:size-3"
                        >
                          <Headphones className="h-3 w-3" /> {practicePoints} practice points
                        </span>
                      </div>
                    </div>
                    <div data-slot="card-content" className="space-y-3 px-6">
                      <p className="text-sm text-maroon-700">{assignment.description}</p>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span
                          data-slot="badge"
                          className="inline-flex w-fit shrink-0 items-center justify-center whitespace-nowrap rounded-md border border-transparent bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
                        >
                          Mode: {modeDisplay}
                        </span>
                        <span
                          data-slot="badge"
                          className={cn(
                            "inline-flex w-fit shrink-0 items-center justify-center whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium",
                            assignment.recipients.type === "class"
                              ? "border-transparent text-foreground"
                              : "border-emerald-200 text-emerald-700",
                          )}
                        >
                          {assignment.recipients.type === "class" ? "Class assignment" : "Personal practice"}
                        </span>
                      </div>
                      <button
                        data-slot="button"
                        type="button"
                        onClick={() => openAssignment(assignment)}
                        className="inline-flex h-9 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-maroon-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-maroon-700 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0"
                      >
                        <ArrowRight className="h-4 w-4" /> Open assignment
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </TabsContent>
          <TabsContent value="reflection" className="mt-4 space-y-3">
            <Card className="border border-maroon-200 bg-maroon-50/70">
              <CardHeader>
                <CardTitle>How is your recitation heart today?</CardTitle>
                <CardDescription>
                  After five assignments, take a quiet moment to write or draw how the sounds feel in your mouth and
                  heart.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={reflectionNotes}
                  onChange={(event) => setReflectionNotes(event.target.value)}
                  placeholder="Which sound was easiest? Which needs more practice? Remember: Allah loves your effort."
                  rows={6}
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Private journal – only you can see this.</span>
                  <span>{reflectionNotes.length} characters</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={viewerOpen && Boolean(selectedAssignment)} onOpenChange={setViewerOpen}>
        <DialogContent className="max-w-4xl">
          {selectedAssignment ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex flex-col gap-1 text-maroon-900">
                  {selectedAssignment.title}
                  <span className="text-sm font-normal text-maroon-600">
                    Teacher {selectedAssignment.teacherName ?? "Unknown"} – {new Date(selectedAssignment.createdAt).toLocaleString()}
                  </span>
                </DialogTitle>
                <DialogDescription>
                  Practice with mercy. Click hotspots or follow the linear guide. Play only one audio at a time to protect
                  your focus.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Tabs value={currentMode} onValueChange={(value: typeof currentMode) => setCurrentMode(value)}>
                    <TabsList className="grid h-10 grid-cols-3">
                      <TabsTrigger value="hotspot">🖼️ Hotspots</TabsTrigger>
                      <TabsTrigger value="linear">📜 Linear guide</TabsTrigger>
                      <TabsTrigger value="audio">🔊 Audio only</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => syncOfflineResources(selectedAssignment)}
                      disabled={syncingOffline}
                    >
                      {syncingOffline ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="mr-2 h-4 w-4" />
                      )}
                      Download for offline
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => requestHelp(selectedAssignment)}>
                      <HelpCircle className="mr-2 h-4 w-4" /> I don’t understand
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setParentView((prev) => !prev)}>
                      <Sparkles className="mr-2 h-4 w-4" /> {parentView ? "Student view" : "Parent summary"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Assigned to {selectedAssignment.recipients.type === "class"
                      ? `class ${selectedAssignment.recipients.ids.join(", ")}`
                      : studentProfile.name}
                  </p>
                </div>

                {parentView ? (
                  <Card className="border border-emerald-200 bg-emerald-50/80">
                    <CardHeader>
                      <CardTitle className="text-emerald-900">Parent partner view</CardTitle>
                      <CardDescription className="text-emerald-700">
                        Sit beside your child, listen with warmth, and repeat aloud together.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-emerald-900">
                      {parentSummary.map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                      <p className="text-xs text-emerald-700">
                        Tip: After listening once, close the screen and recite three times aloud.
                      </p>
                    </CardContent>
                  </Card>
                ) : null}

                {currentMode === "hotspot" && selectedAssignment.imageUrl && !imageFailed && selectedAssignment.hotspots && (
                  <div className="relative overflow-hidden rounded-xl border border-maroon-200 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedAssignment.imageUrl}
                      alt="Assignment visual"
                      className="max-h-[520px] w-full object-contain"
                      onError={() => setImageFailed(true)}
                    />
                    {selectedAssignment.hotspots?.map(renderHotspotButton)}
                  </div>
                )}

                {(currentMode !== "hotspot" || imageFailed) && (
                  <div className="space-y-3">
                    {imageFailed && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle className="ml-2">Image unavailable</AlertTitle>
                        <AlertDescription className="ml-6">
                          Switch to the linear guide below. Every hotspot is listed in order.
                        </AlertDescription>
                      </Alert>
                    )}
                    {selectedAssignment.hotspots?.map(renderLinearStep)}
                  </div>
                )}

                {currentMode === "audio" && (
                  <Card className="border border-maroon-100 bg-maroon-50/70">
                    <CardContent className="space-y-3 p-5">
                      <p className="text-sm font-semibold text-maroon-900">
                        Close your eyes and listen to the full walkthrough.
                      </p>
                      <p className="text-xs text-maroon-600">
                        Imagine the articulation points as you hear them. Repeat softly, then aloud.
                      </p>
                      <div className="space-y-2">
                        {selectedAssignment.hotspots?.map((hotspot) => (
                          <Button key={hotspot.id} variant="secondary" className="w-full" onClick={() => playHotspotAudio(hotspot)}>
                            {playingHotspotId === hotspot.id ? (
                              <Pause className="mr-2 h-4 w-4" />
                            ) : (
                              <Play className="mr-2 h-4 w-4" />
                            )}
                            Listen to hotspot {hotspot.order}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Alert className="border border-dashed border-emerald-300 bg-emerald-50 text-emerald-800">
                  <AudioLines className="mr-2 h-4 w-4" />
                  <AlertTitle>After the screen</AlertTitle>
                  <AlertDescription>
                    Close the device, recite each sound three times aloud, and make dua: “O Allah, beautify the Quran in
                    my heart.”
                  </AlertDescription>
                </Alert>
              </div>
              <DialogFooter>
                <Button onClick={() => setViewerOpen(false)}>Close</Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
