import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AppWindow,
  Code2,
  Download,
  Github,
  Images as ImagesIcon,
  Laptop,
  LayoutDashboard,
  Library,
  Link2,
  MoonStar,
  Repeat2,
  Search,
  Sparkles,
  TextQuote,
  Volume2,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Quran Companion | AlFawz Qur'an Institute",
  description:
    "Discover Quran Companion, a free and open-source desktop Quran reader and player featuring rich translations, dark mode, and advanced memorization tools.",
  keywords: [
    "Quran Companion",
    "Desktop Quran",
    "Quran Reader",
    "Open Source Quran",
    "Islamic Software",
  ],
}

const installationOptions = [
  {
    name: "Windows",
    description:
      "Download the online installer and follow the installation steps to get started immediately.",
    icon: AppWindow,
    links: [
      {
        label: "Installer",
        href: "https://github.com/0xzer0x/quran-companion/releases/download/v1.1.9/qc_online_installer_x64_win.exe",
      },
    ],
  },
  {
    name: "Linux",
    description:
      "Choose the package that best fits your distribution and enjoy native performance across the desktop.",
    icon: Laptop,
    links: [
      {
        label: "AppImage",
        href: "https://github.com/0xzer0x/quran-companion/releases/download/v1.3.3/Quran_Companion-1.3.3-x86_64.AppImage",
      },
      {
        label: "Flatpak",
        href: "https://flathub.org/apps/io.github._0xzer0x.qurancompanion",
      },
      {
        label: "Snap",
        href: "https://snapcraft.io/quran-companion",
      },
      {
        label: "AUR",
        href: "https://aur.archlinux.org/packages/quran-companion",
      },
    ],
  },
  {
    name: "macOS",
    description:
      "Download the DMG, open it, and drag Quran Companion into your Applications folder to finish setup.",
    icon: MoonStar,
    links: [
      {
        label: "DMG",
        href: "https://github.com/0xzer0x/quran-companion/releases/download/v1.3.3/Quran_Companion-1.3.3-x86_64.dmg",
      },
    ],
  },
  {
    name: "Build from source",
    description:
      "Follow the compilation instructions to build the application yourself from the official repository.",
    icon: Code2,
    links: [
      {
        label: "Build instructions",
        href: "https://github.com/0xzer0x/quran-companion?tab=readme-ov-file#compilation-%EF%B8%8F",
      },
    ],
  },
]

const features = [
  {
    title: "Modern interface",
    description: "Sleek, desktop-friendly design with full dark theme support.",
    icon: Sparkles,
  },
  {
    title: "Lightning-fast search",
    description: "Quickly locate verses, topics, and translations across the Quran.",
    icon: Search,
  },
  {
    title: "Flexible reading modes",
    description: "Switch between single or two-page layouts for a comfortable reading experience.",
    icon: LayoutDashboard,
  },
  {
    title: "Mushaf or verse view",
    description: "Read from the classic mushaf layout or focus verse-by-verse when studying.",
    icon: TextQuote,
  },
  {
    title: "Customizable page size",
    description: "Adjust the Quran page dimensions to match your display and preferences.",
    icon: AppWindow,
  },
  {
    title: "Translations and tafsir",
    description: "Access an expanding library of translations and tafsir works.",
    icon: Library,
  },
  {
    title: "Multiple reciters",
    description: "Listen to recitations from renowned reciters with seamless audio playback.",
    icon: Volume2,
  },
  {
    title: "Memorization tools",
    description: "Repeat selected verses to strengthen memorization and retention.",
    icon: Repeat2,
  },
]

const screenshots = [
  {
    src: "https://0xzer0x.github.io/imgs/quran-companion/screenshots/light.png",
    alt: "Quran Companion light mode interface",
  },
  {
    src: "https://0xzer0x.github.io/imgs/quran-companion/screenshots/two-pages.png",
    alt: "Two-page reading mode",
  },
  {
    src: "https://0xzer0x.github.io/imgs/quran-companion/screenshots/dark.png",
    alt: "Dark mode interface",
  },
  {
    src: "https://0xzer0x.github.io/imgs/quran-companion/screenshots/ar_light.png",
    alt: "Arabic UI in light mode",
  },
  {
    src: "https://0xzer0x.github.io/imgs/quran-companion/screenshots/ar_dark.png",
    alt: "Arabic UI in dark mode",
  },
]

