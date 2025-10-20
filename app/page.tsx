"use client"

import { useCallback, useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  BookOpenCheck,
  Brain,
  ChartLine,
  ChevronRight,
  HeadphonesIcon,
  Menu,
  Sparkles,
  Star,
  Target,
  Users,
  Waves,
  X,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ColorfulPage } from "@/components/ui/colorful-page"

const navigationLinks = [
  { label: "Features", href: "#features" },
  { label: "Learning Paths", href: "#learning-paths" },
  { label: "Community", href: "#community" },
  { label: "Pricing", href: "/pricing" },
]

const featureHighlights = [
  {
    title: "AI Tajwīd Maestro",
    description: "Receive instant pronunciation feedback, articulation analysis, and tajwīd corrections in real time.",
    icon: Sparkles,
    accent: "from-rose-500 to-amber-400",
  },
  {
    title: "Immersive Qur'an Studio",
    description: "Explore Mushaf layouts, translations, and reciters in a cinematic reader tailored for deep reflection.",
    icon: BookOpenCheck,
    accent: "from-emerald-500 to-teal-400",
  },
  {
    title: "Adaptive Memorization",
    description: "Harness spaced repetition, habit quests, and beautifully crafted revision plans for lasting retention.",
    icon: Brain,
    accent: "from-sky-500 to-indigo-500",
  },
  {
    title: "Joyful Gamification",
    description: "Earn Hasanat, unlock radiant badges, and celebrate milestones with a supportive global community.",
    icon: Star,
    accent: "from-amber-500 to-pink-500",
  },
]

const learningPillars = [
  {
    title: "Recitation Mastery",
    description: "Interactive tajwīd drills, live recitation analyzer, and guided studio sessions for every ayah.",
    icon: HeadphonesIcon,
  },
  {
    title: "Memorization Journeys",
    description: "Personalized memorization maps, daily quests, and reflective journaling built with educators.",
    icon: Target,
  },
  {
    title: "Community & Mentorship",
    description: "Seamless teacher dashboards, parent insights, and collaborative circles for vibrant learning.",
    icon: Users,
  },
]

const experienceTimeline = [
  {
    step: "01",
    title: "Discover Your Path",
    description: "Onboard with a radiant experience that learns your goals, schedule, and tajwīd background.",
    accent: "from-rose-400/30 to-transparent",
  },
  {
    step: "02",
    title: "Train with Clarity",
    description: "Daily quests guide your recitation, memorization, and reflection with gentle accountability.",
    accent: "from-emerald-400/30 to-transparent",
  },
  {
    step: "03",
    title: "Celebrate Progress",
    description: "Track Hasanat, unlock achievements, and receive teacher feedback with graceful visualizations.",
    accent: "from-sky-400/30 to-transparent",
  },
  {
    step: "04",
    title: "Teach & Inspire",
    description: "Empower your students with elegant lesson planning, analytics, and community engagement tools.",
    accent: "from-amber-400/30 to-transparent",
  },
]

const communityHighlights = [
  {
    value: "42,000+",
    label: "Guided lessons delivered",
    accent: "text-rose-600",
  },
  {
    value: "97%",
    label: "Report stronger tajwīd confidence",
    accent: "text-emerald-600",
  },
  {
    value: "65 countries",
    label: "Connected through vibrant circles",
    accent: "text-sky-600",
  },
]

const testimonials = [
  {
    quote:
      "The AI tajwīd studio feels like a compassionate teacher sitting beside me. My students can’t wait for their practice sessions!",
    name: "Ustadhah Maryam",
    role: "Senior Qur'an Mentor, Abu Dhabi",
  },
  {
    quote:
      "Habit Quest transformed our memorization routine at home. The reflections and Hasanat celebrations motivate my children daily.",
    name: "Ahmed & Lina",
    role: "Parent & Student duo, Toronto",
  },
]

