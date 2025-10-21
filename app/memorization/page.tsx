"use client"

import { useEffect, useMemo, useState } from "react"
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
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  PlusCircle,
  Radio,
  Repeat2,
  Sparkles,
} from "lucide-react"
import Link from "next/link"

interface SurahSummary {
  number: number
  englishName: string
  englishNameTranslation: string
  numberOfAyahs: number
}

interface VerseDetail {
  numberInSurah: number
  arabicText: string
  translation: string
}

interface MemorizationPlan {
  id: string
  surahNumber: number
  surahName: string
  startAyah: number
  endAyah: number
  totalVerses: number
  completed: boolean
}

interface PlanProgressState {
  currentVerse: number
  repeatCount: number
  completed: boolean
}

const REPEAT_TARGET = 20

export default function MemorizationPage() {
  const [surahs, setSurahs] = useState<SurahSummary[]>([])
  const [surahLoading, setSurahLoading] = useState(false)
  const [surahError, setSurahError] = useState<string | null>(null)

  const [plans, setPlans] = useState<MemorizationPlan[]>([])
  const [planProgress, setPlanProgress] = useState<Record<string, PlanProgressState>>({})
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)

  const [verses, setVerses] = useState<VerseDetail[]>([])
  const [verseLoading, setVerseLoading] = useState(false)
  const [verseError, setVerseError] = useState<string | null>(null)

  const [currentVerseIndex, setCurrentVerseIndex] = useState(0)
  const [repeatCount, setRepeatCount] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [showPlanDropdown, setShowPlanDropdown] = useState(false)
  const [planDropdownOpen, setPlanDropdownOpen] = useState(false)
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<string>("")
  const [startAyah, setStartAyah] = useState("")
  const [endAyah, setEndAyah] = useState("")
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        setSurahLoading(true)
        const response = await fetch("https://api.alquran.cloud/v1/surah")
        const payload = await response.json()

        if (!response.ok || payload.code !== 200) {
          throw new Error("Unable to load surah list. Please try again later.")
        }

        const surahData: SurahSummary[] = payload.data.map((surah: any) => ({
          number: surah.number,
          englishName: surah.englishName,
          englishNameTranslation: surah.englishNameTranslation,
          numberOfAyahs: surah.numberOfAyahs,
        }))

        setSurahs(surahData)
        setSurahError(null)
      } catch (error) {
        console.error(error)
        setSurahError("Failed to fetch the list of surahs. Please refresh the page.")
      } finally {
        setSurahLoading(false)
      }
    }

    fetchSurahs()
  }, [])

  useEffect(() => {
    const loadPlanVerses = async () => {
      if (!selectedPlanId) {
        setVerses([])
        setVerseError(null)
        return
      }

      const activePlan = plans.find((plan) => plan.id === selectedPlanId)
      if (!activePlan) {
        return
      }

      try {
        setVerseLoading(true)
        setVerseError(null)

        const response = await fetch(
          `https://api.alquran.cloud/v1/surah/${activePlan.surahNumber}/editions/quran-uthmani,en.asad`,
        )
        const payload = await response.json()

        if (!response.ok || payload.code !== 200 || !Array.isArray(payload.data)) {
          throw new Error("Unable to load verses for this plan. Please try again.")
        }

        const arabicEdition = payload.data[0]
        const translationEdition = payload.data[1]

        const startIndex = activePlan.startAyah - 1
        const endIndex = activePlan.endAyah - 1

        const selectedAyahs: VerseDetail[] = arabicEdition.ayahs
          .slice(startIndex, endIndex + 1)
          .map((ayah: any, index: number) => ({
            numberInSurah: ayah.numberInSurah,
            arabicText: ayah.text,
            translation: translationEdition?.ayahs?.[startIndex + index]?.text ?? "",
          }))

        setVerses(selectedAyahs)

        const progressState = planProgress[activePlan.id] ?? {
          currentVerse: 0,
          repeatCount: 0,
          completed: false,
        }

        const safeVerseIndex = Math.min(progressState.currentVerse, Math.max(selectedAyahs.length - 1, 0))
        setCurrentVerseIndex(safeVerseIndex)
        setRepeatCount(progressState.repeatCount ?? 0)
      } catch (error) {
        console.error(error)
        setVerseError("We could not fetch the verses. Please check your connection and retry.")
      } finally {
        setVerseLoading(false)
      }
    }

    loadPlanVerses()
  }, [selectedPlanId, plans, planProgress])

  const activePlan = useMemo(() => plans.find((plan) => plan.id === selectedPlanId) ?? null, [plans, selectedPlanId])

  const handleCreatePlan = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedSurahNumber) {
      setFormError("Please choose a surah to memorize.")
      return
    }

    const surah = surahs.find((item) => item.number === Number(selectedSurahNumber))
    if (!surah) {
      setFormError("The selected surah was not found.")
      return
    }

    const start = Number(startAyah)
    const end = Number(endAyah)

    if (!Number.isInteger(start) || !Number.isInteger(end)) {
      setFormError("Please enter a valid start and end ayah number.")
      return
    }

    if (start < 1 || end < 1 || start > surah.numberOfAyahs || end > surah.numberOfAyahs) {
      setFormError(`Please choose ayah numbers between 1 and ${surah.numberOfAyahs}.`)
      return
    }

    if (start > end) {
      setFormError("The start ayah must come before the end ayah.")
      return
    }

    const newPlan: MemorizationPlan = {
      id: `plan-${Date.now()}`,
      surahNumber: surah.number,
      surahName: surah.englishName,
      startAyah: start,
      endAyah: end,
      totalVerses: end - start + 1,
      completed: false,
    }

    setPlans((previous) => [...previous, newPlan])
    setPlanProgress((previous) => ({
      ...previous,
      [newPlan.id]: { currentVerse: 0, repeatCount: 0, completed: false },
    }))

    setSelectedPlanId(newPlan.id)
    setStartAyah("")
    setEndAyah("")
    setSelectedSurahNumber("")
    setFormError(null)
    setIsCreateDialogOpen(false)
    setShowPlanDropdown(true)
    setPlanDropdownOpen(true)
  }

  const updatePlanProgress = (planId: string, state: Partial<PlanProgressState>) => {
    setPlanProgress((previous) => ({
      ...previous,
      [planId]: {
        currentVerse: state.currentVerse ?? previous[planId]?.currentVerse ?? 0,
        repeatCount: state.repeatCount ?? previous[planId]?.repeatCount ?? 0,
        completed: state.completed ?? previous[planId]?.completed ?? false,
      },
    }))
  }

  const handleRepeat = () => {
    if (!activePlan || verseLoading || activePlan.completed) return
    const nextCount = Math.min(REPEAT_TARGET, repeatCount + 1)
    setRepeatCount(nextCount)
    updatePlanProgress(activePlan.id, { repeatCount: nextCount })
  }

  const handlePrevious = () => {
    if (!activePlan || verseLoading || activePlan.completed) return
    if (currentVerseIndex === 0) return

    const nextIndex = currentVerseIndex - 1
    setCurrentVerseIndex(nextIndex)
    setRepeatCount(0)
    updatePlanProgress(activePlan.id, { currentVerse: nextIndex, repeatCount: 0, completed: false })
    setShowCelebration(false)
  }

  const markPlanCompleted = (planId: string) => {
    setPlans((previous) => previous.map((plan) => (plan.id === planId ? { ...plan, completed: true } : plan)))
    updatePlanProgress(planId, {
      currentVerse: verses.length,
      repeatCount: REPEAT_TARGET,
      completed: true,
    })
    setRepeatCount(REPEAT_TARGET)
    setShowCelebration(true)
  }

  const handleNext = () => {
    if (!activePlan || verseLoading || activePlan.completed) return
    if (verses.length === 0) return

    if (repeatCount < REPEAT_TARGET) {
      return
    }

    if (currentVerseIndex < verses.length - 1) {
      const nextIndex = currentVerseIndex + 1
      setCurrentVerseIndex(nextIndex)
      setRepeatCount(0)
      updatePlanProgress(activePlan.id, { currentVerse: nextIndex, repeatCount: 0, completed: false })
    } else {
      markPlanCompleted(activePlan.id)
    }
  }

  const activeVerse = verses[currentVerseIndex] ?? null
  const progressPercent = !activePlan || verses.length === 0
    ? 0
    : activePlan.completed
      ? 100
      : Math.min(100, ((currentVerseIndex + (repeatCount >= REPEAT_TARGET ? 1 : 0)) / verses.length) * 100)

  const nextAvailablePlan = useMemo(() => {
    if (!activePlan) return null
    const currentIndex = plans.findIndex((plan) => plan.id === activePlan.id)
    const orderedPlans = plans
      .slice(currentIndex + 1)
      .concat(plans.slice(0, currentIndex))
      .filter((plan) => !plan.completed)
    return orderedPlans[0] ?? null
  }, [activePlan, plans])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50">
      <header className="border-b border-emerald-100 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3 text-emerald-600">
              <Sparkles className="h-6 w-6" />
              <span className="text-sm font-semibold uppercase tracking-wide">Memorization Studio</span>
            </div>
            <h1 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">Build your personalised Qur'an plans</h1>
            <p className="mt-2 max-w-2xl text-base text-slate-600">
              Craft focused memorization plans, repeat each ayah with intention, and celebrate as you progress through the Noble
              Qur&apos;an.
            </p>
          </div>
          <Link href="/dashboard" className="inline-flex">
            <Button variant="outline" className="border-emerald-200 bg-white/80 text-emerald-700 hover:bg-emerald-50">
              <BookOpen className="mr-2 h-4 w-4" /> Back to dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 lg:flex-row">
        <Card className="h-fit w-full border-emerald-100/80 bg-white/80 shadow-sm lg:w-[320px]">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg font-semibold text-slate-900">
              Memorization plans
              <Button
                size="sm"
                className="rounded-full bg-emerald-500 px-3 text-xs font-semibold text-white hover:bg-emerald-600"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <PlusCircle className="mr-1 h-4 w-4" /> Create plan
              </Button>
            </CardTitle>
            <CardDescription className="text-sm text-slate-600">
              Build as many targeted plans as you like. Select one to begin memorising.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {surahLoading && plans.length === 0 ? (
              <div className="flex items-center justify-center rounded-lg border border-dashed border-emerald-200 bg-emerald-50/60 p-6 text-emerald-700">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading surah list...
              </div>
            ) : plans.length === 0 ? (
              <div className="rounded-lg border border-dashed border-emerald-200 bg-emerald-50/60 p-6 text-center">
                <p className="text-sm font-medium text-emerald-800">No plans yet</p>
                <p className="mt-1 text-sm text-emerald-700">Create your first plan to get started.</p>
                <Button
                  size="sm"
                  className="mt-4 rounded-full bg-emerald-500 px-4 text-xs font-semibold text-white hover:bg-emerald-600"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <PlusCircle className="mr-1 h-4 w-4" /> Create plan
                </Button>
              </div>
            ) : (
              <ScrollArea className="max-h-[520px] pr-2">
                <div className="space-y-3">
                  {plans.map((plan) => {
                    const isActive = plan.id === selectedPlanId
                    const planState = planProgress[plan.id]
                    const planCurrentVerse = planState?.currentVerse ?? 0
                    const planRepeatCount = planState?.repeatCount ?? 0
                    const completedVerses = plan.completed
                      ? plan.totalVerses
                      : Math.min(
                          plan.totalVerses,
                          planCurrentVerse + (planRepeatCount >= REPEAT_TARGET ? 1 : 0),
                        )
                    const planProgressValue = plan.totalVerses > 0 ? (completedVerses / plan.totalVerses) * 100 : 0
                    return (
                      <button
                        key={plan.id}
                        onClick={() => {
                          setSelectedPlanId(plan.id)
                          setShowCelebration(false)
                        }}
                        className={cn(
                          "w-full rounded-xl border bg-white px-4 py-4 text-left shadow-sm transition-all",
                          "hover:border-emerald-300 hover:shadow-md",
                          isActive ? "border-emerald-400 ring-2 ring-emerald-200" : "border-emerald-100",
                          plan.completed ? "bg-emerald-50" : "",
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{plan.surahName}</p>
                            <p className="text-xs text-slate-500">Ayah {plan.startAyah} – {plan.endAyah}</p>
                          </div>
                          <span
                            className={cn(
                              "mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border",
                              isActive ? "border-emerald-500" : "border-slate-300",
                              plan.completed ? "bg-emerald-500 text-white" : "bg-white",
                            )}
                          >
                            {plan.completed ? <CheckCircle2 className="h-4 w-4" /> : <Radio className="h-3 w-3" />}
                          </span>
                        </div>
                        <div className="mt-3">
                          <Progress className="h-1.5 rounded-full bg-emerald-100" value={plan.completed ? 100 : planProgressValue} />
                        </div>
                      </button>
                    )
                  })}
                </div>
              </ScrollArea>
            )}
            {surahError && (
              <p className="mt-4 text-xs font-medium text-red-600">{surahError}</p>
            )}
          </CardContent>
        </Card>

        <div className="flex-1 space-y-6">
          <Card className="border-emerald-100/80 bg-white/80 shadow-sm">
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-slate-900">
                    {activePlan
                      ? `${activePlan.surahName} • Ayah ${activePlan.startAyah} – ${activePlan.endAyah}`
                      : "Select a plan"}
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-600">
                    {activePlan
                      ? "Repeat each ayah with focus. The next ayah unlocks after 20 repetitions."
                      : "Choose a memorization plan on the left or create a new one to begin."}
                  </CardDescription>
                </div>
                {showPlanDropdown && plans.length > 0 && (
                  <Select
                    open={planDropdownOpen}
                    onOpenChange={setPlanDropdownOpen}
                    value={selectedPlanId ?? undefined}
                    onValueChange={(value) => {
                      setSelectedPlanId(value)
                      setPlanDropdownOpen(false)
                      setShowCelebration(false)
                    }}
                  >
                    <SelectTrigger className="w-full border-emerald-200 focus:border-emerald-400 focus:ring-emerald-200 md:w-64">
                      <SelectValue placeholder="Choose a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.surahName} • Ayah {plan.startAyah} – {plan.endAyah}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pb-8">
              {!activePlan ? (
                <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50/60 p-8 text-center">
                  <p className="text-sm font-medium text-emerald-900">Nothing selected</p>
                  <p className="mt-1 text-sm text-emerald-700">Select a plan or create a new one to display verses.</p>
                  <Button
                    size="sm"
                    className="mt-4 rounded-full bg-emerald-500 px-4 text-xs font-semibold text-white hover:bg-emerald-600"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    <PlusCircle className="mr-1 h-4 w-4" /> Create plan
                  </Button>
                </div>
              ) : verseLoading ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-emerald-100 bg-white/80 p-12 text-emerald-700">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <p className="text-sm">Loading verses for this plan...</p>
                </div>
              ) : verseError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
                  <p className="text-sm font-medium">{verseError}</p>
                </div>
              ) : verses.length === 0 ? (
                <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50/60 p-8 text-center text-emerald-800">
                  <p className="text-sm font-medium">No verses found for this range.</p>
                  <p className="mt-1 text-sm text-emerald-700">Edit the plan to choose a valid ayah range.</p>
                </div>
              ) : !activeVerse ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
                  <p className="text-sm font-medium">We couldn&apos;t display this ayah. Please try reloading the plan.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3 text-xs text-emerald-600">
                      <span>Ayah {activeVerse.numberInSurah} of {activePlan.endAyah - activePlan.startAyah + 1}</span>
                      <span>Repetitions {repeatCount}/{REPEAT_TARGET}</span>
                    </div>
                    <p className="text-3xl leading-relaxed text-slate-900 md:text-[2.25rem]">{activeVerse.arabicText}</p>
                    <p className="text-base leading-relaxed text-slate-600">{activeVerse.translation}</p>
                  </div>

                  <div className="space-y-4">
                    <Progress className="h-2 rounded-full bg-emerald-100" value={progressPercent} />
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-medium text-slate-600">
                        Verse {currentVerseIndex + 1} of {verses.length}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 pb-6 md:pb-8">
                          <Button
                            variant="outline"
                            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            onClick={handlePrevious}
                            disabled={currentVerseIndex === 0 || verseLoading || activePlan.completed}
                          >
                          <ChevronLeft className="mr-2 h-4 w-4" /> Previous ayah
                        </Button>
                        <Button
                          className="bg-emerald-500 text-white hover:bg-emerald-600"
                          onClick={handleRepeat}
                          disabled={repeatCount >= REPEAT_TARGET || verseLoading || activePlan.completed}
                        >
                          <Repeat2 className="mr-2 h-4 w-4" /> Repeat
                        </Button>
                        <Button
                          variant="secondary"
                          className="bg-emerald-600 text-white hover:bg-emerald-700"
                          onClick={handleNext}
                          disabled={repeatCount < REPEAT_TARGET || verseLoading || activePlan.completed}
                        >
                          {currentVerseIndex === verses.length - 1 ? (
                            <>
                              Finish plan <CheckCircle2 className="ml-2 h-4 w-4" />
                            </>
                          ) : (
                            <>
                              Next ayah <ChevronRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md border-emerald-100 bg-white/90">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900">Create a memorization plan</DialogTitle>
            <DialogDescription className="text-sm text-slate-600">
              Choose a surah and the ayah range you would like to focus on. You can add as many plans as you need.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleCreatePlan}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Surah</label>
              <Select value={selectedSurahNumber} onValueChange={setSelectedSurahNumber}>
                <SelectTrigger className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-200">
                  <SelectValue placeholder={surahLoading ? "Loading..." : "Select a surah"} />
                </SelectTrigger>
                <SelectContent>
                  {surahs.map((surah) => (
                    <SelectItem key={surah.number} value={String(surah.number)}>
                      {surah.number}. {surah.englishName} ({surah.numberOfAyahs} ayat)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Start ayah</label>
                <Input
                  type="number"
                  min={1}
                  value={startAyah}
                  onChange={(event) => setStartAyah(event.target.value)}
                  className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">End ayah</label>
                <Input
                  type="number"
                  min={1}
                  value={endAyah}
                  onChange={(event) => setEndAyah(event.target.value)}
                  className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-200"
                />
              </div>
            </div>
            {selectedSurahNumber && (
              <p className="text-xs text-slate-500">
                {surahs.find((surah) => surah.number === Number(selectedSurahNumber))?.englishNameTranslation} • up to{" "}
                {surahs.find((surah) => surah.number === Number(selectedSurahNumber))?.numberOfAyahs ?? 0} ayat
              </p>
            )}
            {formError && <p className="text-sm font-medium text-red-600">{formError}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-500 text-white hover:bg-emerald-600">
                Save plan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showCelebration} onOpenChange={setShowCelebration}>
        <DialogContent showCloseButton={false} className="max-w-md border-none bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <DialogHeader>
            <div className="flex flex-col items-center gap-3 text-center">
              <Sparkles className="h-10 w-10" />
              <DialogTitle className="text-2xl font-bold text-white">Plan complete!</DialogTitle>
              <DialogDescription className="text-base text-emerald-50">
                You repeated each ayah twenty times — may Allah make it firm in your heart.
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="text-center text-sm text-emerald-50">
            <p>
              {activePlan
                ? `${activePlan.surahName} • Ayah ${activePlan.startAyah} – ${activePlan.endAyah}`
                : "Keep building momentum with your memorization."}
            </p>
          </div>
          <DialogFooter className="flex-row justify-center gap-3">
            <Button
              variant="outline"
              className="border-emerald-100 bg-white text-emerald-700 hover:bg-emerald-50"
              onClick={() => {
                setShowCelebration(false)
                setIsCreateDialogOpen(true)
              }}
            >
              Create another plan
            </Button>
            {nextAvailablePlan ? (
              <Button
                className="bg-emerald-800 text-white hover:bg-emerald-900"
                onClick={() => {
                  setShowCelebration(false)
                  setSelectedPlanId(nextAvailablePlan.id)
                }}
              >
                Go to next plan
              </Button>
            ) : (
              <Button className="bg-emerald-800 text-white hover:bg-emerald-900" onClick={() => setShowCelebration(false)}>
                Keep reviewing
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
