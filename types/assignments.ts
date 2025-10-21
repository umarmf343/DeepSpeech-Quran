export type AssignmentRecipient =
  | { type: "class"; ids: string[] }
  | { type: "student"; ids: string[] }

export type AssignmentObjective =
  | "makharij"
  | "tajweed-rule"
  | "common-mistake"
  | "listening"
  | "memorization"

export type AssignmentMode = "hotspot" | "linear" | "audio"

export interface AssignmentHotspot {
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
  audioUrl?: string
  textFallback?: string
  linearDescription?: string
}

export interface AssignmentTemplate {
  id: string
  name: string
  imageUrl: string
  hotspots: AssignmentHotspot[]
}

export interface AssignmentMediaConsent {
  consentedAt: string
  consentVersion: string
}

export interface Assignment {
  id: string
  title: string
  description?: string
  imageUrl?: string
  mode: AssignmentMode
  teacherId?: string
  teacherName?: string
  createdBy?: string
  recipients: AssignmentRecipient
  hotspots: AssignmentHotspot[]
  createdAt: string
  status: "draft" | "sent" | "archived"
  expiresAt?: string
  objectivesSummary?: Record<AssignmentObjective, number>
  consent?: AssignmentMediaConsent
  consentVersion?: string
}

export interface StudentHotspotSubmission {
  id: string
  hotspotId: string
  audioUrl?: string
  reflection?: string
  createdAt: string
  status: "submitted" | "reviewed"
}

export interface StudentAssignmentProgress {
  assignmentId: string
  studentId: string
  lastOpenedAt?: string
  submissions: StudentHotspotSubmission[]
  reflectionUnlocked?: boolean
}
