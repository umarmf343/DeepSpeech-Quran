"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"

import AppLayout from "@/components/app-layout"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { clearAssignmentDraft, loadAssignmentDraft, saveAssignmentDraft } from "@/lib/offline-storage"
import type { AssignmentObjective } from "@/types/assignments"
import {
  AlertCircle,
  ArrowLeft,
  AudioLines,
  Eye,
  FileAudio,
  FileImage,
  Loader2,
  Mic,
  Pause,
  Save,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react"

type RecipientType = "class" | "student"

interface TeacherClass {
  id: string
  name: string
  schedule: string
  studentCount: number
}

interface TeacherStudent {
  id: string
  name: string
  classes: string[]
  preferredLanguage: string
}

interface DraftMedia {
  name: string
  type: string
  dataUrl: string
}

interface HotspotDraft {
  id: string
  order: number
  x: number
  y: number
  width: number
  height: number
  instruction: string
  transliteration?: string
  icon?: string
  objective: AssignmentObjective
  textFallback?: string
  linearDescription?: string
  audioUrl?: string
  audioFile?: File
  audioDraft?: DraftMedia
}

interface AssignmentDraftState {
  title: string
  description: string
  mode: "hotspot" | "linear" | "audio"
  recipients: { type: RecipientType; ids: string[] } | null
  image?: DraftMedia
  hotspots: HotspotDraft[]
  consentAcknowledged: boolean
  language: string
}

type SerializableHotspot = Omit<HotspotDraft, "audioFile">

interface StoredAssignmentDraft extends Omit<AssignmentDraftState, "hotspots"> {
  hotspots: SerializableHotspot[]
}

interface AssignmentTemplateOption {
  id: string
  name: string
  imageUrl?: string
  image?: DraftMedia
  hotspots: HotspotDraft[]
  source: "api" | "local"
}

const DRAFT_STORAGE_KEY = "teacher-hotspot-assignment"

const objectiveLabels: Record<AssignmentObjective, string> = {
  makharij: "Letter articulation (Makharij)",
  "tajweed-rule": "Tajweed rule",
  "common-mistake": "Common mistake",
  listening: "Listening comprehension",
  memorization: "Memorization support",
}

const hotspotIcons = ["🌙", "🌬️", "✨", "🌿", "🕊️", "📿", "👂", "📝"]

const reflectionPrompts = [
  "Which sound felt easiest today?",
  "Where would you like more support?",
  "How did you feel while practicing?",
]

function generateId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

async function fileToDraftMedia(file: File): Promise<DraftMedia> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
  return { name: file.name, type: file.type, dataUrl }
}

async function draftMediaToFile(media: DraftMedia, fallbackName: string) {
  const res = await fetch(media.dataUrl)
  const blob = await res.blob()
  return new File([blob], media.name || fallbackName, { type: media.type })
}

