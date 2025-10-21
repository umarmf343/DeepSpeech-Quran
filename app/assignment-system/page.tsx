"use client"

import { useEffect, useMemo, useRef, useState, type FormEvent, type MouseEvent } from "react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { EggChallengeWidget } from "@/components/egg-challenge-widget"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { useEggChallenge } from "@/hooks/use-egg-challenge"
import {
  CalendarIcon,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Crown,
  Headphones,
  Layers,
  Loader2,
  MousePointerClick,
  Sparkles,
  Wand2,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Hotspot {
  id: string
  x: number
  y: number
  width: number
  height: number
  label: string
  description: string
  audioUrl?: string
}

interface Assignment {
  id: string
  title: string
  description: string
  dueDate: string
  dueTime?: string
  notes?: string
  image?: string
  classes: string[]
  students: string[]
  hotspots: Hotspot[]
  status: "assigned" | "completed"
  createdAt: string
  createdBy: string
}

type Role = "teacher" | "student"

const classOptions = [
  { id: "foundation", name: "Foundation Class" },
  { id: "recitation", name: "Recitation Circle" },
  { id: "memorisation", name: "Memorisation Track" },
  { id: "advanced", name: "Advanced Tajweed" },
]

const studentOptions = [
  { id: "amina", name: "Amina Khalid" },
  { id: "hassan", name: "Hassan Noor" },
  { id: "zahra", name: "Zahra Idris" },
  { id: "yusuf", name: "Yusuf Rahman" },
]

const activityHighlights = [
  {
    icon: "🎧",
    title: "Listen & Repeat",
    description: "Every hotspot guides learners with immersive recitations and teacher tips.",
    gradient: "from-[#fef3c7] via-[#fde68a] to-[#f59e0b]",
  },
  {
    icon: "🌟",
    title: "Track Your Progress",
    description: "Students receive instant feedback as they interact with each assignment hotspot.",
    gradient: "from-[#ede9fe] via-[#ddd6fe] to-[#a78bfa]",
  },
  {
    icon: "🥚",
    title: "Break the Egg Challenge",
    description: "Every completed hotspot pours progress into the memorisation egg until it finally hatches.",
    gradient: "from-[#ede9fe] via-[#f3e8ff] to-[#fde68a]",
  },
]

export default function AssignmentSystemPage() {
  const [role, setRole] = useState<Role>("teacher")
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    dueTime: "",
    notes: "",
  })
  const [selectedClasses, setSelectedClasses] = useState<string[]>(["foundation"])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [hotspots, setHotspots] = useState<Hotspot[]>([])
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null)
  const [isAddingHotspot, setIsAddingHotspot] = useState(false)
  const [formErrors, setFormErrors] = useState<string[]>([])
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const [openAssignmentId, setOpenAssignmentId] = useState<string | null>(null)
  const [progressMap, setProgressMap] = useState<Record<string, string[]>>({})

  const { enabled: eggChallengeEnabled, state: eggChallengeState, trackProgress: trackEggChallengeProgress } =
    useEggChallenge()

  const assignmentModalAudio = useRef<HTMLAudioElement | null>(null)
  const hotspotCanvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let isMounted = true

    async function loadAssignments() {
      try {
        setIsLoadingAssignments(true)
        const response = await fetch("/api/assignments")
        if (!response.ok) {
          throw new Error("Failed to load assignments")
        }
        const data = (await response.json()) as Assignment[]
        if (isMounted) {
          setAssignments(data)
          setFetchError(null)
        }
      } catch (error) {
        console.error(error)
        if (isMounted) {
          setFetchError("We couldn't load assignments. Please try again shortly.")
        }
      } finally {
        if (isMounted) {
          setIsLoadingAssignments(false)
        }
      }
    }

    loadAssignments()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!openAssignmentId && assignmentModalAudio.current) {
      assignmentModalAudio.current.pause()
      assignmentModalAudio.current.currentTime = 0
      assignmentModalAudio.current = null
    }
  }, [openAssignmentId])

  const selectedAssignment = useMemo(
    () => assignments.find((assignment) => assignment.id === openAssignmentId) ?? null,
    [assignments, openAssignmentId],
  )

  const heroTitle =
    role === "teacher"
      ? "Create immersive Qur'anic assignments in minutes"
      : "Explore interactive lessons crafted for your success"

  const heroDescription =
    role === "teacher"
      ? "Design differentiated worksheets, drop engaging audio hotspots, and deliver them instantly to the right students."
      : "Tap vibrant hotspots, listen to your teacher's guidance, and mark every assignment complete with confidence."

  const handleClassToggle = (classId: string, value: boolean | "indeterminate") => {
    setSelectedClasses((prev) => {
      const isActive = prev.includes(classId)
      if (value === true && !isActive) {
        return [...prev, classId]
      }
      if (value !== true && isActive) {
        return prev.filter((item) => item !== classId)
      }
      return prev
    })
  }

  const handleStudentToggle = (studentId: string, value: boolean | "indeterminate") => {
    setSelectedStudents((prev) => {
      const isActive = prev.includes(studentId)
      if (value === true && !isActive) {
        return [...prev, studentId]
      }
      if (value !== true && isActive) {
        return prev.filter((item) => item !== studentId)
      }
      return prev
    })
  }

  const updateHotspot = (id: string, updates: Partial<Hotspot>) => {
    if (role !== "teacher") return
    setHotspots((prev) => prev.map((hotspot) => (hotspot.id === id ? { ...hotspot, ...updates } : hotspot)))
  }

  const removeHotspot = (id: string) => {
    if (role !== "teacher") return
    setHotspots((prev) => prev.filter((hotspot) => hotspot.id !== id))
    if (selectedHotspotId === id) {
      setSelectedHotspotId(null)
    }
  }

  const resetForm = () => {
    setFormData({ title: "", description: "", dueDate: "", dueTime: "", notes: "" })
    setSelectedClasses(["foundation"])
    setSelectedStudents([])
    setSelectedImage(null)
    setHotspots([])
    setSelectedHotspotId(null)
    setIsAddingHotspot(false)
    setFormErrors([])
  }

  const handleImageSelection = (file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result
      if (typeof result === "string") {
        setSelectedImage(result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleHotspotAudioUpload = (id: string, file: File | null) => {
    if (role !== "teacher") return
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result
      if (typeof result === "string") {
        updateHotspot(id, { audioUrl: result })
      }
    }
    reader.readAsDataURL(file)
  }

  const handleHotspotPlacement = (event: MouseEvent<HTMLDivElement>) => {
    if (role !== "teacher" || !isAddingHotspot || !hotspotCanvasRef.current) return

    const bounds = hotspotCanvasRef.current.getBoundingClientRect()
    const x = ((event.clientX - bounds.left) / bounds.width) * 100
    const y = ((event.clientY - bounds.top) / bounds.height) * 100

    const newHotspot: Hotspot = {
      id: `hotspot-${Date.now()}`,
      x,
      y,
      width: 14,
      height: 14,
      label: `Hotspot ${hotspots.length + 1}`,
      description: "Describe the objective for this hotspot.",
    }

    setHotspots((prev) => [...prev, newHotspot])
    setSelectedHotspotId(newHotspot.id)
    setIsAddingHotspot(false)
  }

  const handleCreateAssignment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const errors: string[] = []

    if (!formData.title.trim()) {
      errors.push("Please provide a title for the assignment.")
    }

    if (!formData.description.trim()) {
      errors.push("Add a description so students know what to expect.")
    }

    if (!formData.dueDate) {
      errors.push("Select a due date for the assignment.")
    }

    if (!selectedImage) {
      errors.push("Upload a worksheet image before adding hotspots.")
    }

    if (selectedClasses.length === 0 && selectedStudents.length === 0) {
      errors.push("Select at least one class or student.")
    }

    if (errors.length > 0) {
      setFormErrors(errors)
      setFeedbackMessage("")
      return
    }

    const payload = {
      ...formData,
      dueDate: new Date(`${formData.dueDate}T${formData.dueTime || "00:00"}`).toISOString(),
      image: selectedImage,
      classes: selectedClasses,
      students: selectedStudents,
      hotspots,
      createdBy: "Ustadh Idris",
    }

    try {
      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorBody = (await response.json()) as { error?: string }
        throw new Error(errorBody.error || "Failed to save assignment")
      }

      const createdAssignment = (await response.json()) as Assignment
      setAssignments((prev) => [createdAssignment, ...prev])
      setFeedbackMessage(`Assignment “${createdAssignment.title}” published successfully.`)
      resetForm()
    } catch (error) {
      console.error(error)
      setFeedbackMessage("")
      setFormErrors(["We couldn't save the assignment. Please try again."])
    }
  }

  const handleHotspotInteraction = (assignment: Assignment, hotspot: Hotspot) => {
    let shouldTrackEggProgress = false

    setProgressMap((prev) => {
      const existing = new Set(prev[assignment.id] ?? [])
      if (!existing.has(hotspot.id)) {
        existing.add(hotspot.id)
        shouldTrackEggProgress = true
      }

      const nextState = { ...prev, [assignment.id]: Array.from(existing) }

      if (assignment.hotspots.length > 0 && existing.size === assignment.hotspots.length) {
        setAssignments((current) =>
          current.map((item) =>
            item.id === assignment.id && item.status !== "completed"
              ? { ...item, status: "completed" }
              : item,
          ),
        )
        setFeedbackMessage(`${assignment.title} completed — excellent work!`)
      }

      return nextState
    })

    if (shouldTrackEggProgress && role === "student") {
      void trackEggChallengeProgress(1)
    }

    if (hotspot.audioUrl) {
      try {
        if (assignmentModalAudio.current) {
          assignmentModalAudio.current.pause()
          assignmentModalAudio.current.currentTime = 0
        }
        const audio = new Audio(hotspot.audioUrl)
        assignmentModalAudio.current = audio
        void audio.play()
      } catch (error) {
        console.error("Audio playback failed", error)
      }
    }
  }

  const studentAssignments = useMemo(() => assignments.filter((assignment) => assignment.status !== "archived"), [assignments])

  return (
    <div className="min-h-screen bg-gradient-cream pb-24">
      <span role="status" aria-live="polite" className="sr-only">
        {feedbackMessage}
      </span>
      <section className="relative px-4 pt-12">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[34px] bg-gradient-to-br from-[#571222] via-[#7a1a31] to-[#f4e6d8] p-[1px] shadow-2xl">
          <div className="relative rounded-[34px] bg-gradient-to-br from-white via-[#fffaf4] to-[#fbece0]">
            <div className="qaidah-color-trails pointer-events-none absolute inset-0 overflow-hidden">
              <div className="qaidah-color-trail absolute -top-16 -left-10 h-64 w-64 rounded-full bg-[#f5d0c5]/70 blur-3xl animate-[spin_18s_linear_infinite]"></div>
              <div className="qaidah-color-trail absolute -bottom-20 left-1/3 h-72 w-72 rounded-full bg-[#facc15]/60 blur-3xl animate-[spin_22s_linear_infinite]"></div>
              <div className="qaidah-color-trail absolute -right-12 top-10 h-64 w-64 rounded-full bg-[#f0abfc]/60 blur-3xl animate-[spin_26s_linear_infinite]"></div>
            </div>
            <div className="relative z-10 px-6 py-12 sm:px-10 lg:px-16">
              <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl space-y-6 text-center lg:text-left">
                  <div className="inline-flex items-center gap-3 rounded-full border border-white/40 bg-white/30 px-4 py-2 text-sm font-medium text-maroon-950 shadow-lg backdrop-blur">
                    <Sparkles className="h-4 w-4 text-maroon-700" />
                    Tailored hotspots for teachers and learners
                  </div>
                  <div className="space-y-4">
                    <h1 className="text-4xl font-black text-maroon-950 drop-shadow-sm sm:text-5xl lg:text-6xl">
                      {heroTitle}
                    </h1>
                    <p className="text-lg text-maroon-900/80 sm:text-xl">{heroDescription}</p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                    <Button
                      onClick={() => setRole("teacher")}
                      className={`rounded-full border-0 px-6 py-3 text-base shadow-lg transition ${
                        role === "teacher"
                          ? "bg-gradient-to-r from-[#7c1d2f] via-[#aa243d] to-[#e9795d] text-white"
                          : "bg-white/60 text-maroon-900 hover:bg-white/80"
                      }`}
                    >
                      I am a Teacher
                    </Button>
                    <Button
                      onClick={() => setRole("student")}
                      variant="outline"
                      className={`rounded-full border border-white/70 px-6 py-3 text-base shadow-lg transition ${
                        role === "student"
                          ? "bg-white/80 text-maroon-900"
                          : "bg-transparent text-white"
                      }`}
                    >
                      I am a Student
                    </Button>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-6 text-left text-sm font-medium text-maroon-900/80 lg:justify-start">
                    <div className="flex items-center gap-3 rounded-2xl bg-white/60 px-4 py-3 shadow-md">
                      <Layers className="h-5 w-5 text-maroon-700" />
                      <span>Multi-class distribution</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl bg-white/60 px-4 py-3 shadow-md">
                      <Headphones className="h-5 w-5 text-maroon-700" />
                      <span>Audio hotspots with instant playback</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl bg-white/60 px-4 py-3 shadow-md">
                      <Crown className="h-5 w-5 text-maroon-700" />
                      <span>Celebrate mastery with badges</span>
                    </div>
                  </div>
                </div>
                <div className="relative mx-auto w-full max-w-md rounded-[28px] bg-white/70 p-6 shadow-2xl backdrop-blur">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold uppercase tracking-wide text-maroon-800">Live Preview</p>
                      <Badge className="bg-gradient-to-r from-[#7c1d2f] to-[#d9486e] text-white shadow">{role === "teacher" ? "Teacher" : "Student"} mode</Badge>
                    </div>
                    <div className="rounded-2xl bg-gradient-to-br from-[#fff9f5] via-white to-[#fde7dc] p-5 shadow-inner">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7c1d2f] to-[#d9486e] text-2xl text-white shadow-lg">
                            {role === "teacher" ? <ClipboardList className="h-6 w-6" /> : <Headphones className="h-6 w-6" />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-maroon-900">
                              {role === "teacher" ? "Assignments Crafted" : "Assignments Awaiting"}
                            </p>
                            <p className="text-2xl font-bold text-maroon-950">
                              {role === "teacher" ? assignments.length : studentAssignments.length}
                            </p>
                          </div>
                        </div>
                        <Separator className="bg-maroon-200" />
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-maroon-900">Upcoming focus</p>
                          <p className="text-sm text-maroon-900/80">
                            {role === "teacher"
                              ? "Guide learners through tajweed-rich hotspots and schedule reminders."
                              : "Tap every glowing hotspot, listen closely, and unlock your completion badge."}
                          </p>
                          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-maroon-100">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r from-[#7c1d2f] to-[#f59e0b] transition-all duration-500 ${
                                role === "teacher" ? "w-4/5" : "w-3/4"
                              }`}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-maroon-700">
                      <span>{role === "teacher" ? "Classes assigned" : "Hotspots completed"}</span>
                      <span>
                        {role === "teacher"
                          ? `${selectedClasses.length} groups`
                          : `${studentAssignments.reduce((total, assignment) => total + (progressMap[assignment.id]?.length ?? 0), 0)} taps`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pt-16">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activityHighlights.map((card) => (
            <div
              key={card.title}
              className={`group rounded-[26px] border border-white/60 bg-gradient-to-br ${card.gradient} p-[1px] shadow-xl transition duration-300 hover:scale-[1.02] hover:brightness-110`}
            >
              <div className="h-full rounded-[26px] bg-white/80 p-6 backdrop-blur">
                <div className="flex flex-col gap-4">
                  <span className="text-4xl">{card.icon}</span>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-maroon-950">{card.title}</h3>
                    <p className="text-sm text-maroon-900/80">{card.description}</p>
                  </div>
                  <div className="mt-auto flex items-center gap-2 text-sm font-semibold text-maroon-900 opacity-0 transition group-hover:opacity-100">
                    Learn more
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 pt-16">
        <div
          className={cn(
            "mx-auto max-w-6xl",
            role === "teacher" ? "grid gap-10 lg:grid-cols-[1.15fr,0.85fr]" : "flex flex-col gap-10",
          )}
        >
          {role === "teacher" && (
            <Card className="border-maroon-100/60 bg-white/80 shadow-xl backdrop-blur">
            <CardHeader className="space-y-2">
              <Badge className="w-fit bg-gradient-to-r from-[#7c1d2f] to-[#d9486e] text-white">Teacher Workspace</Badge>
              <CardTitle className="text-2xl text-maroon-950">Craft a new assignment</CardTitle>
              <CardDescription className="text-maroon-900/80">
                Upload a worksheet, drop interactive audio hotspots, and deliver it to the right class in one flow.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-8" onSubmit={handleCreateAssignment}>
                {formErrors.length > 0 && (
                  <div className="space-y-2 rounded-2xl border border-red-200 bg-red-50/70 p-4 text-sm text-red-900">
                    <p className="font-semibold">We spotted a few things to fix:</p>
                    <ul className="list-disc space-y-1 pl-5">
                      {formErrors.map((error) => (
                        <li key={error}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-semibold text-maroon-900">
                      Assignment title
                    </label>
                    <Input
                      id="title"
                      required
                      placeholder="e.g. Tajweed Listening Practice"
                      value={formData.title}
                      onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
                      className="h-11 rounded-xl border-maroon-200 bg-white/80 focus-visible:ring-maroon-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="dueDate" className="text-sm font-semibold text-maroon-900">
                      Due date
                    </label>
                    <Input
                      id="dueDate"
                      type="date"
                      required
                      value={formData.dueDate}
                      onChange={(event) => setFormData((prev) => ({ ...prev, dueDate: event.target.value }))}
                      className="h-11 rounded-xl border-maroon-200 bg-white/80 focus-visible:ring-maroon-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="dueTime" className="text-sm font-semibold text-maroon-900">
                      Due time
                    </label>
                    <Input
                      id="dueTime"
                      type="time"
                      value={formData.dueTime}
                      onChange={(event) => setFormData((prev) => ({ ...prev, dueTime: event.target.value }))}
                      className="h-11 rounded-xl border-maroon-200 bg-white/80 focus-visible:ring-maroon-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="notes" className="text-sm font-semibold text-maroon-900">
                      Optional notes
                    </label>
                    <Input
                      id="notes"
                      placeholder="Add reminders or tajweed focus areas"
                      value={formData.notes}
                      onChange={(event) => setFormData((prev) => ({ ...prev, notes: event.target.value }))}
                      className="h-11 rounded-xl border-maroon-200 bg-white/80 focus-visible:ring-maroon-400"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-semibold text-maroon-900">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    required
                    rows={4}
                    placeholder="Explain the learning goal and how students should interact with the hotspots."
                    value={formData.description}
                    onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
                    className="rounded-xl border-maroon-200 bg-white/80 focus-visible:ring-maroon-400"
                  />
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-maroon-900">Assign to classes</p>
                      <span className="text-xs font-medium uppercase text-maroon-700">Select one or more</span>
                    </div>
                    <div className="space-y-3 rounded-2xl border border-maroon-100 bg-white/70 p-4">
                      {classOptions.map((classItem) => (
                        <label key={classItem.id} className="flex items-center justify-between gap-3 text-sm text-maroon-900">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              id={`class-${classItem.id}`}
                              checked={selectedClasses.includes(classItem.id)}
                              onCheckedChange={(value) => handleClassToggle(classItem.id, value)}
                            />
                            <span className="font-medium">{classItem.name}</span>
                          </div>
                          {selectedClasses.includes(classItem.id) && (
                            <Badge className="bg-gradient-to-r from-[#7c1d2f] to-[#d9486e] text-white">Included</Badge>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-maroon-900">Or select individual students</p>
                      <span className="text-xs font-medium uppercase text-maroon-700">Optional</span>
                    </div>
                    <div className="space-y-3 rounded-2xl border border-maroon-100 bg-white/70 p-4">
                      {studentOptions.map((student) => (
                        <label key={student.id} className="flex items-center justify-between gap-3 text-sm text-maroon-900">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              id={`student-${student.id}`}
                              checked={selectedStudents.includes(student.id)}
                              onCheckedChange={(value) => handleStudentToggle(student.id, value)}
                            />
                            <span className="font-medium">{student.name}</span>
                          </div>
                          {selectedStudents.includes(student.id) && (
                            <Badge variant="secondary" className="rounded-full bg-maroon-100 text-maroon-900">
                              Targeted
                            </Badge>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-maroon-900">Worksheet & hotspots</p>
                      <p className="text-xs text-maroon-900/70">
                        Upload a worksheet image, then click "Place hotspot" and tap the worksheet where students should interact.
                      </p>
                    </div>
                    <label className="inline-flex cursor-pointer items-center gap-3 rounded-full border border-maroon-200 bg-white/80 px-4 py-2 text-sm font-semibold text-maroon-900 shadow-sm hover:bg-white">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => handleImageSelection(event.target.files?.[0] ?? null)}
                      />
                      <Wand2 className="h-4 w-4" /> Upload worksheet
                    </label>
                  </div>
                  <div
                    ref={hotspotCanvasRef}
                    className={`relative w-full overflow-hidden rounded-3xl border border-dashed border-maroon-200 bg-white/70 p-4 ${
                      selectedImage ? "cursor-crosshair" : "cursor-not-allowed"
                    }`}
                    onClick={handleHotspotPlacement}
                    aria-label="Hotspot placement area"
                  >
                    {selectedImage ? (
                      <div className="relative">
                        <Image
                          src={selectedImage}
                          alt="Selected assignment worksheet"
                          width={900}
                          height={600}
                          unoptimized
                          className="w-full rounded-2xl object-contain shadow-inner"
                        />
                        {hotspots.map((hotspot) => {
                          const isSelected = hotspot.id === selectedHotspotId
                          return (
                            <button
                              key={hotspot.id}
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation()
                                setSelectedHotspotId(hotspot.id)
                              }}
                              className={`absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 shadow-lg transition ${
                                isSelected
                                  ? "border-[#7c1d2f] bg-[#7c1d2f]/90 text-white"
                                  : "border-[#d9486e] bg-[#fbe3df]/90 text-[#7c1d2f] hover:border-[#7c1d2f]"
                              }`}
                              style={{
                                left: `${hotspot.x}%`,
                                top: `${hotspot.y}%`,
                                width: `${hotspot.width}%`,
                                height: `${hotspot.height}%`,
                              }}
                              aria-label={`Hotspot: ${hotspot.label}`}
                            >
                              <MousePointerClick className="h-5 w-5" />
                            </button>
                          )
                        })}
                        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/30"></div>
                      </div>
                    ) : (
                      <div className="flex h-56 flex-col items-center justify-center gap-3 text-center text-sm text-maroon-900/70">
                        <Wand2 className="h-8 w-8 text-maroon-700" />
                        <p>Upload a worksheet to begin placing interactive hotspots.</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      type="button"
                      disabled={!selectedImage}
                      onClick={() => setIsAddingHotspot(true)}
                      className="rounded-full border-0 bg-gradient-to-r from-[#7c1d2f] to-[#d9486e] px-6 py-2 text-white disabled:opacity-70"
                    >
                      Place hotspot
                    </Button>
                    {isAddingHotspot && <span className="text-sm font-semibold text-maroon-800">Tap the worksheet to place the hotspot.</span>}
                  </div>
                  {hotspots.length > 0 ? (
                    <div className="space-y-4 rounded-2xl border border-maroon-100 bg-white/80 p-4">
                      <p className="text-sm font-semibold text-maroon-900">Hotspot details</p>
                      <div className="space-y-4">
                        {hotspots.map((hotspot) => {
                          const isSelected = hotspot.id === selectedHotspotId
                          return (
                            <div
                              key={hotspot.id}
                              className={`rounded-2xl border p-4 shadow-sm transition ${
                                isSelected ? "border-[#7c1d2f] bg-[#fff2ee]" : "border-maroon-100 bg-white"
                              }`}
                            >
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <Badge className="bg-gradient-to-r from-[#7c1d2f] to-[#d9486e] text-white">{hotspot.label}</Badge>
                                  <span className="text-xs text-maroon-900/70">
                                    x:{hotspot.x.toFixed(0)}% • y:{hotspot.y.toFixed(0)}%
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-maroon-900/70">
                                  <label className="flex items-center gap-2">
                                    W
                                    <input
                                      type="number"
                                      min={6}
                                      max={30}
                                      value={Math.round(hotspot.width)}
                                      onChange={(event) =>
                                        updateHotspot(hotspot.id, { width: Number(event.target.value) })
                                      }
                                      className="h-9 w-16 rounded-lg border border-maroon-200 bg-white px-2"
                                    />
                                  </label>
                                  <label className="flex items-center gap-2">
                                    H
                                    <input
                                      type="number"
                                      min={6}
                                      max={30}
                                      value={Math.round(hotspot.height)}
                                      onChange={(event) =>
                                        updateHotspot(hotspot.id, { height: Number(event.target.value) })
                                      }
                                      className="h-9 w-16 rounded-lg border border-maroon-200 bg-white px-2"
                                    />
                                  </label>
                                </div>
                              </div>
                              <div className="mt-4 grid gap-3 md:grid-cols-2">
                                <div className="space-y-2">
                                  <label className="text-xs font-semibold uppercase text-maroon-800">Label</label>
                                  <Input
                                    value={hotspot.label}
                                    onChange={(event) => updateHotspot(hotspot.id, { label: event.target.value })}
                                    className="h-10 rounded-xl border-maroon-200 bg-white/80 focus-visible:ring-maroon-400"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-xs font-semibold uppercase text-maroon-800">Description</label>
                                  <Input
                                    value={hotspot.description}
                                    onChange={(event) => updateHotspot(hotspot.id, { description: event.target.value })}
                                    className="h-10 rounded-xl border-maroon-200 bg-white/80 focus-visible:ring-maroon-400"
                                  />
                                </div>
                              </div>
                              <div className="mt-4 flex flex-wrap items-center gap-3">
                                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-maroon-200 bg-white px-3 py-2 text-xs font-semibold text-maroon-900 shadow-sm">
                                  <input
                                    type="file"
                                    accept="audio/*"
                                    className="hidden"
                                    onChange={(event) =>
                                      handleHotspotAudioUpload(hotspot.id, event.target.files?.[0] ?? null)
                                    }
                                  />
                                  <Headphones className="h-4 w-4" /> Attach audio
                                </label>
                                {hotspot.audioUrl ? (
                                  <Badge variant="secondary" className="rounded-full bg-emerald-100 text-emerald-700">
                                    Audio ready
                                  </Badge>
                                ) : (
                                  <span className="text-xs text-maroon-900/70">No audio yet</span>
                                )}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  className="text-xs text-red-600 hover:bg-red-50"
                                  onClick={() => removeHotspot(hotspot.id)}
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-maroon-100 bg-white/70 p-4 text-sm text-maroon-900/70">
                      No hotspots yet — click "Place hotspot" and tap the worksheet to begin.
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="submit"
                    className="rounded-full border-0 bg-gradient-to-r from-[#7c1d2f] via-[#aa243d] to-[#f59e0b] px-8 py-3 text-base font-semibold text-white shadow-lg transition hover:scale-[1.01]"
                  >
                    Publish assignment
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full border border-maroon-200 bg-white/80 px-6 py-3 text-base font-semibold text-maroon-900"
                    onClick={resetForm}
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </CardContent>
            </Card>
          )}

          {role === "student" && (
            <Card className="border-maroon-100/60 bg-white/80 shadow-xl backdrop-blur">
              <CardHeader className="space-y-2">
                <Badge className="w-fit bg-gradient-to-r from-[#7c1d2f] to-[#d9486e] text-white">Assignment Page</Badge>
                <CardTitle className="text-2xl text-maroon-950">Hotspots prepared by your teacher</CardTitle>
                <CardDescription className="text-maroon-900/80">
                  Interactive hotspots are created here by your teacher. Review them in the assignments below as they are published.
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          <div className="space-y-6">
            <Card className="border-maroon-100/60 bg-white/80 shadow-xl backdrop-blur">
              <CardHeader className="space-y-2">
                <Badge className="w-fit bg-gradient-to-r from-[#7c1d2f] to-[#d9486e] text-white">Teacher Overview</Badge>
                <CardTitle className="text-xl text-maroon-950">Assigned lessons</CardTitle>
                <CardDescription className="text-maroon-900/80">
                  Track each assignment and see which students have completed their hotspots.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingAssignments ? (
                  <div className="flex items-center gap-3 rounded-2xl border border-maroon-100 bg-white/70 px-4 py-5 text-maroon-900">
                    <Loader2 className="h-5 w-5 animate-spin text-maroon-700" />
                    Loading assignments...
                  </div>
                ) : fetchError ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50/70 px-4 py-5 text-sm text-red-800">
                    {fetchError}
                  </div>
                ) : assignments.length === 0 ? (
                  <div className="rounded-2xl border border-maroon-100 bg-white/70 px-4 py-5 text-sm text-maroon-900/70">
                    No assignments yet. Create your first interactive lesson using the form.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignments.slice(0, 4).map((assignment) => {
                      const completedHotspots = progressMap[assignment.id]?.length ?? 0
                      const totalHotspots = assignment.hotspots.length
                      const completionRatio = totalHotspots > 0 ? Math.round((completedHotspots / totalHotspots) * 100) : 0
                      return (
                        <div
                          key={assignment.id}
                          className="rounded-2xl border border-maroon-100 bg-white px-4 py-4 shadow-sm transition hover:border-[#7c1d2f] hover:shadow-lg"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <h3 className="text-sm font-semibold text-maroon-950">{assignment.title}</h3>
                              <p className="text-xs text-maroon-900/70">{assignment.description.slice(0, 90)}...</p>
                            </div>
                            <Badge
                              className={`rounded-full px-3 py-1 text-xs ${
                                assignment.status === "completed"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {assignment.status === "completed" ? "Completed" : "Active"}
                            </Badge>
                          </div>
                          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-maroon-900/70">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4 text-maroon-700" />
                              Due {new Date(assignment.dueDate).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2">
                              <Headphones className="h-4 w-4 text-maroon-700" />
                              {completedHotspots}/{totalHotspots} hotspots completed
                            </div>
                          </div>
                          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-maroon-100">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#7c1d2f] to-[#f59e0b]"
                              style={{ width: `${completionRatio}%` }}
                            ></div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-maroon-100/60 bg-white/80 shadow-xl backdrop-blur">
              <CardHeader className="space-y-2">
                <Badge className="w-fit bg-gradient-to-r from-[#7c1d2f] to-[#d9486e] text-white">Student Spotlight</Badge>
                <CardTitle className="text-xl text-maroon-950">Interactive progress</CardTitle>
                <CardDescription className="text-maroon-900/80">
                  Monitor how students interact with each hotspot and celebrate their milestones.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {studentAssignments.length === 0 ? (
                    <div className="rounded-2xl border border-maroon-100 bg-white/70 px-4 py-5 text-sm text-maroon-900/70">
                      Assignments will appear here once they are published.
                    </div>
                  ) : (
                    studentAssignments.slice(0, 3).map((assignment) => {
                      const completedHotspots = progressMap[assignment.id]?.length ?? 0
                      const totalHotspots = assignment.hotspots.length
                      const isComplete = totalHotspots > 0 && completedHotspots === totalHotspots
                      return (
                        <div
                          key={`spotlight-${assignment.id}`}
                          className={`rounded-2xl border px-4 py-4 shadow-sm transition hover:shadow-lg ${
                            isComplete ? "border-emerald-200 bg-emerald-50" : "border-maroon-100 bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-maroon-950">{assignment.title}</p>
                              <p className="text-xs text-maroon-900/70">
                                {completedHotspots}/{totalHotspots} hotspots complete
                              </p>
                            </div>
                            {isComplete ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            ) : (
                              <Headphones className="h-5 w-5 text-maroon-700" />
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="px-4 pt-16">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="flex flex-col gap-3">
            <Badge className="w-fit bg-gradient-to-r from-[#7c1d2f] to-[#d9486e] text-white">Student dashboard</Badge>
            <h2 className="text-3xl font-black text-maroon-950">Assignments waiting for you</h2>
            <p className="max-w-3xl text-maroon-900/80">
              Tap an assignment to explore the worksheet, listen to your teacher's audio hotspots, and watch your progress bar fill up
              with every successful interaction.
            </p>
          </div>
          {eggChallengeEnabled && (
            <div className="grid gap-6 lg:grid-cols-[1.3fr,0.7fr]">
              <EggChallengeWidget state={eggChallengeState} />
              <div className="flex h-full flex-col justify-between gap-6 rounded-3xl border border-white/60 bg-white/80 p-6 text-maroon-900 shadow-xl backdrop-blur">
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-maroon-950">How to hatch your egg companion</h3>
                  <p className="text-sm text-maroon-900/80">
                    Each hotspot you complete adds fresh verses to the Break the Egg challenge. Stay consistent and the celebration will follow.
                  </p>
                </div>
                <div className="space-y-3 text-sm text-maroon-900/80">
                  <div className="flex items-center gap-3">
                    <MousePointerClick className="h-4 w-4 text-maroon-700" />
                    Tap glowing hotspots to earn verse credits.
                  </div>
                  <div className="flex items-center gap-3">
                    <Headphones className="h-4 w-4 text-maroon-700" />
                    Listen to each audio prompt before moving on.
                  </div>
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-4 w-4 text-maroon-700" />
                    Reach 100% and enjoy the confetti when your egg cracks.
                  </div>
                </div>
                <p className="rounded-2xl bg-amber-50/70 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-amber-700">
                  Hotspot completions count automatically—no extra submissions needed.
                </p>
              </div>
            </div>
          )}
          {isLoadingAssignments ? (
            <div className="flex items-center gap-3 rounded-3xl border border-maroon-100 bg-white/80 px-5 py-6 text-maroon-900">
              <Loader2 className="h-5 w-5 animate-spin text-maroon-700" />
              Loading assignments...
            </div>
          ) : studentAssignments.length === 0 ? (
            <div className="rounded-3xl border border-maroon-100 bg-white/80 px-5 py-6 text-sm text-maroon-900/70">
              No assignments yet. Your teacher will share an activity soon.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {studentAssignments.map((assignment) => {
                const completedHotspots = progressMap[assignment.id]?.length ?? 0
                const totalHotspots = assignment.hotspots.length
                const isComplete = totalHotspots > 0 && completedHotspots === totalHotspots
                return (
                  <div
                    key={assignment.id}
                    className={`group rounded-[26px] border border-white/80 bg-gradient-to-br from-white via-[#fff8f3] to-[#fde5da] p-[1px] shadow-xl transition hover:scale-[1.02] ${
                      isComplete ? "ring-2 ring-emerald-400" : ""
                    }`}
                  >
                    <div className="flex h-full flex-col rounded-[26px] bg-white/80 p-6 backdrop-blur">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-3xl">{isComplete ? "🎉" : "🎧"}</span>
                        <Badge
                          className={`rounded-full px-3 py-1 text-xs ${
                            isComplete ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {isComplete ? "Completed" : "In progress"}
                        </Badge>
                      </div>
                      <div className="mt-5 space-y-3">
                        <h3 className="text-lg font-semibold text-maroon-950">{assignment.title}</h3>
                        <p className="text-sm text-maroon-900/80">{assignment.description}</p>
                        <div className="flex items-center gap-2 text-xs text-maroon-900/70">
                          <CalendarIcon className="h-4 w-4 text-maroon-700" /> Due {new Date(assignment.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-maroon-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#7c1d2f] via-[#aa243d] to-[#f59e0b] transition-all duration-500"
                          style={{ width: `${totalHotspots > 0 ? (completedHotspots / totalHotspots) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <div className="mt-5 flex items-center justify-between text-sm font-semibold text-maroon-900">
                        <span>{completedHotspots}/{totalHotspots} hotspots</span>
                        <Button
                          type="button"
                          onClick={() => setOpenAssignmentId(assignment.id)}
                          className="rounded-full border-0 bg-gradient-to-r from-[#7c1d2f] to-[#d9486e] px-4 py-2 text-sm text-white shadow-md"
                        >
                          Open
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <Dialog open={Boolean(selectedAssignment)} onOpenChange={(open) => setOpenAssignmentId(open ? selectedAssignment?.id ?? null : null)}>
        <DialogContent className="max-w-4xl border-none bg-gradient-to-br from-white via-[#fff8f3] to-[#fde5da] p-0 text-maroon-950">
          {selectedAssignment && (
            <div className="grid gap-0 overflow-hidden rounded-xl lg:grid-cols-2">
              <div className="relative bg-white/70 p-6">
                <DialogHeader className="text-left">
                  <Badge className="w-fit bg-gradient-to-r from-[#7c1d2f] to-[#d9486e] text-white">Assignment</Badge>
                  <DialogTitle className="text-2xl font-bold text-maroon-950">{selectedAssignment.title}</DialogTitle>
                  <DialogDescription className="text-sm text-maroon-900/80">
                    {selectedAssignment.description}
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-6 space-y-3 text-sm text-maroon-900/80">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-maroon-700" />
                    Due {new Date(selectedAssignment.dueDate).toLocaleString()}
                  </div>
                  {selectedAssignment.notes && <p className="rounded-2xl bg-maroon-50/70 p-3">{selectedAssignment.notes}</p>}
                  <p className="text-xs uppercase tracking-wide text-maroon-700">Hotspot checklist</p>
                  <div className="space-y-2 rounded-2xl border border-maroon-100 bg-white/80 p-3">
                    {selectedAssignment.hotspots.map((hotspot) => {
                      const isComplete = (progressMap[selectedAssignment.id] ?? []).includes(hotspot.id)
                      return (
                        <div key={hotspot.id} className="flex items-start gap-3">
                          <span className={`mt-1 h-4 w-4 rounded-full ${isComplete ? "bg-emerald-500" : "bg-amber-400"}`}></span>
                          <div>
                            <p className="text-sm font-semibold text-maroon-950">{hotspot.label}</p>
                            <p className="text-xs text-maroon-900/70">{hotspot.description}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
              <div className="relative bg-gradient-to-br from-[#7c1d2f]/10 via-[#fbe3df] to-[#fff8f3] p-6">
                <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/80 shadow-inner">
                  {selectedAssignment.image ? (
                    <div className="relative">
                      <Image
                        src={selectedAssignment.image}
                        alt="Assignment worksheet"
                        width={800}
                        height={600}
                        unoptimized
                        className="h-full w-full object-contain"
                      />
                      {selectedAssignment.hotspots.map((hotspot) => {
                        const isComplete = (progressMap[selectedAssignment.id] ?? []).includes(hotspot.id)
                        return (
                          <button
                            key={`modal-${hotspot.id}`}
                            type="button"
                            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 p-3 text-sm font-semibold transition ${
                              isComplete
                                ? "border-emerald-400 bg-emerald-100 text-emerald-700"
                                : "border-[#d9486e] bg-[#fbe3df] text-[#7c1d2f] hover:border-[#7c1d2f]"
                            }`}
                            style={{
                              left: `${hotspot.x}%`,
                              top: `${hotspot.y}%`,
                            }}
                            onClick={() => handleHotspotInteraction(selectedAssignment, hotspot)}
                          >
                            {isComplete ? "✓" : "▶"}
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="flex h-80 items-center justify-center text-sm text-maroon-900/70">
                      Worksheet preview unavailable.
                    </div>
                  )}
                </div>
                <p className="mt-4 text-xs text-maroon-900/70">
                  Tap each glowing hotspot to hear your teacher. Once you interact with all hotspots, the assignment is marked as
                  complete automatically.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