const faqs = [
  {
    question: "Is AlFawz suitable for complete beginners?",
    answer:
      "Absolutely. Guided onboarding, phonetic warmups, and adaptive recitation feedback create a gentle start for every learner.",
  },
  {
    question: "How do teachers collaborate with students?",
    answer:
      "Teachers craft assignments, review recitations, and host group reflections with real-time analytics across all classes.",
  },
  {
    question: "Do I need special hardware for the AI studio?",
    answer:
      "No specialized devices are required—any modern browser with a microphone gives access to the full experience.",
  },
]

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((previous) => !previous)
  }, [])

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false)
  }, [])

  return (
    <ColorfulPage contentClassName="max-w-6xl py-12 lg:py-16">
      <header className="relative overflow-hidden rounded-[3rem] border border-white/50 bg-white/80 p-6 shadow-2xl shadow-rose-100/50 backdrop-blur-2xl sm:p-10">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 left-20 h-56 w-56 rounded-full bg-rose-300/30 blur-3xl" />
          <div className="absolute bottom-0 right-12 h-72 w-72 rounded-full bg-emerald-300/30 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.7),_transparent_65%)]" />
        </div>

        <nav className="flex flex-wrap items-center justify-between gap-4 rounded-full border border-white/60 bg-white/70 px-5 py-3 shadow-lg shadow-rose-200/30 backdrop-blur sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-amber-400 text-white shadow-lg shadow-rose-200/60">
              <BookOpen className="h-6 w-6" />
            </span>
            <span>
              <p className="text-lg font-semibold text-foreground">AlFawz</p>
              <p className="text-xs text-muted-foreground">Qur&apos;an Institute</p>
            </span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            {navigationLinks.map((link) => (
              <a key={link.label} href={link.href} className="transition hover:text-foreground">
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="rounded-full border border-white/60 bg-white/70 text-foreground"
            >
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500 text-white shadow-lg shadow-rose-200/60"
            >
              <Link href="/auth/register">Get Started</Link>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/70 text-foreground md:hidden"
            onClick={toggleMenu}
            aria-controls="mobile-navigation"
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </nav>

        {isMenuOpen ? (
          <div
            id="mobile-navigation"
            className="mt-4 space-y-3 rounded-3xl border border-white/60 bg-white/80 p-6 text-sm font-medium text-muted-foreground shadow-lg backdrop-blur md:hidden"
          >
            {navigationLinks.map((link) => (
              <a key={link.label} href={link.href} className="block rounded-2xl px-3 py-2 transition hover:bg-white/70 hover:text-foreground" onClick={closeMenu}>
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-2">
              <Button asChild variant="outline" className="rounded-full border-white/60 bg-white/70">
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild className="rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500 text-white">
                <Link href="/auth/register">Get Started</Link>
              </Button>
            </div>
          </div>
        ) : null}

        <div className="mt-12 grid items-center gap-12 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-200/70 bg-rose-50/80 px-4 py-1.5 text-sm font-medium text-rose-600 shadow-inner shadow-rose-100">
              <Sparkles className="h-4 w-4" />
              Excellence in Qur&apos;anic mastery
            </div>
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              A luminous studio for recitation, memorization, and teaching the Qur&apos;an together.
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Step into a vibrant learning sanctuary powered by compassionate AI, tailored study plans, and a global community of teachers guiding every ayah with beauty.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                asChild
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500 px-6 py-3 text-base font-semibold text-white shadow-xl shadow-rose-200/60"
              >
                <Link href="/auth/register">
                  Start Your Journey
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-6 py-3 text-base text-foreground shadow-lg"
              >
                <Link href="/demo">
                  Explore the Demo
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {["Personalized AI coaching", "Teacher-crafted journeys", "Joyful Hasanat celebrations"].map((highlight) => (
                <div
                  key={highlight}
                  className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm text-muted-foreground shadow-inner shadow-rose-100"
                >
                  <BadgeCheck className="h-5 w-5 text-emerald-500" />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/75 p-6 shadow-2xl shadow-rose-200/40 backdrop-blur lg:block">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(244,114,182,0.4),_transparent_70%)]" />
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="rounded-full border border-white/60 bg-white/80 text-xs text-muted-foreground">
                  Today&apos;s Quest
                </Badge>
                <span className="rounded-full bg-emerald-100 px-4 py-1 text-xs font-medium text-emerald-700">+36 Hasanat</span>
              </div>
              <div className="space-y-4 rounded-3xl border border-white/60 bg-white/80 p-5 shadow-inner shadow-rose-100">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Recitation Focus</p>
                    <h3 className="text-lg font-semibold text-foreground">Surah Al-Mulk · Ayat 1-5</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Practice articulation of qalqalah letters with rhythm guidance and tajwīd glow.
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-amber-400 text-white">
                    <Waves className="h-6 w-6" />
                  </div>
                </div>
                <div className="space-y-3">
                  {["Warmup phonetics", "Memorization echo", "Reflection journal"].map((item) => (
                    <div key={item} className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/70 px-3 py-2 text-sm text-muted-foreground">
                      <span>{item}</span>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Ready</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between rounded-3xl border border-white/60 bg-white/70 px-5 py-4 shadow-inner shadow-rose-100">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">This Week</p>
                  <p className="text-2xl font-semibold text-foreground">+480 ayat mastered</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 text-white">
                  <ChartLine className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section id="features" className="relative mt-16 space-y-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <Badge className="rounded-full border border-white/60 bg-white/70 text-xs text-muted-foreground">Immersive platform</Badge>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Crafted tools for every stage of the Qur&apos;anic journey
            </h2>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Each module is purposefully designed with educators, Qur&apos;an reciters, and learning scientists to inspire devotion and mastery.
            </p>
          </div>
          <Button
            asChild
            variant="ghost"
            className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm text-foreground shadow-lg"
          >
            <Link href="/features">
              Explore the full roadmap
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {featureHighlights.map((feature) => (
            <Card
              key={feature.title}
              className="group relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-xl shadow-rose-100/40 backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-rose-200/60"
            >
              <div
                className={`pointer-events-none absolute -top-24 right-0 h-56 w-56 rounded-full bg-gradient-to-br ${feature.accent} opacity-50 blur-3xl transition duration-300 group-hover:opacity-80`}
              />
              <CardHeader className="space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 shadow-inner shadow-rose-100">
                  <feature.icon className="h-6 w-6 text-rose-500" />
                </div>
                <CardTitle className="text-2xl text-foreground">{feature.title}</CardTitle>
                <CardDescription className="text-base leading-relaxed text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section id="learning-paths" className="relative mt-20 space-y-10">
        <div className="space-y-3 text-center">
          <Badge className="rounded-full border border-white/60 bg-white/70 text-xs text-muted-foreground">Learning pillars</Badge>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Pathways illuminated with wisdom</h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Gentle structure meets radiant creativity. Choose your path or blend them together to nourish heart and mind.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {learningPillars.map((pillar) => (
            <Card key={pillar.title} className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/75 shadow-xl shadow-rose-100/40 backdrop-blur">
              <div className="pointer-events-none absolute -right-10 top-0 h-32 w-32 rounded-full bg-rose-200/40 blur-3xl" />
              <CardHeader className="space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-amber-400 text-white shadow-lg shadow-rose-200/60">
                  <pillar.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl text-foreground">{pillar.title}</CardTitle>
                <CardDescription className="text-base leading-relaxed text-muted-foreground">
                  {pillar.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="relative mt-20 space-y-10" id="community">
        <div className="space-y-3 text-center">
          <Badge className="rounded-full border border-white/60 bg-white/70 text-xs text-muted-foreground">Moments of impact</Badge>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">A radiant community around the world</h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Teachers, families, and seekers from every continent gather daily to recite, reflect, and celebrate together.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
          <div className="space-y-6 rounded-[2.5rem] border border-white/60 bg-white/80 p-8 shadow-xl shadow-rose-100/40">
            <div className="grid gap-4 sm:grid-cols-3">
              {communityHighlights.map((highlight) => (
                <div
                  key={highlight.label}
                  className="rounded-3xl border border-white/60 bg-white/80 p-5 text-center shadow-inner shadow-rose-100"
                >
                  <p className={`text-3xl font-semibold ${highlight.accent}`}>{highlight.value}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{highlight.label}</p>
                </div>
              ))}
            </div>
            <div className="rounded-3xl border border-white/60 bg-white/70 p-6 text-left shadow-inner shadow-rose-100">
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Circle highlight</p>
              <p className="mt-3 text-lg text-foreground">
                “Our Friday reflections feel like a heartwarming halaqah. Students love recording their recitations and witnessing instant tajwīd glow.”
              </p>
              <p className="mt-4 text-sm font-medium text-muted-foreground">Ustad Faisal · Kuala Lumpur</p>
            </div>
          </div>

          <div className="space-y-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl shadow-rose-100/40">
                <CardContent className="space-y-4 p-0">
                  <p className="text-base leading-relaxed text-foreground">“{testimonial.quote}”</p>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="relative mt-20 space-y-10">
        <div className="space-y-3 text-center">
          <Badge className="rounded-full border border-white/60 bg-white/70 text-xs text-muted-foreground">Experience</Badge>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">A day with AlFawz feels beautifully orchestrated</h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Flow through purposeful steps that nourish devotion, discipline, and delight in every practice session.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {experienceTimeline.map((experience) => (
            <Card key={experience.title} className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-xl shadow-rose-100/40">
              <div className={`pointer-events-none absolute inset-y-0 right-0 w-2/3 bg-gradient-to-br ${experience.accent}`} />
              <CardContent className="relative space-y-4 p-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Phase</span>
                  <span className="text-4xl font-semibold text-foreground">{experience.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground">{experience.title}</h3>
                <p className="text-base text-muted-foreground">{experience.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="relative mt-20 grid gap-8 rounded-[2.5rem] border border-white/60 bg-white/80 p-8 shadow-2xl shadow-rose-100/40 backdrop-blur md:grid-cols-[1.2fr,0.8fr]">
        <div className="space-y-5">
          <Badge className="rounded-full border border-white/60 bg-white/70 text-xs text-muted-foreground">Frequently asked</Badge>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">What would you like to know?</h2>
          <p className="text-lg text-muted-foreground">
            From parents setting up family circles to advanced tajwīd mentors, AlFawz adapts gracefully to every need.
          </p>
          <div className="grid gap-4">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-3xl border border-white/60 bg-white/70 p-5 shadow-inner shadow-rose-100">
                <p className="text-base font-semibold text-foreground">{faq.question}</p>
                <p className="mt-2 text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between gap-6 rounded-[2rem] border border-white/60 bg-gradient-to-br from-rose-500/90 via-amber-400/80 to-emerald-500/90 p-6 text-white shadow-2xl shadow-rose-200/60">
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold leading-snug">Ready to host your own Qur&apos;an circle?</h3>
            <p className="text-sm text-white/90">
              Create private classrooms, design assignments, and invite students in minutes. Experience teacher-first workflows with luminous clarity.
            </p>
          </div>
          <div className="space-y-3">
            <Button asChild variant="secondary" className="w-full rounded-full bg-white/90 text-rose-600">
              <Link href="/contact">Book a live walkthrough</Link>
            </Button>
            <Button asChild variant="ghost" className="w-full rounded-full border-white/70 bg-transparent text-white">
              <Link href="/achievements">View teacher stories</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="relative mt-20 rounded-[3rem] border border-white/60 bg-white/80 p-10 text-center shadow-2xl shadow-rose-100/40">
        <div className="mx-auto max-w-3xl space-y-6">
          <Badge className="rounded-full border border-white/60 bg-white/70 text-xs text-muted-foreground">Let&apos;s begin</Badge>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Illuminate your Qur&apos;an journey with joy, science, and soulful connection.
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of seekers, families, and teachers building consistency through compassionate technology.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              className="rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500 px-6 py-3 text-base text-white shadow-xl shadow-rose-200/60"
            >
              <Link href="/auth/register">Start free trial</Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="rounded-full border border-white/60 bg-white/70 px-6 py-3 text-base text-foreground shadow-lg"
            >
              <Link href="/contact">Talk with our team</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="relative mt-20 rounded-[2.5rem] border border-white/60 bg-white/80 p-8 shadow-xl shadow-rose-100/40">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-amber-400 text-white shadow-lg shadow-rose-200/60">
                <BookOpen className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-foreground">AlFawz</p>
                <p className="text-xs text-muted-foreground">Qur&apos;an Institute</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Excellence in Qur&apos;anic education through radiant design, compassionate mentorship, and purposeful technology.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">Platform</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/features" className="transition hover:text-foreground">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="transition hover:text-foreground">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/demo" className="transition hover:text-foreground">
                  Demo
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">Community</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/leaderboard" className="transition hover:text-foreground">
                  Global leaderboards
                </Link>
              </li>
              <li>
                <Link href="/achievements" className="transition hover:text-foreground">
                  Achievements
                </Link>
              </li>
              <li>
                <Link href="/habits" className="transition hover:text-foreground">
                  Habit Quest
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">Support</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/contact" className="transition hover:text-foreground">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="transition hover:text-foreground">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition hover:text-foreground">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-white/60 pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} AlFawz Qur&apos;an Institute. Crafted with ihsān.
        </div>
      </footer>
    </ColorfulPage>
  )
}