export default function QuranCompanionPage() {
  return (
    <div className="min-h-screen bg-gradient-cream">
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-primary/10 via-transparent to-secondary/20" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-12 px-4 text-center">
          <Badge className="gradient-gold border-0 px-4 py-2 text-white">Open Source Spotlight</Badge>
          <div className="space-y-6">
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Quran Companion
            </h1>
            <p className="mx-auto max-w-3xl text-lg text-muted-foreground sm:text-xl">
              Quran Companion is a free and open-source desktop Quran reader and player that brings together a modern interface,
              powerful search, and rich audio features to support your daily recitation and memorization journey.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="gradient-maroon border-0 px-8 text-lg text-white">
              <Link
                href="https://github.com/0xzer0x/quran-companion/releases/latest"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="mr-2 h-5 w-5" />
                Download latest release
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="px-8 text-lg">
              <Link href="https://github.com/0xzer0x/quran-companion" target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-5 w-5" />
                View on GitHub
              </Link>
            </Button>
          </div>
          <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-border/50 bg-background/70 shadow-xl">
            <Image
              src="https://0xzer0x.github.io/imgs/quran-companion/banner.png"
              alt="Preview of the Quran Companion desktop application"
              width={1600}
              height={900}
              className="h-full w-full object-cover"
              priority
              unoptimized
            />
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">Installation</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Quran Companion is available across platforms so you can enjoy the same polished experience on Windows, Linux,
              and macOS—or build it yourself from source.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {installationOptions.map((option) => (
              <Card key={option.name} className="border-border/60 bg-background/80 backdrop-blur">
                <CardHeader className="items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <option.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-semibold text-foreground">{option.name}</CardTitle>
                    <CardDescription className="mt-2 text-base leading-relaxed text-muted-foreground">
                      {option.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  {option.links.map((link) => (
                    <Button
                      key={`${option.name}-${link.label}`}
                      asChild
                      variant="outline"
                      className="border-primary/30 text-primary hover:bg-primary/10"
                    >
                      <Link href={link.href} target="_blank" rel="noopener noreferrer">
                        {link.label}
                        <Link2 className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background/60 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">Key Features</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Every detail of Quran Companion is crafted to make reading, listening, and memorizing the Quran delightful and
              efficient.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="border-border/50 bg-card/80">
                <CardHeader className="items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/15 text-secondary-foreground">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-foreground">{feature.title}</CardTitle>
                    <CardDescription className="mt-2 text-base leading-relaxed text-muted-foreground">
                      {feature.description}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center gap-4 text-center">
            <Badge variant="secondary" className="px-4 py-1 text-sm">
              Visual Tour
            </Badge>
            <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">Screenshots</h2>
            <p className="max-w-3xl text-lg text-muted-foreground">
              Explore the clean layouts, language options, and reading modes available throughout Quran Companion.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {screenshots.map((screenshot) => (
              <div
                key={screenshot.src}
                className="group overflow-hidden rounded-2xl border border-border/40 bg-background/80 shadow-sm transition hover:shadow-lg"
              >
                <div className="relative flex h-64 items-center justify-center bg-muted/30">
                  <Image
                    src={screenshot.src}
                    alt={screenshot.alt}
                    width={1280}
                    height={720}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    unoptimized
                  />
                </div>
                <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
                  <ImagesIcon className="h-4 w-4" />
                  {screenshot.alt}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background/60 py-16">
        <div className="mx-auto max-w-4xl px-4">
          <Card className="border-border/70 bg-card/80 p-8 text-center shadow-lg">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Github className="h-8 w-8" />
            </div>
            <CardHeader className="mt-6 space-y-4 text-center">
              <CardTitle className="text-3xl font-semibold text-foreground">Explore the Source Code</CardTitle>
              <CardDescription className="text-lg leading-relaxed text-muted-foreground">
                Quran Companion is actively developed in the open. Dive into the code, report issues, or contribute new features
                to help the global community benefit from a refined Quran reading experience.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button asChild size="lg" className="gradient-maroon border-0 px-8 text-lg text-white">
                <Link href="https://github.com/0xzer0x/quran-companion" target="_blank" rel="noopener noreferrer">
                  <Github className="mr-2 h-5 w-5" />
                  Visit Repository
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
