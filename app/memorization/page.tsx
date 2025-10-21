"use client"

import { useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Award,
  BookOpen,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  Repeat,
  Sparkles,
} from "lucide-react"

interface Verse {
  number: number
  arabic: string
  translation: string
}

interface SurahDetails {
  id: string
  name: string
  revelationPlace: "Meccan" | "Medinan"
  verses: Verse[]
}

interface MemorizationPlan {
  id: string
  surahId: string
  surahName: string
  startVerse: number
  endVerse: number
  currentVerse: number
  repeatCount: number
  completedVerses: number
  status: "not-started" | "in-progress" | "completed"
  createdAt: Date
}

const SURAH_LIBRARY: Record<string, SurahDetails> = {
  fatiha: {
    id: "fatiha",
    name: "Al-Fatiha",
    revelationPlace: "Meccan",
    verses: [
      {
        number: 1,
        arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
        translation: "In the Name of Allah—the Most Compassionate, Most Merciful.",
      },
      {
        number: 2,
        arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
        translation: "All praise is for Allah—Lord of all worlds.",
      },
      {
        number: 3,
        arabic: "الرَّحْمَٰنِ الرَّحِيمِ",
        translation: "The Most Compassionate, Most Merciful.",
      },
      {
        number: 4,
        arabic: "مَالِكِ يَوْمِ الدِّينِ",
        translation: "Master of the Day of Judgment.",
      },
      {
        number: 5,
        arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
        translation: "You ˹alone˺ we worship and You ˹alone˺ we ask for help.",
      },
      {
        number: 6,
        arabic: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
        translation: "Guide us along the Straight Path.",
      },
      {
        number: 7,
        arabic:
          "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
        translation:
          "The Path of those You have blessed—not those You are displeased with, or those who are astray.",
      },
    ],
  },
  baqarah: {
    id: "baqarah",
    name: "Al-Baqarah",
    revelationPlace: "Medinan",
    verses: [
      {
        number: 1,
        arabic: "الم",
        translation: "Alif-Lãm-Mĩm.",
      },
      {
        number: 2,
        arabic: "ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِلْمُتَّقِينَ",
        translation:
          "This is the Book! There is no doubt about it—a guide for those mindful ˹of Allah˺.",
      },
      {
        number: 3,
        arabic: "الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنْفِقُونَ",
        translation:
          "Who believe in the unseen, establish prayer, and donate from what We have provided for them.",
      },
      {
        number: 4,
        arabic:
          "وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنزِلَ إِلَيْكَ وَمَا أُنزِلَ مِن قَبْلِكَ وَبِالْآخِرَةِ هُمْ يُوقِنُونَ",
        translation:
          "And who believe in what has been revealed to you ˹O Prophet˺ and what was revealed before you, and have sure faith in the Hereafter.",
      },
      {
        number: 5,
        arabic: "أُو۟لَٰٓئِكَ عَلَىٰ هُدٗى مِّن رَّبِّهِمۡۖ وَأُو۟لَٰٓئِكَ هُمُ ٱلۡمُفۡلِحُونَ",
        translation: "It is they who are ˹truly˺ guided by their Lord, and it is they who will be successful.",
      },
    ],
  },
  ikhlas: {
    id: "ikhlas",
    name: "Al-Ikhlas",
    revelationPlace: "Meccan",
    verses: [
      {
        number: 1,
        arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ",
        translation: "Say, ˹O Prophet,˺ “He is Allah—One ˹and Indivisible˺;",
      },
      {
        number: 2,
        arabic: "اللَّهُ الصَّمَدُ",
        translation: "Allah—the Sustainer ˹needed by all˺.",
      },
      {
        number: 3,
        arabic: "لَمْ يَلِدْ وَلَمْ يُولَدْ",
        translation: "He has never had offspring, nor was He born.",
      },
      {
        number: 4,
        arabic: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
        translation: "And there is none comparable to Him.",
      },
    ],
  },
}

const surahOptions = Object.values(SURAH_LIBRARY)

