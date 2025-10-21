"use client";

import Image from "next/image";
import type { DragEvent, FormEvent, MouseEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

interface Hotspot {
  id: string;
  label: string;
  x: number;
  y: number;
  size: number;
  audioUrl: string;
}

interface Assignment {
  id: string;
  title: string;
  className: string;
  scope: "all" | "selected";
  notes: string;
  description?: string;
  resource: {
    fileName: string;
    preview?: string | null;
  };
  hotspots: Hotspot[];
  createdAt: string;
}

type Role = "teacher" | "student";

type FormState = {
  className: string;
  scope: "all" | "selected";
  title: string;
  notes: string;
  description: string;
};

const classOptions = [
  "Level 1 Qa'idah",
  "Level 2 Qa'idah",
  "Advanced Recitation",
  "After-school Enrichment",
];

const learningHighlights = [
  {
    title: "Personalized audio feedback",
    description:
      "Students receive tailored tajwīd corrections with every submission, helping them master articulation effortlessly.",
    icon: "🎧",
  },
  {
    title: "Teacher-curated milestones",
    description:
      "Each lesson is handpicked by the teacher to match the learner's confidence, from letters to fluent recitation.",
    icon: "🌟",
  },
  {
    title: "Celebrate every victory",
    description:
      "Badges and reflections mark consistent practice, encouraging a joyful learning journey together.",
    icon: "🎉",
  },
];

const placeholderAudio =
  "https://cdn.pixabay.com/download/audio/2022/10/11/audio_5cc932c9b2.mp3?filename=gentle-guitar-ambient-122863.mp3";

export default function QaidahPage() {
  const [role, setRole] = useState<Role>("teacher");
  const [formState, setFormState] = useState<FormState>({
    className: "",
    scope: "all",
    title: "",
    notes: "",
    description: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(
    null,
  );
  const [isCreatingHotspot, setIsCreatingHotspot] = useState(false);
  const [newHotspotLabel, setNewHotspotLabel] = useState("Pronunciation");
  const [newHotspotAudio, setNewHotspotAudio] = useState(placeholderAudio);
  const [newHotspotSize, setNewHotspotSize] = useState(64);
  const hotspotImageRef = useRef<HTMLDivElement | null>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let ignore = false;
    const fetchAssignments = async () => {
      setLoadingAssignments(true);
      try {
        const response = await fetch("/api/qaidah");
        if (!response.ok) {
          throw new Error("Unable to load assignments");
        }
        const data = await response.json();
        if (!ignore && Array.isArray(data.assignments)) {
          setAssignments(data.assignments);
        }
      } catch (error) {
        console.error(error);
        if (!ignore) {
          setErrorMessages([
            "We could not load your Qa'idah lessons. Please refresh or try again shortly.",
          ]);
        }
      } finally {
        if (!ignore) {
          setLoadingAssignments(false);
        }
      }
    };

    fetchAssignments();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === "string") {
          setFilePreview(event.target.result);
        }
      };
      reader.readAsDataURL(file);
      return () => {
        reader.abort();
      };
    }
    setFilePreview(null);
  }, [file]);

  const handleRoleSwitch = (value: Role) => {
    setRole(value);
    setIsCreatingHotspot(false);
  };

  const handleInputChange = (
    field: keyof FormState,
    value: string | FormState["scope"],
  ) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const selected = files[0];
    setFile(selected);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    handleFileSelect(event.dataTransfer.files);
  };

  const validateForm = () => {
    const nextErrors: string[] = [];
    if (!formState.title.trim()) {
      nextErrors.push("Please provide an assignment title.");
    }
    if (!formState.className.trim()) {
      nextErrors.push("Choose the class you are assigning the lesson to.");
    }
    if (!filePreview) {
      nextErrors.push("Attach at least one resource or page for students to review.");
    }
    return nextErrors;
  };

  const resetForm = () => {
    setFormState({
      className: "",
      scope: "all",
      title: "",
      notes: "",
      description: "",
    });
    setFile(null);
    setFilePreview(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateForm();
    setErrorMessages(validation);
    if (validation.length > 0) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/qaidah", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formState.title,
          className: formState.className,
          scope: formState.scope,
          notes: formState.notes,
          description: formState.description,
          resource: {
            fileName: file?.name ?? "lesson-resource",
            preview: filePreview,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save assignment");
      }

      const data = await response.json();
      if (data?.assignment) {
        setAssignments((prev) => [data.assignment, ...prev]);
        resetForm();
        setErrorMessages(["Assignment published for your students ✨"]);
      }
    } catch (error) {
      console.error(error);
      setErrorMessages([
        "Something went wrong while saving. Please retry after checking your connection.",
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setModalOpen(true);
    setIsCreatingHotspot(false);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedAssignment(null);
    setIsCreatingHotspot(false);
  };

  const handleHotspotCreate = (event: MouseEvent<HTMLDivElement>) => {
    if (!isCreatingHotspot || !selectedAssignment) return;
    if (!hotspotImageRef.current) return;

    const bounds = hotspotImageRef.current.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;

    const freshHotspot: Hotspot = {
      id: `${selectedAssignment.id}-${Date.now()}`,
      label: newHotspotLabel || "Hotspot",
      x,
      y,
      size: newHotspotSize,
      audioUrl: newHotspotAudio || placeholderAudio,
    };

    setAssignments((prev) =>
      prev.map((assignment) =>
        assignment.id === selectedAssignment.id
          ? {
              ...assignment,
              hotspots: [...assignment.hotspots, freshHotspot],
            }
          : assignment,
      ),
    );

    setSelectedAssignment((prev) =>
      prev
        ? {
            ...prev,
            hotspots: [...prev.hotspots, freshHotspot],
          }
        : prev,
    );
  };

  const handleHotspotRemove = (hotspotId: string) => {
    if (!selectedAssignment) return;
    setAssignments((prev) =>
      prev.map((assignment) =>
        assignment.id === selectedAssignment.id
          ? {
              ...assignment,
              hotspots: assignment.hotspots.filter((spot) => spot.id !== hotspotId),
            }
          : assignment,
      ),
    );
    setSelectedAssignment((prev) =>
      prev
        ? {
            ...prev,
            hotspots: prev.hotspots.filter((spot) => spot.id !== hotspotId),
          }
        : prev,
    );
  };

  const playHotspotAudio = (audioUrl: string) => {
    try {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
      }
      const audio = new Audio(audioUrl);
      activeAudioRef.current = audio;
      void audio.play();
    } catch (error) {
      console.warn("Unable to start audio playback", error);
    }
  };

  const studentAssignments = useMemo(() => {
    if (role === "teacher") return assignments;
    return assignments.filter(
      (assignment) => assignment.scope === "all" || assignment.scope === "selected",
    );
  }, [assignments, role]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12">
      <div
        id="alfawz-qaidah"
        className="relative overflow-hidden rounded-[34px] bg-gradient-to-br from-[#571222] via-[#7a1a31] to-[#f4e6d8] p-[1px] shadow-2xl"
      >
        <div className="rounded-[34px] bg-white/90 p-6 md:p-10">
          <header className="flex flex-col items-center gap-6 text-center">
            <span className="inline-flex animate-ping-slow items-center gap-2 rounded-full bg-rose-100/90 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-[#571222] shadow-inner">
              <span className="h-2 w-2 rounded-full bg-[#7a1a31]" />
              <span className="qaidah-hero-badge">Teacher curated Qa'idah flow</span>
            </span>

            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/80 text-4xl shadow-inner">
              📚
            </span>

            <div className="space-y-3">
              <h1 className="text-3xl font-black text-[#571222] md:text-4xl">
                Your Qa’idah hub – lessons handpicked by your teacher
              </h1>
              <p className="text-base text-[#3c0d1b]/80 md:text-lg">
                Explore immersive lesson plans, audio-supported practice hotspots, and warm feedback loops designed to guide every learner from the alphabet to fluent recitation.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {(["teacher", "student"] as Role[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleRoleSwitch(value)}
                  className={`rounded-full px-5 py-2 text-sm font-semibold transition-transform duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7a1a31] ${role === value ? "bg-[#7a1a31] text-white shadow-lg" : "bg-white/70 text-[#571222] shadow"}`}
                  aria-pressed={role === value}
                >
                  {value === "teacher" ? "Teacher view" : "Student view"}
                </button>
              ))}
            </div>
          </header>

          <section className="mt-12 grid gap-6 md:grid-cols-3">
            {learningHighlights.map((highlight) => (
              <article
                key={highlight.title}
                className="group flex flex-col gap-4 rounded-[30px] bg-gradient-to-br from-rose-200 via-fuchsia-200 to-sky-200 p-[1px] shadow-xl transition-transform duration-300 hover:scale-[1.02]"
              >
                <div className="flex h-full flex-col gap-4 rounded-[30px] bg-white/95 p-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-2xl shadow-inner">
                    {highlight.icon}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-[#571222]">
                      {highlight.title}
                    </h3>
                    <p className="text-sm text-[#3c0d1b]/80">
                      {highlight.description}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </section>

          {role === "teacher" && (
            <section className="mt-12">
              <div className="rounded-[30px] bg-white/95 p-6 shadow-xl">
                <div className="flex flex-col gap-2">
                  <h2 className="text-2xl font-bold text-[#571222]">
                    Assign a new Qa'idah lesson
                  </h2>
                  <p className="text-sm text-[#3c0d1b]/80">
                    Share focused lesson plans with your learners. Upload a page or worksheet, highlight listening hotspots, and send warm notes of encouragement.
                  </p>
                </div>

                <form
                  className="mt-6 grid gap-6"
                  onSubmit={handleSubmit}
                  aria-live="polite"
                  aria-busy={isSubmitting}
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="flex flex-col gap-2 text-sm font-medium text-[#571222]">
                      Class selection
                      <select
                        value={formState.className}
                        onChange={(event) =>
                          handleInputChange("className", event.target.value)
                        }
                        className="w-full rounded-lg border border-gray-300 bg-white/90 p-3 text-base text-gray-800 shadow-sm transition-transform duration-200 hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-[#7a1a31]"
                        required
                      >
                        <option value="">Choose your class</option>
                        {classOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>

                    <fieldset className="flex flex-col gap-2 text-sm font-medium text-[#571222]">
                      <legend>Assignment scope</legend>
                      <div className="flex flex-wrap gap-4 rounded-2xl bg-rose-50/70 p-4">
                        <label className="flex items-center gap-2 text-sm font-semibold text-[#3c0d1b]/80">
                          <input
                            type="radio"
                            name="assignment-scope"
                            value="all"
                            checked={formState.scope === "all"}
                            onChange={(event) =>
                              handleInputChange("scope", event.target.value as FormState["scope"])
                            }
                            className="h-4 w-4 accent-[#7a1a31]"
                          />
                          All Students
                        </label>
                        <label className="flex items-center gap-2 text-sm font-semibold text-[#3c0d1b]/80">
                          <input
                            type="radio"
                            name="assignment-scope"
                            value="selected"
                            checked={formState.scope === "selected"}
                            onChange={(event) =>
                              handleInputChange("scope", event.target.value as FormState["scope"])
                            }
                            className="h-4 w-4 accent-[#7a1a31]"
                          />
                          Selected Students
                        </label>
                      </div>
                    </fieldset>
                  </div>

                  <label className="flex flex-col gap-2 text-sm font-medium text-[#571222]">
                    Assignment title
                    <input
                      type="text"
                      value={formState.title}
                      onChange={(event) => handleInputChange("title", event.target.value)}
                      placeholder="Eg. Revise lesson 8 – connecting letters"
                      className="w-full rounded-lg border border-gray-300 bg-white/90 p-3 text-base text-gray-800 shadow-sm transition-transform duration-200 hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-[#7a1a31]"
                      required
                    />
                  </label>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="flex flex-col gap-2 text-sm font-medium text-[#571222]">
                      Encouraging note
                      <input
                        type="text"
                        value={formState.notes}
                        onChange={(event) => handleInputChange("notes", event.target.value)}
                        placeholder="Remind learners what to focus on"
                        className="w-full rounded-lg border border-gray-300 bg-white/90 p-3 text-base text-gray-800 shadow-sm transition-transform duration-200 hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-[#7a1a31]"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-medium text-[#571222]">
                      Additional details
                      <textarea
                        value={formState.description}
                        onChange={(event) =>
                          handleInputChange("description", event.target.value)
                        }
                        placeholder="Add pronunciation tips or timing cues"
                        rows={4}
                        className="w-full rounded-lg border border-gray-300 bg-white/90 p-3 text-base text-gray-800 shadow-sm transition-transform duration-200 hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-[#7a1a31]"
                      />
                    </label>
                  </div>

                  <div
                    className={`flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-[#7a1a31]/40 bg-gradient-to-br from-rose-50 via-white to-amber-50 p-6 text-center transition-all duration-300 ${dragActive ? "scale-[1.02] border-[#7a1a31] shadow-xl" : "shadow"}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <p className="text-sm font-semibold text-[#571222]">
                      Drag and drop lesson pages or click to upload
                    </p>
                    <p className="text-xs text-[#3c0d1b]/80">
                      PDFs, images, or audio cues up to 10MB. The first image becomes your hotspot canvas.
                    </p>
                    <label className="relative inline-flex cursor-pointer items-center justify-center rounded-full bg-[#7a1a31] px-4 py-2 text-sm font-semibold text-white shadow-lg transition-transform duration-200 hover:scale-[1.05] focus-within:outline-none focus-within:ring-2 focus-within:ring-[#7a1a31]">
                      Browse files
                      <input
                        type="file"
                        accept="image/*,application/pdf,audio/*"
                        className="sr-only"
                        onChange={(event) => handleFileSelect(event.target.files)}
                      />
                    </label>
                    {file && (
                      <p className="text-xs text-[#3c0d1b]/80">
                        Selected: {file.name}
                      </p>
                    )}
                    {filePreview && (
                      <div className="mt-4 w-full rounded-2xl bg-white/80 p-4 shadow-inner">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#571222]">
                          Preview
                        </p>
                        <div className="relative mt-3 aspect-[4/3] w-full overflow-hidden rounded-2xl">
                          <Image
                            src={filePreview}
                            alt="Lesson preview"
                            fill
                            className="object-cover"
                            sizes="(min-width: 768px) 480px, 100vw"
                            unoptimized
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center rounded-full bg-[#7a1a31] px-6 py-3 text-sm font-semibold text-white shadow-xl transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7a1a31] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSubmitting ? "Publishing lesson…" : "Publish assignment"}
                    </button>
                    {errorMessages.length > 0 && (
                      <ul className="list-inside list-disc text-left text-sm text-[#571222]">
                        {errorMessages.map((message, index) => (
                          <li key={`${message}-${index}`}>{message}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </form>
              </div>
            </section>
          )}

          <section className="mt-12">
            <header className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold text-[#571222]">
                {role === "teacher" ? "Recent Qa'idah assignments" : "Your latest Qa'idah focus"}
              </h2>
              <p className="text-sm text-[#3c0d1b]/80">
                {role === "teacher"
                  ? "Tap a card to open the modal, add hotspots, and preview the student experience."
                  : "Open a lesson to explore listening hotspots, notes from your teacher, and practice audio."}
              </p>
            </header>

            <div
              className="mt-6 grid gap-6 md:grid-cols-2"
              aria-live="polite"
              aria-busy={loadingAssignments}
            >
              {loadingAssignments && (
                <div className="col-span-full flex items-center justify-center rounded-3xl bg-white/80 p-10 text-[#571222]">
                  Loading Qa'idah lessons…
                </div>
              )}

              {!loadingAssignments && studentAssignments.length === 0 && (
                <div className="col-span-full rounded-3xl bg-white/80 p-8 text-center text-sm text-[#3c0d1b]/80">
                  No assignments yet. {role === "teacher" ? "Publish your first lesson to get started." : "Your teacher will share a lesson here soon."}
                </div>
              )}

              {studentAssignments.map((assignment) => (
                <article
                  key={assignment.id}
                  className="flex h-full flex-col justify-between gap-4 rounded-[30px] bg-white/95 p-6 shadow-xl transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-[#7a1a31]">
                      <span>{assignment.className}</span>
                      <span>{new Date(assignment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-xl font-bold text-[#571222]">
                      {assignment.title}
                    </h3>
                    <p className="text-sm text-[#3c0d1b]/80">
                      {assignment.notes || assignment.description || "Open to review lesson notes and hotspots."}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => openModal(assignment)}
                    className="inline-flex w-full items-center justify-center rounded-full bg-[#7a1a31] px-5 py-2 text-sm font-semibold text-white shadow-lg transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7a1a31]"
                  >
                    Open activity
                  </button>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>

      {modalOpen && selectedAssignment && (
        <div
          id="alfawz-qaidah-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="qaidah-modal-title"
        >
          <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[34px] bg-white/95 shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between border-b border-white/40 bg-gradient-to-r from-[#571222] via-[#7a1a31] to-rose-200 px-6 py-4 text-white">
              <div>
                <h3 id="qaidah-modal-title" className="text-xl font-bold">
                  {selectedAssignment.title}
                </h3>
                <p className="text-sm text-white/80">
                  {selectedAssignment.className} • {selectedAssignment.scope === "all" ? "All students" : "Selected students"}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-transform duration-200 hover:scale-[1.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Close
              </button>
            </div>

            <div className="grid gap-6 overflow-y-auto p-6 md:grid-cols-[1.2fr_1fr]">
              <section className="flex flex-col gap-4">
                <div
                  ref={hotspotImageRef}
                  className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-[30px] bg-rose-50/80"
                  onClick={handleHotspotCreate}
                  role={isCreatingHotspot ? "application" : "img"}
                  aria-label="Lesson hotspot canvas"
                >
                  {selectedAssignment.resource.preview ? (
                    <Image
                      src={selectedAssignment.resource.preview}
                      alt="Uploaded lesson resource"
                      fill
                      className="object-contain"
                      sizes="(min-width: 768px) 640px, 100vw"
                      priority
                      unoptimized={
                        selectedAssignment.resource.preview?.startsWith("data:") ?? false
                      }
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-center text-sm text-[#3c0d1b]/80">
                      No preview available. Upload an image to map hotspots.
                    </div>
                  )}

                  {selectedAssignment.hotspots.map((hotspot) => (
                    <button
                      key={hotspot.id}
                      type="button"
                      onClick={() => playHotspotAudio(hotspot.audioUrl)}
                      className="group absolute flex items-center justify-center rounded-full bg-[#7a1a31] text-white shadow-lg transition-transform duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      style={{
                        left: `${hotspot.x}%`,
                        top: `${hotspot.y}%`,
                        width: `${hotspot.size}px`,
                        height: `${hotspot.size}px`,
                        transform: "translate(-50%, -50%)",
                      }}
                      aria-label={`Play audio for ${hotspot.label}`}
                    >
                      <span className="pointer-events-none text-xs font-semibold">
                        {hotspot.label}
                      </span>
                      <span className="pointer-events-none absolute inline-flex h-full w-full animate-ping rounded-full bg-[#7a1a31]/40" />
                    </button>
                  ))}
                </div>

                <div className="rounded-3xl bg-rose-50/70 p-4 text-sm text-[#3c0d1b]/80">
                  <p className="font-semibold text-[#571222]">Teacher notes</p>
                  <p>{selectedAssignment.notes || "Review the marked hotspots and listen carefully."}</p>
                  {selectedAssignment.description && (
                    <p className="mt-2 text-xs text-[#571222]">
                      {selectedAssignment.description}
                    </p>
                  )}
                </div>
              </section>

              <aside className="flex flex-col gap-6 rounded-[30px] bg-white/80 p-4 shadow-inner">
                <div>
                  <h4 className="text-lg font-semibold text-[#571222]">
                    Activity tools
                  </h4>
                  <p className="text-xs text-[#3c0d1b]/80">
                    {role === "teacher"
                      ? "Toggle hotspot mode to place interactive listening points. Students tap them to hear guidance."
                      : "Tap a hotspot on the lesson page to hear guidance from your teacher."}
                  </p>
                </div>

                {role === "teacher" && (
                  <div className="flex flex-col gap-4 rounded-2xl bg-rose-50/80 p-4">
                    <label className="flex items-center justify-between gap-3 text-sm font-semibold text-[#571222]">
                      <span>Hotspot mode</span>
                      <button
                        type="button"
                        onClick={() => setIsCreatingHotspot((prev) => !prev)}
                        className={`rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wide transition-transform duration-200 hover:scale-[1.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7a1a31] ${isCreatingHotspot ? "bg-[#7a1a31] text-white" : "bg-white text-[#7a1a31] shadow"}`}
                        aria-pressed={isCreatingHotspot}
                      >
                        {isCreatingHotspot ? "Active" : "Inactive"}
                      </button>
                    </label>

                    <label className="flex flex-col gap-2 text-xs font-semibold text-[#571222]">
                      Hotspot label
                      <input
                        type="text"
                        value={newHotspotLabel}
                        onChange={(event) => setNewHotspotLabel(event.target.value)}
                        className="rounded-lg border border-gray-200 bg-white p-2 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7a1a31]"
                      />
                    </label>

                    <label className="flex flex-col gap-2 text-xs font-semibold text-[#571222]">
                      Audio URL
                      <input
                        type="url"
                        value={newHotspotAudio}
                        onChange={(event) => setNewHotspotAudio(event.target.value)}
                        className="rounded-lg border border-gray-200 bg-white p-2 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7a1a31]"
                        placeholder="https://"
                      />
                    </label>

                    <label className="flex flex-col gap-2 text-xs font-semibold text-[#571222]">
                      Size ({newHotspotSize}px)
                      <input
                        type="range"
                        min={36}
                        max={120}
                        value={newHotspotSize}
                        onChange={(event) => setNewHotspotSize(Number(event.target.value))}
                        className="accent-[#7a1a31]"
                      />
                    </label>
                  </div>
                )}

                <div className="space-y-3">
                  <h5 className="text-sm font-semibold text-[#571222]">
                    Hotspots
                  </h5>
                  {selectedAssignment.hotspots.length === 0 ? (
                    <p className="text-xs text-[#3c0d1b]/70">
                      {role === "teacher"
                        ? "Enable hotspot mode and click the lesson image to add the first hotspot."
                        : "Watch for glowing markers on the lesson page—tap to listen."}
                    </p>
                  ) : (
                    <ul className="space-y-2 text-xs text-[#3c0d1b]/80">
                      {selectedAssignment.hotspots.map((hotspot) => (
                        <li
                          key={hotspot.id}
                          className="flex items-center justify-between gap-2 rounded-xl bg-rose-100/80 px-3 py-2"
                        >
                          <span className="font-semibold text-[#571222]">
                            {hotspot.label}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => playHotspotAudio(hotspot.audioUrl)}
                              className="rounded-full bg-[#7a1a31] px-3 py-1 text-xs font-semibold text-white shadow hover:scale-[1.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7a1a31]"
                            >
                              Play
                            </button>
                            {role === "teacher" && (
                              <button
                                type="button"
                                onClick={() => handleHotspotRemove(hotspot.id)}
                                className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#7a1a31] shadow hover:scale-[1.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7a1a31]"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
