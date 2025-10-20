export type DeepSpeechStage = {
  stage: string
  datasetFocus: string
  metrics: {
    wer: number
    cer: number
    loss: number
  }
  enhancements: string[]
  notes: string
}

export const deepspeechStages: DeepSpeechStage[] = [
  {
    stage: "Stage 1 · Professional Imams",
    datasetFocus: "High-quality recitations curated from world-renowned imams to provide tajweed-perfect baselines.",
    metrics: {
      wer: 0.056551,
      cer: 0.03954,
      loss: 24.844383,
    },
    enhancements: [
      "Studio-grade recordings with minimal background noise",
      "Curriculum-aligned tajweed tags for error localization",
      "Length-aware CSV importer keeps ayah snippets balanced",
    ],
    notes:
      "Use this stage when onboarding new learners or when confidence thresholds must remain strict for live tajweed correction.",
  },
  {
    stage: "Stage 2 · Imams + Filtered Learners",
    datasetFocus:
      "Blends professional voices with vetted learner contributions to boost robustness for diverse accents and mic qualities.",
    metrics: {
      wer: 0.099118,
      cer: 0.065586,
      loss: 39.312599,
    },
    enhancements: [
      "Two-phase training pipeline with automatic quality filters",
      "Data augmentation presets (noise, tempo, reverb) for classroom realism",
      "Adaptive evaluation thresholds to flag tajweed regressions in real time",
    ],
    notes:
      "Recommended for real-time mistake detection once a student has established consistent pronunciation patterns.",
  },
]

export type DeepSpeechResource = {
  title: string
  description: string
  href: string
}

export const deepspeechResources: DeepSpeechResource[] = [
  {
    title: "TensorFlow Training Workflow",
    description:
      "End-to-end documentation for preparing CSV corpora, running the importer, and launching fine-tuning jobs in the Quran fork.",
    href: "https://github.com/tarekeldeeb/DeepSpeech-Quran/tree/master/data/quran",
  },
  {
    title: "Colab Reproduction Notebook",
    description: "Spin up GPU-backed experiments instantly using the shared Google Colab notebook maintained by the research team.",
    href: "https://colab.research.google.com/drive/1HO57B7ZA4-vn5bm-vL1zRnmuFV99g_n4?usp=sharing",
  },
  {
    title: "Recitation Datasets & Checkpoints",
    description:
      "Download curated imam corpora, filtered user sets, and published checkpoints from the public archive to accelerate deployment.",
    href: "https://archive.org/details/quran-speech-dataset",
  },
]

export type MushafVariant = {
  id: string
  name: string
  description: string
  highlights: string[]
  visualStyle: {
    headerAccent: string
    border: string
    background: string
    text: string
    badge: string
  }
  ayahExample: {
    arabic: string
    guidance: string
  }
}

export const mushafVariants: MushafVariant[] = [
  {
    id: "hafs",
    name: "Madani 15-Line (Hafs)",
    description:
      "Classical Mushaf al-Madina layout optimized for memorisation circles with consistent 15-line pagination across juz' boundaries.",
    highlights: [
      "Standard Hafs narration with Ottoman script ligatures",
      "Margin markers for hizb, rub', and sajdah cues",
      "Perfect for pairing with tajweed scoring overlays",
    ],
    visualStyle: {
      headerAccent: "bg-gradient-to-r from-emerald-500 to-emerald-600",
      border: "border-emerald-200",
      background: "bg-emerald-50/70",
      text: "text-emerald-900",
      badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    },
    ayahExample: {
      arabic: "بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ",
      guidance: "Every page aligns with the Madinah print, making cross-referencing physical mushaf copies effortless during hifdh circles.",
    },
  },
  {
    id: "tajweed",
    name: "Color-Coded Tajweed Edition",
    description:
      "Highlights ghunna, qalqalah, madd, and ikhfa rules with vibrant overlays so learners instantly see pronunciation obligations.",
    highlights: [
      "Dynamic color legend synced with AI-detected mistakes",
      "Optional contrast-friendly palette for projector displays",
      "Helps gamify revision sessions with visual tajweed streaks",
    ],
    visualStyle: {
      headerAccent: "bg-gradient-to-r from-rose-500 to-orange-500",
      border: "border-rose-200",
      background: "bg-rose-50/70",
      text: "text-rose-900",
      badge: "bg-rose-100 text-rose-800 border-rose-200",
    },
    ayahExample: {
      arabic: "وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا",
      guidance: "Color gradients mirror the tajweed legend from the reference Mushaf, making real-time corrections intuitive.",
    },
  },
]

export type MorphologyWord = {
  arabic: string
  lemma: string
  root: string
  stem: string
  translation: string
  notes?: string
}

export type MorphologyEntry = {
  ayah: string
  surahName: string
  words: MorphologyWord[]
}

export const morphologyEntries: MorphologyEntry[] = [
  {
    ayah: "1:1",
    surahName: "Al-Fatiha",
    words: [
      {
        arabic: "بِسْمِ",
        lemma: "اسْم",
        root: "س م و",
        stem: "Fi'l (noun) in construct",
        translation: "In the name",
        notes: "Derived from سمو meaning elevation, signalling the reverence of invoking Allah's name first.",
      },
      {
        arabic: "اللَّهِ",
        lemma: "اللّٰه",
        root: "أ ل ه",
        stem: "Proper noun",
        translation: "Allah",
        notes: "Central divine name; links to tawhid modules and vocabulary trackers.",
      },
      {
        arabic: "الرَّحْمٰنِ",
        lemma: "الرَّحْمٰن",
        root: "ر ح م",
        stem: "Form I (fa'lan) intensive",
        translation: "The Entirely Merciful",
        notes: "Connects to tajweed elongation (madd) drills when paired with color-coded Mushaf.",
      },
      {
        arabic: "الرَّحِيمِ",
        lemma: "الرَّحِيم",
        root: "ر ح م",
        stem: "Form I adjective",
        translation: "Especially Merciful",
      },
    ],
  },
  {
    ayah: "1:5",
    surahName: "Al-Fatiha",
    words: [
      {
        arabic: "إِيَّاكَ",
        lemma: "إِيَّا",
        root: "أ ي ي",
        stem: "Detached object pronoun",
        translation: "You alone",
        notes: "Triggers emphasis on shaddah — useful for tajweed mistake detection alerts.",
      },
      {
        arabic: "نَعْبُدُ",
        lemma: "ع ب د",
        root: "ع ب د",
        stem: "Form I imperfect",
        translation: "we worship",
      },
      {
        arabic: "وَإِيَّاكَ",
        lemma: "إِيَّا",
        root: "أ ي ي",
        stem: "Detached object pronoun",
        translation: "and You alone",
      },
      {
        arabic: "نَسْتَعِينُ",
        lemma: "ع و ن",
        root: "ع و ن",
        stem: "Form X imperfect",
        translation: "we seek help",
        notes: "Maps to verb family drills in the adaptive grammar quiz.",
      },
    ],
  },
]