export default function MemorizationPage() {
  const [plans, setPlans] = useState<MemorizationPlan[]>([])
  const [activePlanId, setActivePlanId] = useState<string | null>(null)
  const [showCreatePlan, setShowCreatePlan] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)
  const [completedPlan, setCompletedPlan] = useState<MemorizationPlan | null>(null)
  const [formErrors, setFormErrors] = useState<string | null>(null)
  const [formState, setFormState] = useState({
    surahId: surahOptions[0]?.id ?? "fatiha",
    startVerse: 1,
    endVerse: 3,
  })

  const activePlan = useMemo(
    () => plans.find((plan) => plan.id === activePlanId) ?? null,
    [plans, activePlanId],
  )

  const activeSurah = activePlan ? SURAH_LIBRARY[activePlan.surahId] : null

  const totalVerses = activePlan
    ? activePlan.endVerse - activePlan.startVerse + 1
    : 0

  const progressPercent = activePlan
    ? Math.round((activePlan.completedVerses / totalVerses) * 100)
    : 0

  const currentVerseDetails = useMemo(() => {
    if (!activePlan) return null
    const surah = SURAH_LIBRARY[activePlan.surahId]
    return surah.verses.find((verse) => verse.number === activePlan.currentVerse) ?? null
  }, [activePlan])

  const handleCreatePlan = () => {
    const surah = SURAH_LIBRARY[formState.surahId]
    if (!surah) {
      setFormErrors("Please select a surah to memorize.")
      return
    }

    const { startVerse, endVerse } = formState
    if (!Number.isFinite(startVerse) || !Number.isFinite(endVerse)) {
      setFormErrors("Please enter valid verse numbers.")
      return
    }

    if (startVerse < 1 || endVerse < 1) {
      setFormErrors("Verse numbers must be positive.")
      return
    }

    if (startVerse > endVerse) {
      setFormErrors("The ending verse must come after the starting verse.")
      return
    }

    if (endVerse > surah.verses[surah.verses.length - 1]?.number) {
      setFormErrors("The selected surah does not have that many verses.")
      return
    }

    const plan: MemorizationPlan = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
      surahId: surah.id,
      surahName: surah.name,
      startVerse,
      endVerse,
      currentVerse: startVerse,
      repeatCount: 0,
      completedVerses: 0,
      status: "not-started",
      createdAt: new Date(),
    }

    setPlans((prev) => [...prev, plan])
    setActivePlanId(plan.id)
    setShowCreatePlan(false)
    setFormErrors(null)
  }

  const handleRepeat = () => {
    if (!activePlan || activePlan.status === "completed") return
    setPlans((prev) =>
      prev.map((plan) => {
        if (plan.id !== activePlan.id) return plan
        const newRepeatCount = Math.min(20, plan.repeatCount + 1)
        return {
          ...plan,
          repeatCount: newRepeatCount,
          status: "in-progress",
        }
      }),
    )
  }

  const handlePrevious = () => {
    if (!activePlan) return
    if (activePlan.currentVerse <= activePlan.startVerse) return

    setPlans((prev) =>
      prev.map((plan) => {
        if (plan.id !== activePlan.id) return plan
        return {
          ...plan,
          currentVerse: plan.currentVerse - 1,
          repeatCount: 0,
          completedVerses: Math.max(plan.completedVerses - 1, 0),
          status: "in-progress",
        }
      }),
    )
  }

  const handleNext = () => {
    if (!activePlan) return
    if (activePlan.repeatCount < 20) return

    let completedSnapshot: MemorizationPlan | null = null

    setPlans((prev) =>
      prev.map((plan) => {
        if (plan.id !== activePlan.id) return plan

        const total = plan.endVerse - plan.startVerse + 1
        const isLastVerse = plan.currentVerse >= plan.endVerse

        if (isLastVerse) {
          const updatedPlan: MemorizationPlan = {
            ...plan,
            completedVerses: total,
            repeatCount: 20,
            status: "completed",
          }
          completedSnapshot = updatedPlan
          return updatedPlan
        }

        return {
          ...plan,
          currentVerse: plan.currentVerse + 1,
          repeatCount: 0,
          completedVerses: Math.min(plan.completedVerses + 1, total - 1),
          status: "in-progress",
        }
      }),
    )

    if (completedSnapshot) {
      setCompletedPlan(completedSnapshot)
      setShowCompletion(true)
    }
  }

  const resetRepeatCounter = () => {
    if (!activePlan || activePlan.status === "completed") return
    setPlans((prev) =>
      prev.map((plan) => {
        if (plan.id !== activePlan.id) return plan
        return {
          ...plan,
          repeatCount: 0,
        }
      }),
    )
  }

  const handlePlanSelect = (planId: string) => {
    setActivePlanId(planId)
  }

  const handleSurahChange = (surahId: string) => {
    const surah = SURAH_LIBRARY[surahId]
    setFormState({
      surahId,
      startVerse: 1,
      endVerse: Math.min(3, surah.verses[surah.verses.length - 1]?.number ?? 1),
    })
    setFormErrors(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-emerald-50">
      <header className="border-b border-emerald-100 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-500">Memorization Studio</p>
            <h1 className="text-3xl font-semibold text-emerald-900">Build your Qur'an Memorization Plans</h1>
            <p className="text-sm text-emerald-700">
              Create focused plans, repeat each verse twenty times, and celebrate every completion.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="border-emerald-200 text-emerald-800 hover:bg-emerald-100" disabled>
              <BookOpen className="mr-2 h-4 w-4" />
              Guided Mode
            </Button>
            <Button
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200"
              onClick={() => setShowCreatePlan(true)}
            >
              <ListChecks className="mr-2 h-4 w-4" /> Create Plan
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-6 py-10 lg:grid-cols-[320px_1fr]">
        <Card className="border-emerald-100/80 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-base font-semibold text-emerald-900">
              <ListChecks className="mr-2 h-5 w-5 text-emerald-500" />
              Memorization Plans
            </CardTitle>
            <CardDescription className="text-sm text-emerald-700">
              Choose a plan to begin your repetition-focused session.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {plans.length === 0 ? (
              <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50/60 p-6 text-center">
                <p className="font-medium text-emerald-800">No plans yet</p>
                <p className="mt-2 text-sm text-emerald-700">
                  Create your first plan to start a mindful memorization journey.
                </p>
                <Button
                  size="sm"
                  className="mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                  onClick={() => setShowCreatePlan(true)}
                >
                  <Sparkles className="mr-2 h-4 w-4" /> Create Plan
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <RadioGroup value={activePlanId ?? ""} onValueChange={handlePlanSelect}>
                  <div className="space-y-4">
                    {plans.map((plan) => {
                      const planTotal = plan.endVerse - plan.startVerse + 1
                      const planProgress = Math.round((plan.completedVerses / planTotal) * 100)

                      return (
                        <label
                          key={plan.id}
                          htmlFor={plan.id}
                          className={`flex cursor-pointer flex-col rounded-xl border p-4 transition hover:shadow-md ${
                            activePlanId === plan.id
                              ? "border-emerald-400 bg-emerald-50"
                              : "border-emerald-100 bg-white"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center space-x-2 text-sm font-semibold text-emerald-900">
                                <span>{plan.surahName}</span>
                                <Badge variant="outline" className="border-emerald-200 text-emerald-600">
                                  Verses {plan.startVerse} – {plan.endVerse}
                                </Badge>
                              </div>
                              <p className="mt-1 text-xs text-emerald-700">
                                Created {plan.createdAt.toLocaleDateString()} • {planTotal} verses
                              </p>
                            </div>
                            <Badge
                              className={`border-0 ${
                                plan.status === "completed"
                                  ? "bg-emerald-500/90 text-white"
                                  : plan.status === "in-progress"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {plan.status === "completed"
                                ? "Completed"
                                : plan.status === "in-progress"
                                ? "In progress"
                                : "Not started"}
                            </Badge>
                          </div>
                          <div className="mt-4 space-y-1">
                            <Progress value={planProgress} className="h-2" />
                            <div className="flex items-center justify-between text-xs text-emerald-700">
                              <span>{plan.completedVerses} completed</span>
                              <span>{planProgress}%</span>
                            </div>
                          </div>
                          <div className="mt-4 flex items-center space-x-2">
                            <RadioGroupItem id={plan.id} value={plan.id} className="border-emerald-400" />
                            <span className="text-xs font-medium text-emerald-800">Select Plan</span>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </RadioGroup>
              </ScrollArea>
            )}
          </CardContent>
          <CardFooter className="justify-center">
            <Button variant="outline" className="border-emerald-200 text-emerald-700" onClick={() => setShowCreatePlan(true)}>
              <Sparkles className="mr-2 h-4 w-4" /> New Plan
            </Button>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          {activePlan && activeSurah && currentVerseDetails ? (
            <Card className="border-emerald-100/80 bg-white/80 shadow-lg shadow-emerald-100">
              <CardHeader className="flex flex-col space-y-4 border-b border-emerald-100 pb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-semibold text-emerald-900">
                      {activePlan.surahName}
                    </CardTitle>
                    <CardDescription className="mt-2 flex items-center space-x-2 text-sm text-emerald-700">
                      <Badge variant="outline" className="border-emerald-200 text-emerald-600">
                        {activeSurah.revelationPlace} Surah
                      </Badge>
                      <span>Verse {activePlan.currentVerse} of {activePlan.endVerse}</span>
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-emerald-900">Plan progress</p>
                    <p className="text-xs text-emerald-700">{activePlan.completedVerses} / {totalVerses} verses</p>
                    <Progress value={progressPercent} className="mt-2 h-2" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-8 pt-6">
                <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50 to-emerald-100 p-8 text-center shadow-inner">
                  <p className="text-4xl leading-relaxed text-emerald-900">{currentVerseDetails.arabic}</p>
                  <Separator className="mx-auto my-6 w-16 bg-emerald-200" />
                  <p className="text-lg text-emerald-800">{currentVerseDetails.translation}</p>
                </div>

                {activePlan.status !== "completed" ? (
                  <div className="grid gap-4 rounded-2xl border border-emerald-100 bg-white/70 p-6 shadow-sm md:grid-cols-2">
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-5">
                      <p className="text-sm font-medium text-emerald-800">Repeat tracker</p>
                      <p className="mt-2 text-3xl font-semibold text-emerald-900">{activePlan.repeatCount} / 20</p>
                      <Progress value={(activePlan.repeatCount / 20) * 100} className="mt-3 h-2" />
                      <p className="mt-3 text-xs text-emerald-700">
                        Tap the repeat button twenty times to lock this verse into memory.
                      </p>
                    </div>
                    <div className="flex flex-col justify-between space-y-4">
                      <Button
                        size="lg"
                        className="h-14 bg-gradient-to-r from-emerald-500 to-teal-500 text-lg font-semibold text-white shadow-lg shadow-emerald-200"
                        onClick={handleRepeat}
                      >
                        <Repeat className="mr-2 h-5 w-5" /> Repeat Verse
                      </Button>
                      <Button
                        variant="outline"
                        className="h-12 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        onClick={resetRepeatCounter}
                      >
                        Reset Counter
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-6 text-center">
                    <p className="text-xl font-semibold text-emerald-900">Plan completed!</p>
                    <p className="mt-2 text-sm text-emerald-700">
                      Relive this verse or explore another plan to continue your memorization.
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-3 border-t border-emerald-100 bg-emerald-50/40 px-8 py-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center space-x-2 text-sm text-emerald-700">
                  <CheckCircle className={`h-4 w-4 ${activePlan.repeatCount >= 20 ? "text-emerald-500" : "text-emerald-300"}`} />
                  <span>{activePlan.repeatCount >= 20 ? "Ready for the next verse" : "Repeat the verse twenty times"}</span>
                </div>
                <div className="flex w-full gap-3 sm:w-auto">
                  <Button
                    variant="outline"
                    className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 sm:w-auto"
                    onClick={handlePrevious}
                    disabled={activePlan.currentVerse <= activePlan.startVerse || activePlan.status === "completed"}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Previous Verse
                  </Button>
                  <Button
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-200 sm:w-auto"
                    onClick={handleNext}
                    disabled={activePlan.repeatCount < 20 || activePlan.status === "completed"}
                  >
                    Next Verse <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ) : (
            <Card className="flex h-full flex-col items-center justify-center border-emerald-100/80 bg-white/80 p-12 text-center shadow-md shadow-emerald-100">
              <Sparkles className="h-12 w-12 text-emerald-400" />
              <h2 className="mt-4 text-2xl font-semibold text-emerald-900">Select a plan to begin memorizing</h2>
              <p className="mt-2 max-w-lg text-sm text-emerald-700">
                Choose one of your plans on the left or create a new one. Repeating each verse twenty times helps
                build strong retention and confidence.
              </p>
              <Button
                className="mt-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                onClick={() => setShowCreatePlan(true)}
              >
                Create a plan
              </Button>
            </Card>
          )}
        </div>
      </main>

      <Dialog open={showCreatePlan} onOpenChange={setShowCreatePlan}>
        <DialogContent className="max-w-lg border-emerald-100 bg-white/95">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-emerald-900">Create memorization plan</DialogTitle>
            <DialogDescription className="text-sm text-emerald-700">
              Select the surah and the range of verses you would like to commit to memory.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-emerald-800">Choose Surah</Label>
              <Select value={formState.surahId} onValueChange={handleSurahChange}>
                <SelectTrigger className="border-emerald-200">
                  <SelectValue placeholder="Select a surah" />
                </SelectTrigger>
                <SelectContent className="border-emerald-100 bg-white">
                  {surahOptions.map((surah) => (
                    <SelectItem key={surah.id} value={surah.id}>
                      {surah.name} • {surah.verses.length} verses
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-emerald-800">Start Verse</Label>
                <Input
                  type="number"
                  min={1}
                  value={formState.startVerse}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      startVerse: Number(event.target.value),
                    }))
                  }
                  className="border-emerald-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-emerald-800">End Verse</Label>
                <Input
                  type="number"
                  min={formState.startVerse}
                  value={formState.endVerse}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      endVerse: Number(event.target.value),
                    }))
                  }
                  className="border-emerald-200"
                />
              </div>
            </div>
            {formErrors ? <p className="text-sm text-red-500">{formErrors}</p> : null}
            <div className="rounded-lg border border-emerald-100 bg-emerald-50/70 p-4 text-sm text-emerald-800">
              <p className="font-semibold text-emerald-900">Tips for success</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Repeat each verse aloud twenty times before moving forward.</li>
                <li>Close your eyes and recite from memory after every five repetitions.</li>
                <li>Schedule a quick review after finishing the plan to reinforce retention.</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-emerald-200 text-emerald-700" onClick={() => setShowCreatePlan(false)}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
              onClick={handleCreatePlan}
            >
              Save Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCompletion} onOpenChange={setShowCompletion}>
        <DialogContent className="max-w-md border-emerald-100 bg-white/95 text-center">
          <DialogHeader>
            <DialogTitle className="flex flex-col items-center space-y-3 text-emerald-900">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg">
                <Award className="h-8 w-8" />
              </div>
              <span>Congratulations!</span>
            </DialogTitle>
            <DialogDescription className="text-sm text-emerald-700">
              You have completed the memorization plan
              {completedPlan ? ` for ${completedPlan.surahName} verses ${completedPlan.startVerse} – ${completedPlan.endVerse}.` : "."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm text-emerald-800">
            <p>
              Celebrate this milestone and choose what you would like to do next. Consistency builds mastery—keep the
              momentum alive!
            </p>
          </div>
          <DialogFooter className="mt-4 flex flex-col space-y-3">
            <Button
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
              onClick={() => {
                setShowCompletion(false)
                setShowCreatePlan(true)
              }}
            >
              Create another plan
            </Button>
            <Button
              variant="outline"
              className="w-full border-emerald-200 text-emerald-700"
              onClick={() => setShowCompletion(false)}
            >
              Review existing plans
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