export default function CreateAssignmentPage() {
  const [classes, setClasses] = useState<TeacherClass[]>([])
  const [students, setStudents] = useState<TeacherStudent[]>([])
  const [loadingRecipients, setLoadingRecipients] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingHotspotId, setRecordingHotspotId] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingChunksRef = useRef<Blob[]>([])
  const [consentModalOpen, setConsentModalOpen] = useState(false)
  const [consentLogged, setConsentLogged] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [keyboardMode, setKeyboardMode] = useState(false)
  const [cursorPosition, setCursorPosition] = useState({ x: 0.5, y: 0.5 })
  const imageContainerRef = useRef<HTMLDivElement | null>(null)
  const [templates, setTemplates] = useState<AssignmentTemplateOption[]>([])
  const [templateName, setTemplateName] = useState("")
  const [isSavingTemplate, setIsSavingTemplate] = useState(false)

  const [draft, setDraft] = useState<AssignmentDraftState>({
    title: "",
    description: "",
    mode: "hotspot",
    recipients: null,
    hotspots: [],
    consentAcknowledged: false,
    language: "en",
  })

  const activeHotspot = draft.hotspots.find((hotspot) => hotspot.id === activeHotspotId) ?? null

  const canSend = useMemo(() => {
    if (!draft.title || !draft.description || !draft.image) return false
    if (!draft.recipients || draft.recipients.ids.length === 0) return false
    if (!draft.consentAcknowledged) return false
    if (draft.mode === "hotspot" && draft.hotspots.some((hotspot) => !hotspot.audioUrl && !hotspot.audioFile)) {
      return false
    }
    return true
  }, [draft])

  useEffect(() => {
    const hydrate = async () => {
      setLoadingRecipients(true)
      try {
        const [classRes, studentRes, templateRes] = await Promise.all([
          fetch("/api/teacher/classes"),
          fetch("/api/teacher/students"),
          fetch("/api/assignments/templates"),
        ])
        const [classData, studentData, templateData] = await Promise.all([
          classRes.json(),
          studentRes.json(),
          templateRes.json(),
        ])
        setClasses(classData)
        setStudents(studentData)

        const apiTemplates: AssignmentTemplateOption[] = (templateData ?? []).map((template: any) => ({
          id: template.id,
          name: template.name,
          imageUrl: template.imageUrl,
          hotspots: (template.hotspots ?? []).map((hotspot: any, index: number) => ({
            id: hotspot.id ?? generateId("hotspot"),
            order: hotspot.order ?? index + 1,
            x: hotspot.x ?? 0.5,
            y: hotspot.y ?? 0.5,
            width: hotspot.width ?? 0.12,
            height: hotspot.height ?? 0.12,
            instruction: hotspot.instruction ?? "",
            transliteration: hotspot.transliteration,
            icon: hotspot.icon,
            objective: hotspot.objective ?? "makharij",
            textFallback: hotspot.textFallback,
            linearDescription: hotspot.linearDescription,
          })),
          source: "api",
        }))

        const localTemplateRaw = JSON.parse(localStorage.getItem("teacher-assignment-templates") ?? "[]")
        const localTemplates: AssignmentTemplateOption[] = (localTemplateRaw as any[]).map((template) => ({
          id: template.id,
          name: template.name,
          image: template.image,
          hotspots: (template.hotspots ?? []).map((hotspot: any, index: number) => ({
            id: hotspot.id ?? generateId("hotspot"),
            order: hotspot.order ?? index + 1,
            x: hotspot.x ?? 0.5,
            y: hotspot.y ?? 0.5,
            width: hotspot.width ?? 0.12,
            height: hotspot.height ?? 0.12,
            instruction: hotspot.instruction ?? "",
            transliteration: hotspot.transliteration,
            icon: hotspot.icon,
            objective: hotspot.objective ?? "makharij",
            textFallback: hotspot.textFallback,
            linearDescription: hotspot.linearDescription,
            audioUrl: hotspot.audioUrl,
          })),
          source: "local",
        }))

        setTemplates([...apiTemplates, ...localTemplates])
      } finally {
        setLoadingRecipients(false)
      }
    }

    void hydrate()
  }, [])

  useEffect(() => {
    let isMounted = true

    loadAssignmentDraft<StoredAssignmentDraft>(DRAFT_STORAGE_KEY).then(async (stored) => {
      if (!stored || !isMounted) return

      let imageData: string | null = null
      if (stored.image) {
        const file = await draftMediaToFile(stored.image, stored.image.name)
        const preview = URL.createObjectURL(file)
        imageData = preview
      }

      const restoredHotspots: HotspotDraft[] = []
      for (const hotspot of stored.hotspots) {
        let audioFile: File | undefined
        let audioUrl = hotspot.audioUrl
        if (hotspot.audioDraft) {
          audioFile = await draftMediaToFile(hotspot.audioDraft, `${hotspot.id}.m4a`)
          audioUrl = URL.createObjectURL(audioFile)
        }
        restoredHotspots.push({
          ...hotspot,
          audioFile,
          audioUrl,
        })
      }

      setDraft({
        ...stored,
        hotspots: restoredHotspots,
      })
      setImagePreview(imageData)
    })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!consentLogged) {
      setConsentModalOpen(true)
    }
  }, [consentLogged])

  const persistDraft = useCallback(async () => {
    const storedHotspots: SerializableHotspot[] = await Promise.all(
      draft.hotspots.map(async (hotspot) => {
        const clone: SerializableHotspot = { ...hotspot }
        const file = hotspot.audioFile
        delete (clone as Partial<HotspotDraft>).audioFile
        clone.audioDraft = file ? await fileToDraftMedia(file) : hotspot.audioDraft
        return clone
      }),
    )

    const payload: StoredAssignmentDraft = {
      ...draft,
      hotspots: storedHotspots,
    }

    await saveAssignmentDraft(DRAFT_STORAGE_KEY, payload)
  }, [draft])

  useEffect(() => {
    const handle = setTimeout(() => {
      void persistDraft()
    }, 900)

    return () => clearTimeout(handle)
  }, [persistDraft])

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  const updateHotspot = useCallback(
    (id: string, patch: Partial<HotspotDraft>) => {
      setDraft((prev) => ({
        ...prev,
        hotspots: prev.hotspots.map((hotspot) =>
          hotspot.id === id
            ? {
                ...hotspot,
                ...patch,
              }
            : hotspot,
        ),
      }))
    },
    [setDraft],
  )

  const handleImageUpload = async (file: File) => {
    const media = await fileToDraftMedia(file)
    const preview = URL.createObjectURL(file)
    setImagePreview(preview)
    setDraft((prev) => ({
      ...prev,
      image: media,
      hotspots: [],
    }))
    setActiveHotspotId(null)
  }

  const handleHotspotCreation = (x: number, y: number) => {
    const id = generateId("hotspot")
    const newHotspot: HotspotDraft = {
      id,
      order: draft.hotspots.length + 1,
      x,
      y,
      width: 0.12,
      height: 0.12,
      instruction: "Describe the focus for this articulation point.",
      objective: "makharij",
      icon: hotspotIcons[draft.hotspots.length % hotspotIcons.length],
    }
    setDraft((prev) => ({
      ...prev,
      hotspots: [...prev.hotspots, newHotspot],
    }))
    setActiveHotspotId(id)
  }

  const handleImageClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!draft.image) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width
    const y = (event.clientY - bounds.top) / bounds.height
    handleHotspotCreation(Math.min(Math.max(x, 0.02), 0.98), Math.min(Math.max(y, 0.02), 0.98))
  }

  const toggleKeyboardMode = (value: boolean) => {
    setKeyboardMode(value)
  }

  const handleKeyControl = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!keyboardMode) return
    const step = event.shiftKey ? 0.05 : 0.02
    if (event.key === "ArrowUp") {
      event.preventDefault()
      setCursorPosition((prev) => ({ ...prev, y: Math.max(0, prev.y - step) }))
    }
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setCursorPosition((prev) => ({ ...prev, y: Math.min(1, prev.y + step) }))
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault()
      setCursorPosition((prev) => ({ ...prev, x: Math.max(0, prev.x - step) }))
    }
    if (event.key === "ArrowRight") {
      event.preventDefault()
      setCursorPosition((prev) => ({ ...prev, x: Math.min(1, prev.x + step) }))
    }
    if (event.key === "Enter") {
      event.preventDefault()
      handleHotspotCreation(cursorPosition.x, cursorPosition.y)
    }
  }

  const startRecording = async (hotspotId: string) => {
    if (isRecording) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      recordingChunksRef.current = []
      mediaRecorderRef.current = mediaRecorder
      setIsRecording(true)
      setRecordingHotspotId(hotspotId)
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordingChunksRef.current.push(event.data)
        }
      }
      mediaRecorder.onstop = async () => {
        const blob = new Blob(recordingChunksRef.current, { type: "audio/webm" })
        const file = new File([blob], `${hotspotId}.webm`, { type: "audio/webm" })
        const url = URL.createObjectURL(blob)
        updateHotspot(hotspotId, { audioFile: file, audioUrl: url })
        setIsRecording(false)
        setRecordingHotspotId(null)
        stream.getTracks().forEach((track) => track.stop())
      }
      mediaRecorder.start()
    } catch (error) {
      console.error(error)
      setErrorMessage("Unable to access microphone. Please enable audio permissions.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    } else {
      setIsRecording(false)
      setRecordingHotspotId(null)
    }
  }

  const handleAudioUpload = async (hotspotId: string, file: File) => {
    updateHotspot(hotspotId, { audioFile: file, audioUrl: URL.createObjectURL(file) })
  }

  const removeHotspot = (hotspotId: string) => {
    setDraft((prev) => ({
      ...prev,
      hotspots: prev.hotspots.filter((hotspot) => hotspot.id !== hotspotId).map((hotspot, index) => ({
        ...hotspot,
        order: index + 1,
      })),
    }))
    if (activeHotspotId === hotspotId) {
      setActiveHotspotId(null)
    }
  }

  const uploadMedia = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    const response = await fetch("/api/upload", { method: "POST", body: formData })
    if (!response.ok) throw new Error("Upload failed")
    const data = await response.json()
    return data.url as string
  }

  const handleSendAssignment = async () => {
    if (!canSend || !draft.recipients || !draft.image) {
      setErrorMessage("Please complete all required fields before sending.")
      return
    }

    setIsSending(true)
    setErrorMessage(null)

    try {
      const imageFile = await draftMediaToFile(draft.image, draft.image.name)
      const imageUrl = await uploadMedia(imageFile)

      const hotspotPayload = await Promise.all(
        draft.hotspots.map(async (hotspot) => {
          let audioUrl = hotspot.audioUrl
          if (hotspot.audioFile) {
            audioUrl = await uploadMedia(hotspot.audioFile)
          }
          return {
            id: hotspot.id,
            order: hotspot.order,
            x: hotspot.x,
            y: hotspot.y,
            width: hotspot.width,
            height: hotspot.height,
            instruction: hotspot.instruction,
            transliteration: hotspot.transliteration,
            icon: hotspot.icon,
            objective: hotspot.objective,
            textFallback: hotspot.textFallback,
            linearDescription: hotspot.linearDescription,
            audioUrl,
          }
        }),
      )

      const payload = {
        title: draft.title,
        description: draft.description,
        mode: draft.mode,
        imageUrl,
        recipients: draft.recipients,
        hotspots: hotspotPayload,
        consentVersion: "v1",
        status: "sent",
      }

      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Failed to send assignment")
      }

      await clearAssignmentDraft(DRAFT_STORAGE_KEY)
      setConsentLogged(true)
      alert("Assignment sent with mercy and care.")
    } catch (error) {
      console.error(error)
      setErrorMessage("Unable to send assignment. Please try again or check your connection.")
    } finally {
      setIsSending(false)
    }
  }

  const handleSaveTemplate = async () => {
    if (!templateName || !draft.image) return
    setIsSavingTemplate(true)
    try {
      const storedTemplates = JSON.parse(localStorage.getItem("teacher-assignment-templates") ?? "[]")
      const sanitizedHotspots = draft.hotspots.map((hotspot) => {
        const clone = { ...hotspot }
        delete (clone as Partial<HotspotDraft>).audioFile
        return clone
      })
      const templateRecord = {
        id: generateId("template"),
        name: templateName,
        image: draft.image,
        hotspots: sanitizedHotspots,
      }
      storedTemplates.push(templateRecord)
      localStorage.setItem("teacher-assignment-templates", JSON.stringify(storedTemplates))
      setTemplates((prev) => [
        ...prev,
        {
          id: templateRecord.id,
          name: templateRecord.name,
          image: templateRecord.image,
          hotspots: templateRecord.hotspots,
          source: "local" as const,
        },
      ])
      setTemplateName("")
    } finally {
      setIsSavingTemplate(false)
    }
  }

  const applyTemplate = async (template: AssignmentTemplateOption) => {
    if (!template) return
    let templateMedia = template.image
    if (!templateMedia && template.imageUrl) {
      const response = await fetch(template.imageUrl)
      const blob = await response.blob()
      const file = new File([blob], template.imageUrl.split("/").pop() ?? "template.png", { type: blob.type })
      templateMedia = await fileToDraftMedia(file)
    }
    if (!templateMedia) return
    setImagePreview(templateMedia.dataUrl)
    setDraft((prev) => ({
      ...prev,
      image: templateMedia ?? prev.image,
      hotspots: template.hotspots.map((hotspot, index) => ({
        ...hotspot,
        order: index + 1,
        audioFile: undefined,
      })),
    }))
  }

  const consentNotice = (
    <Alert className="border-amber-300 bg-amber-50 text-amber-900">
      <AlertTitle className="flex items-center gap-2 text-sm font-semibold">
        <AudioLines className="h-4 w-4" /> Responsible audio sharing
      </AlertTitle>
      <AlertDescription className="text-sm">
        Your recordings are encrypted and auto-delete after 90 days. Never include personal details in your audio cues.
      </AlertDescription>
    </Alert>
  )

  const hotspotList = (
    <div className="space-y-2">
      {draft.hotspots.map((hotspot) => (
        <button
          key={hotspot.id}
          onClick={() => setActiveHotspotId(hotspot.id)}
          className={cn(
            "flex w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-left text-sm",
            activeHotspotId === hotspot.id
              ? "border-maroon-500 ring-2 ring-maroon-500/40"
              : "border-border hover:border-maroon-300",
          )}
        >
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-maroon-600 text-xs font-semibold text-white">
              {hotspot.order}
            </span>
            <div>
              <div className="font-semibold text-maroon-900">
                {hotspot.icon} {hotspot.instruction.slice(0, 48)}
              </div>
              <p className="text-xs text-maroon-600">{objectiveLabels[hotspot.objective]}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-maroon-600">
            {hotspot.audioUrl || hotspot.audioFile ? (
              <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700">
                <FileAudio className="mr-1 h-3 w-3" /> Audio ready
              </Badge>
            ) : (
              <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">
                <AlertCircle className="mr-1 h-3 w-3" /> Needs audio
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-600 hover:text-red-700"
              onClick={(event) => {
                event.stopPropagation()
                removeHotspot(hotspot.id)
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </button>
      ))}
      {draft.hotspots.length === 0 && (
        <p className="rounded-lg border border-dashed border-maroon-200 bg-maroon-50/40 p-4 text-sm text-maroon-700">
          Click or use the keyboard crosshair on the image to place your first hotspot.
        </p>
      )}
    </div>
  )

  const hotspotEditor = activeHotspot ? (
    <Card className="border border-maroon-200 bg-maroon-50/60">
      <CardHeader>
        <CardTitle className="text-maroon-900">Hotspot {activeHotspot.order}</CardTitle>
        <CardDescription className="text-maroon-700">Add compassionate guidance for this practice point.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="instruction">Instruction</Label>
            <Textarea
              id="instruction"
              value={activeHotspot.instruction}
              onChange={(event) => updateHotspot(activeHotspot.id, { instruction: event.target.value })}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="transliteration">Transliteration</Label>
            <Input
              id="transliteration"
              value={activeHotspot.transliteration ?? ""}
              onChange={(event) => updateHotspot(activeHotspot.id, { transliteration: event.target.value })}
              placeholder="/m/ with nasalization"
            />
            <p className="text-xs text-muted-foreground">Support reverts and multilingual learners.</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="icon">Icon</Label>
            <Select
              value={activeHotspot.icon ?? hotspotIcons[0]}
              onValueChange={(value) => updateHotspot(activeHotspot.id, { icon: value })}
            >
              <SelectTrigger id="icon">
                <SelectValue placeholder="Choose icon" />
              </SelectTrigger>
              <SelectContent>
                {hotspotIcons.map((icon) => (
                  <SelectItem key={icon} value={icon}>
                    <span className="mr-2">{icon}</span> {icon === "🌬️" ? "Breath" : "Symbol"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="objective">Learning objective</Label>
            <Select
              value={activeHotspot.objective}
              onValueChange={(value: AssignmentObjective) => updateHotspot(activeHotspot.id, { objective: value })}
            >
              <SelectTrigger id="objective">
                <SelectValue placeholder="Select objective" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(objectiveLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="textFallback">Text fallback</Label>
          <Textarea
            id="textFallback"
            value={activeHotspot.textFallback ?? ""}
            onChange={(event) => updateHotspot(activeHotspot.id, { textFallback: event.target.value })}
            placeholder="If audio fails, guide the student gently here."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="linearDescription">Linear mode description</Label>
          <Textarea
            id="linearDescription"
            value={activeHotspot.linearDescription ?? ""}
            onChange={(event) => updateHotspot(activeHotspot.id, { linearDescription: event.target.value })}
            placeholder="Describe this instruction for the linear / audio-only mode."
            rows={3}
          />
        </div>

        <div className="rounded-lg border border-dashed border-maroon-200 bg-white/70 p-4">
          <p className="text-sm font-semibold text-maroon-900">Audio guidance</p>
          <p className="text-xs text-maroon-600">
            Record gentle, student-centred instructions. Remind them there is no right or wrong.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {activeHotspot.audioUrl && (
              <audio controls src={activeHotspot.audioUrl} className="w-full rounded-lg bg-white shadow-sm" />
            )}
            <Button
              type="button"
              variant={isRecording && recordingHotspotId === activeHotspot.id ? "destructive" : "secondary"}
              onClick={() =>
                isRecording && recordingHotspotId === activeHotspot.id
                  ? stopRecording()
                  : startRecording(activeHotspot.id)
              }
            >
              {isRecording && recordingHotspotId === activeHotspot.id ? (
                <>
                  <Pause className="mr-2 h-4 w-4" /> Stop recording
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-4 w-4" /> Record audio
                </>
              )}
            </Button>
            <div>
              <Label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-maroon-700">
                <FileAudio className="h-4 w-4" /> Upload audio
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) {
                      void handleAudioUpload(activeHotspot.id, file)
                    }
                  }}
                />
              </Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  ) : (
    <Card className="border border-dashed border-maroon-200 bg-maroon-50/30">
      <CardContent className="p-6 text-sm text-maroon-700">
        Select a hotspot to enrich it with multi-modal guidance.
      </CardContent>
    </Card>
  )

  return (
    <AppLayout>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-16 pt-6">
        <div className="flex items-center gap-3">
          <Link href="/teacher/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
          <Separator orientation="vertical" className="h-6" />
          <h1 className="text-2xl font-bold text-maroon-900">Create a compassionate assignment</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assignment details</CardTitle>
                <CardDescription>
                  Frame the learning journey with clarity, warmth, and multilingual support where needed.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={draft.title}
                    onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
                    placeholder="Makharij focus on ب and م"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={draft.description}
                    onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
                    placeholder="Offer a gentle overview, e.g. We will breathe together, explore the lips, and celebrate effort."
                    rows={3}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Assignment mode</Label>
                    <Select
                      value={draft.mode}
                      onValueChange={(value: "hotspot" | "linear" | "audio") =>
                        setDraft((prev) => ({ ...prev, mode: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hotspot">🖼️ Hotspot mode</SelectItem>
                        <SelectItem value="linear">📜 Linear guidance</SelectItem>
                        <SelectItem value="audio">🔊 Audio-only journey</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Primary language</Label>
                    <Select
                      value={draft.language}
                      onValueChange={(value) => setDraft((prev) => ({ ...prev, language: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ar">Arabic</SelectItem>
                        <SelectItem value="ur">Urdu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {consentNotice}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recipients</CardTitle>
                <CardDescription>Assign only to classes and students entrusted to you.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup
                  value={draft.recipients?.type ?? "class"}
                  onValueChange={(value: RecipientType) =>
                    setDraft((prev) => ({
                      ...prev,
                      recipients: { type: value, ids: [] },
                    }))
                  }
                  className="grid gap-4 sm:grid-cols-2"
                >
                  <Label
                    htmlFor="recipient-class"
                    className={cn(
                      "flex h-full cursor-pointer flex-col gap-2 rounded-lg border p-4",
                      draft.recipients?.type === "class"
                        ? "border-maroon-500 bg-maroon-50/60"
                        : "border-border bg-white",
                    )}
                  >
                    <RadioGroupItem value="class" id="recipient-class" className="sr-only" />
                    <span className="text-sm font-semibold text-maroon-900">Assign to class</span>
                    <span className="text-xs text-maroon-600">
                      Select one or multiple classes you already shepherd.
                    </span>
                  </Label>
                  <Label
                    htmlFor="recipient-student"
                    className={cn(
                      "flex h-full cursor-pointer flex-col gap-2 rounded-lg border p-4",
                      draft.recipients?.type === "student"
                        ? "border-maroon-500 bg-maroon-50/60"
                        : "border-border bg-white",
                    )}
                  >
                    <RadioGroupItem value="student" id="recipient-student" className="sr-only" />
                    <span className="text-sm font-semibold text-maroon-900">Assign to student</span>
                    <span className="text-xs text-maroon-600">
                      Offer personalized scaffolding for individual learners.
                    </span>
                  </Label>
                </RadioGroup>

                <ScrollArea className="max-h-56 rounded-lg border bg-white">
                  <div className="space-y-3 p-3">
                    {loadingRecipients && <p className="text-sm text-muted-foreground">Loading roster…</p>}
                    {!loadingRecipients && draft.recipients?.type === "class" &&
                      classes.map((classItem) => {
                        const checked = draft.recipients?.ids.includes(classItem.id)
                        return (
                          <label
                            key={classItem.id}
                            className="flex cursor-pointer items-start gap-3 rounded-lg p-3 hover:bg-maroon-50/70"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(value) => {
                                setDraft((prev) => ({
                                  ...prev,
                                  recipients: {
                                    type: "class",
                                    ids: value
                                      ? [...(prev.recipients?.ids ?? []), classItem.id]
                                      : prev.recipients?.ids.filter((id) => id !== classItem.id) ?? [],
                                  },
                                }))
                              }}
                            />
                            <div>
                              <p className="text-sm font-semibold text-maroon-900">{classItem.name}</p>
                              <p className="text-xs text-maroon-600">{classItem.schedule}</p>
                              <p className="text-xs text-muted-foreground">{classItem.studentCount} students</p>
                            </div>
                          </label>
                        )
                      })}

                    {!loadingRecipients && draft.recipients?.type === "student" &&
                      students.map((student) => {
                        const checked = draft.recipients?.ids.includes(student.id)
                        return (
                          <label
                            key={student.id}
                            className="flex cursor-pointer items-start gap-3 rounded-lg p-3 hover:bg-maroon-50/70"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(value) => {
                                setDraft((prev) => ({
                                  ...prev,
                                  recipients: {
                                    type: "student",
                                    ids: value
                                      ? [...(prev.recipients?.ids ?? []), student.id]
                                      : prev.recipients?.ids.filter((id) => id !== student.id) ?? [],
                                  },
                                }))
                              }}
                            />
                            <div>
                              <p className="text-sm font-semibold text-maroon-900">{student.name}</p>
                              <p className="text-xs text-maroon-600">
                                {student.classes.map((classId) => classes.find((item) => item.id === classId)?.name).join(", ")}
                              </p>
                              <p className="text-xs text-muted-foreground">Prefers {student.preferredLanguage.toUpperCase()}</p>
                            </div>
                          </label>
                        )
                      })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Interactive workspace</CardTitle>
                <CardDescription>Upload the teaching visual and place hotspots with purpose.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-maroon-700">
                  <FileImage className="h-4 w-4" /> Upload teaching image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) {
                        void handleImageUpload(file)
                      }
                    }}
                  />
                </Label>

                {imagePreview ? (
                  <div
                    className="relative overflow-hidden rounded-xl border border-maroon-200 bg-white"
                    ref={imageContainerRef}
                  >
                    <div
                      role="application"
                      aria-label="Assignment image hotspot canvas"
                      tabIndex={0}
                      onFocus={() => toggleKeyboardMode(true)}
                      onBlur={() => toggleKeyboardMode(false)}
                      onKeyDown={handleKeyControl}
                      className="relative"
                      onClick={handleImageClick}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagePreview}
                        alt="Assignment visual"
                        className="max-h-[480px] w-full object-contain"
                      />
                      {draft.hotspots.map((hotspot) => (
                        <button
                          key={hotspot.id}
                          className={cn(
                            "absolute flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-sm font-semibold",
                            activeHotspotId === hotspot.id
                              ? "border-maroon-600 bg-maroon-600 text-white"
                              : "border-white bg-maroon-500 text-white shadow-lg",
                          )}
                          style={{
                            left: `${hotspot.x * 100}%`,
                            top: `${hotspot.y * 100}%`,
                          }}
                          onClick={(event) => {
                            event.stopPropagation()
                            setActiveHotspotId(hotspot.id)
                          }}
                          aria-label={`Hotspot ${hotspot.order}: ${hotspot.instruction}`}
                        >
                          {hotspot.order}
                        </button>
                      ))}
                      {keyboardMode && (
                        <div
                          className="pointer-events-none absolute h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-maroon-500"
                          style={{ left: `${cursorPosition.x * 100}%`, top: `${cursorPosition.y * 100}%` }}
                        />
                      )}
                    </div>
                    <div className="border-t border-maroon-100 bg-maroon-50/70 p-3 text-xs text-maroon-700">
                      Tab into the canvas to activate keyboard placement. Arrow keys move the crosshair, Enter places a
                      hotspot.
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-maroon-200 bg-maroon-50/40 p-6 text-sm text-maroon-700">
                    Upload a diagram, page, or neutral template to begin. Avoid personal images to maintain student
                    privacy.
                  </div>
                )}

                {hotspotList}
                {hotspotEditor}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Templates & efficiency</CardTitle>
                <CardDescription>Reuse your compassionate scaffolds with ease.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>Save as template</Label>
                  <div className="flex gap-2">
                    <Input
                      value={templateName}
                      onChange={(event) => setTemplateName(event.target.value)}
                      placeholder="e.g., Mouth articulation map"
                    />
                    <Button onClick={handleSaveTemplate} disabled={isSavingTemplate || !templateName || !draft.image}>
                      {isSavingTemplate ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save
                    </Button>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Existing templates</Label>
                  <ScrollArea className="max-h-64 rounded-lg border bg-white">
                    <div className="space-y-2 p-3">
                      {templates.length === 0 && <p className="text-sm text-muted-foreground">No templates yet.</p>}
                      {templates.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => void applyTemplate(template)}
                          className="flex w-full items-center justify-between rounded-lg border border-maroon-200 bg-maroon-50/60 px-3 py-2 text-left text-sm text-maroon-900 hover:bg-maroon-100"
                        >
                          <span>{template.name}</span>
                          <Sparkles className="h-4 w-4" />
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Consent & wellbeing</CardTitle>
                <CardDescription>Honour the amanah. Gentle reminders keep everyone safe.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-maroon-700">
                <p>
                  Students will see: <em>Practice only – no right or wrong. May Allah accept your effort.</em>
                </p>
                <div className="flex items-start gap-2">
                  <Checkbox
                    checked={draft.consentAcknowledged}
                    onCheckedChange={(value) => setDraft((prev) => ({ ...prev, consentAcknowledged: Boolean(value) }))}
                    id="consent"
                  />
                  <Label htmlFor="consent" className="text-sm">
                    I understand these recordings delete after 90 days and contain no personal data.
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reflection prompts</CardTitle>
                <CardDescription>Encourage journaling once students complete multiple assignments.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {reflectionPrompts.map((prompt, index) => (
                  <div key={prompt} className="rounded-lg border border-maroon-100 bg-maroon-50/50 p-3 text-sm text-maroon-800">
                    <span className="font-semibold">Prompt {index + 1}:</span> {prompt}
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="sticky bottom-4 rounded-2xl border border-maroon-200 bg-white p-4 shadow-xl">
              {errorMessage && (
                <Alert variant="destructive" className="mb-3">
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-muted-foreground">
                  Autosaves to your device every few breaths. Drafts restore even offline.
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" onClick={() => setIsPreviewOpen(true)}>
                    <Eye className="mr-2 h-4 w-4" /> Preview student view
                  </Button>
                  <Button variant="outline" onClick={() => void persistDraft()}>
                    <Save className="mr-2 h-4 w-4" /> Save draft
                  </Button>
                  <Button onClick={handleSendAssignment} disabled={!canSend || isSending} className="bg-maroon-600 text-white">
                    {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}Send with mercy
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Student experience preview</DialogTitle>
            <DialogDescription>
              Hotspots are keyboard navigable. Audio is lazy-loaded. Text instructions offer dignity-centred fallbacks.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {imagePreview ? (
              <div className="relative overflow-hidden rounded-xl border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Preview" className="max-h-[420px] w-full object-contain" />
                {draft.hotspots.map((hotspot) => (
                  <button
                    key={hotspot.id}
                    className="absolute flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-maroon-600 text-sm font-semibold text-white"
                    style={{ left: `${hotspot.x * 100}%`, top: `${hotspot.y * 100}%` }}
                  >
                    {hotspot.order}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Upload an image to preview the hotspot experience.</p>
            )}
            <div className="space-y-3">
              {draft.hotspots.map((hotspot) => (
                <div key={hotspot.id} className="rounded-lg border border-maroon-200 bg-white p-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-maroon-900">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-maroon-600 text-xs text-white">
                      {hotspot.order}
                    </span>
                    <span>
                      {hotspot.icon} {hotspot.instruction}
                    </span>
                  </div>
                  <p className="text-xs text-maroon-600">{hotspot.transliteration}</p>
                  <p className="mt-1 text-sm text-maroon-800">{hotspot.textFallback}</p>
                  {hotspot.audioUrl && <audio controls src={hotspot.audioUrl} className="mt-2 w-full" />}
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsPreviewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={consentModalOpen} onOpenChange={setConsentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Audio sharing amanah</DialogTitle>
            <DialogDescription>
              You are recording sacred learning. Clips encrypt in transit, stay for 90 days, and never include personal
              identifiers. Continue with this trust?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => {
                setConsentLogged(true)
                setConsentModalOpen(false)
              }}
            >
              I understand and will honour it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
