
import type { ChildLesson } from "@/types/child-class"

const ORDINALS = [
  "First",
  "Second",
  "Third",
  "Fourth",
  "Fifth",
  "Sixth",
  "Seventh",
  "Eighth",
  "Ninth",
  "Tenth",
  "Eleventh",
  "Twelfth",
  "Thirteenth",
  "Fourteenth",
  "Fifteenth",
  "Sixteenth",
  "Seventeenth",
  "Eighteenth",
  "Nineteenth",
  "Twentieth",
  "Twenty-First",
  "Twenty-Second",
  "Twenty-Third",
  "Twenty-Fourth",
  "Twenty-Fifth",
  "Twenty-Sixth",
  "Twenty-Seventh",
  "Twenty-Eighth",
  "Twenty-Ninth",
  "Thirtieth",
  "Thirty-First",
  "Thirty-Second",
  "Thirty-Third",
  "Thirty-Fourth",
  "Thirty-Fifth",
  "Thirty-Sixth",
  "Thirty-Seventh",
  "Thirty-Eighth",
  "Thirty-Ninth",
  "Fortieth",
  "Forty-First",
  "Forty-Second",
  "Forty-Third",
  "Forty-Fourth",
  "Forty-Fifth",
  "Forty-Sixth",
  "Forty-Seventh",
  "Forty-Eighth",
  "Forty-Ninth",
  "Fiftieth",
  "Fifty-First",
  "Fifty-Second",
  "Fifty-Third",
  "Fifty-Fourth",
  "Fifty-Fifth",
  "Fifty-Sixth",
  "Fifty-Seventh",
  "Fifty-Eighth",
  "Fifty-Ninth",
  "Sixtieth",
]

interface LetterDefinition {
  day: number
  name: string
  character: string
  transliteration: string
  description: string
  fatha: { arabic: string; translit: string }
  kasrah: { arabic: string; translit: string }
  dhamma: { arabic: string; translit: string }
  sukoon: { arabic: string; translit: string }
  joining: { arabic: string; translit: string; description: string }
  practice: { arabic: string; translit: string; description: string }
}

interface StageWordDefinition {
  arabic: string
  translit: string
  meaning: string
  rule?: string
}

interface StageDefinition {
  day: number
  stage: string
  level: string
  focus: string
  intro: string
  words: StageWordDefinition[]
  practiceRule?: string
  reviewRule?: string
  reviewMessage?: string
}

const LETTER_DEFINITIONS: LetterDefinition[] = [
  {
    day: 1,
    name: "Alif",
    character: "أ",
    transliteration: "Alif",
    description: "The first letter of the Arabic alphabet",
    fatha: { arabic: "أَ", translit: "A" },
    kasrah: { arabic: "أِ", translit: "I" },
    dhamma: { arabic: "أُ", translit: "U" },
    sukoon: { arabic: "أْ", translit: "A (silent)" },
    joining: { arabic: "آ", translit: "Aa", description: "Long Alif sound" },
    practice: { arabic: "أَمَّ", translit: "Amma", description: "Mother - practice word" },
  },
  {
    day: 2,
    name: "Ba",
    character: "ب",
    transliteration: "Ba",
    description: "The second letter of the Arabic alphabet",
    fatha: { arabic: "بَ", translit: "Ba" },
    kasrah: { arabic: "بِ", translit: "Bi" },
    dhamma: { arabic: "بُ", translit: "Bu" },
    sukoon: { arabic: "بْ", translit: "B (silent)" },
    joining: { arabic: "بَا", translit: "Baa", description: "Ba joined with Alif" },
    practice: { arabic: "بَابْ", translit: "Baab", description: "Door - practice word" },
  },
  {
    day: 3,
    name: "Ta",
    character: "ت",
    transliteration: "Ta",
    description: "The third letter of the Arabic alphabet",
    fatha: { arabic: "تَ", translit: "Ta" },
    kasrah: { arabic: "تِ", translit: "Ti" },
    dhamma: { arabic: "تُ", translit: "Tu" },
    sukoon: { arabic: "تْ", translit: "T (silent)" },
    joining: { arabic: "تَا", translit: "Taa", description: "Ta joined with Alif" },
    practice: { arabic: "تَابْ", translit: "Taab", description: "Repented - practice word" },
  },
  {
    day: 4,
    name: "Tha",
    character: "ث",
    transliteration: "Tha",
    description: "The fourth letter of the Arabic alphabet",
    fatha: { arabic: "ثَ", translit: "Tha" },
    kasrah: { arabic: "ثِ", translit: "Thi" },
    dhamma: { arabic: "ثُ", translit: "Thu" },
    sukoon: { arabic: "ثْ", translit: "Th (silent)" },
    joining: { arabic: "ثَا", translit: "Thaa", description: "Tha joined with Alif" },
    practice: { arabic: "ثَابِتْ", translit: "Thabit", description: "Firm - practice word" },
  },
  {
    day: 5,
    name: "Jim",
    character: "ج",
    transliteration: "Jim",
    description: "The fifth letter of the Arabic alphabet",
    fatha: { arabic: "جَ", translit: "Ja" },
    kasrah: { arabic: "جِ", translit: "Ji" },
    dhamma: { arabic: "جُ", translit: "Ju" },
    sukoon: { arabic: "جْ", translit: "J (silent)" },
    joining: { arabic: "جَا", translit: "Jaa", description: "Jim joined with Alif" },
    practice: { arabic: "جَمِيلْ", translit: "Jamil", description: "Beautiful - practice word" },
  },
  {
    day: 6,
    name: "Ha",
    character: "ح",
    transliteration: "Ha",
    description: "The sixth letter of the Arabic alphabet",
    fatha: { arabic: "حَ", translit: "Ha" },
    kasrah: { arabic: "حِ", translit: "Hi" },
    dhamma: { arabic: "حُ", translit: "Hu" },
    sukoon: { arabic: "حْ", translit: "H (silent)" },
    joining: { arabic: "حَا", translit: "Haa", description: "Ha joined with Alif" },
    practice: { arabic: "حِكْمَة", translit: "Hikmah", description: "Wisdom - practice word" },
  },
  {
    day: 7,
    name: "Kha",
    character: "خ",
    transliteration: "Kha",
    description: "The seventh letter of the Arabic alphabet",
    fatha: { arabic: "خَ", translit: "Kha" },
    kasrah: { arabic: "خِ", translit: "Khi" },
    dhamma: { arabic: "خُ", translit: "Khu" },
    sukoon: { arabic: "خْ", translit: "Kh (silent)" },
    joining: { arabic: "خَا", translit: "Khaa", description: "Kha joined with Alif" },
    practice: { arabic: "خُبْز", translit: "Khubz", description: "Bread - practice word" },
  },
  {
    day: 8,
    name: "Dal",
    character: "د",
    transliteration: "Dal",
    description: "The eighth letter of the Arabic alphabet",
    fatha: { arabic: "دَ", translit: "Da" },
    kasrah: { arabic: "دِ", translit: "Di" },
    dhamma: { arabic: "دُ", translit: "Du" },
    sukoon: { arabic: "دْ", translit: "D (silent)" },
    joining: { arabic: "دَا", translit: "Daa", description: "Dal joined with Alif" },
    practice: { arabic: "دَرْس", translit: "Dars", description: "Lesson - practice word" },
  },
  {
    day: 9,
    name: "Thal",
    character: "ذ",
    transliteration: "Thal",
    description: "The ninth letter of the Arabic alphabet",
    fatha: { arabic: "ذَ", translit: "Tha" },
    kasrah: { arabic: "ذِ", translit: "Thi" },
    dhamma: { arabic: "ذُ", translit: "Thu" },
    sukoon: { arabic: "ذْ", translit: "Th (silent)" },
    joining: { arabic: "ذَا", translit: "Thaa", description: "Thal joined with Alif" },
    practice: { arabic: "ذِكْر", translit: "Dhikr", description: "Remembrance - practice word" },
  },
  {
    day: 10,
    name: "Ra",
    character: "ر",
    transliteration: "Ra",
    description: "The tenth letter of the Arabic alphabet",
    fatha: { arabic: "رَ", translit: "Ra" },
    kasrah: { arabic: "رِ", translit: "Ri" },
    dhamma: { arabic: "رُ", translit: "Ru" },
    sukoon: { arabic: "رْ", translit: "R (silent)" },
    joining: { arabic: "رَا", translit: "Raa", description: "Ra joined with Alif" },
    practice: { arabic: "رَبْ", translit: "Rabb", description: "Lord - practice word" },
  },
  {
    day: 11,
    name: "Zay",
    character: "ز",
    transliteration: "Zay",
    description: "The eleventh letter of the Arabic alphabet",
    fatha: { arabic: "زَ", translit: "Za" },
    kasrah: { arabic: "زِ", translit: "Zi" },
    dhamma: { arabic: "زُ", translit: "Zu" },
    sukoon: { arabic: "زْ", translit: "Z (silent)" },
    joining: { arabic: "زَا", translit: "Zaa", description: "Zay joined with Alif" },
    practice: { arabic: "زَهْرَة", translit: "Zahrah", description: "Flower - practice word" },
  },
  {
    day: 12,
    name: "Seen",
    character: "س",
    transliteration: "Seen",
    description: "The twelfth letter of the Arabic alphabet",
    fatha: { arabic: "سَ", translit: "Sa" },
    kasrah: { arabic: "سِ", translit: "Si" },
    dhamma: { arabic: "سُ", translit: "Su" },
    sukoon: { arabic: "سْ", translit: "S (silent)" },
    joining: { arabic: "سَا", translit: "Saa", description: "Seen joined with Alif" },
    practice: { arabic: "سَلَام", translit: "Salaam", description: "Peace - practice word" },
  },
  {
    day: 13,
    name: "Sheen",
    character: "ش",
    transliteration: "Sheen",
    description: "The thirteenth letter of the Arabic alphabet",
    fatha: { arabic: "شَ", translit: "Sha" },
    kasrah: { arabic: "شِ", translit: "Shi" },
    dhamma: { arabic: "شُ", translit: "Shu" },
    sukoon: { arabic: "شْ", translit: "Sh (silent)" },
    joining: { arabic: "شَا", translit: "Shaa", description: "Sheen joined with Alif" },
    practice: { arabic: "شَمْس", translit: "Shams", description: "Sun - practice word" },
  },
  {
    day: 14,
    name: "Sad",
    character: "ص",
    transliteration: "Sad",
    description: "The fourteenth letter of the Arabic alphabet",
    fatha: { arabic: "صَ", translit: "Sa" },
    kasrah: { arabic: "صِ", translit: "Si" },
    dhamma: { arabic: "صُ", translit: "Su" },
    sukoon: { arabic: "صْ", translit: "S (silent)" },
    joining: { arabic: "صَا", translit: "Saa", description: "Sad joined with Alif" },
    practice: { arabic: "صَبْر", translit: "Sabr", description: "Patience - practice word" },
  },
  {
    day: 15,
    name: "Dad",
    character: "ض",
    transliteration: "Dad",
    description: "The fifteenth letter of the Arabic alphabet",
    fatha: { arabic: "ضَ", translit: "Da" },
    kasrah: { arabic: "ضِ", translit: "Di" },
    dhamma: { arabic: "ضُ", translit: "Du" },
    sukoon: { arabic: "ضْ", translit: "D (silent)" },
    joining: { arabic: "ضَا", translit: "Daa", description: "Dad joined with Alif" },
    practice: { arabic: "ضِيَاء", translit: "Diyaa", description: "Radiance - practice word" },
  },
  {
    day: 16,
    name: "Tah",
    character: "ط",
    transliteration: "Tah",
    description: "The sixteenth letter of the Arabic alphabet",
    fatha: { arabic: "طَ", translit: "Ta" },
    kasrah: { arabic: "طِ", translit: "Ti" },
    dhamma: { arabic: "طُ", translit: "Tu" },
    sukoon: { arabic: "طْ", translit: "T (silent)" },
    joining: { arabic: "طَا", translit: "Taa", description: "Tah joined with Alif" },
    practice: { arabic: "طَلَب", translit: "Talab", description: "Request - practice word" },
  },
  {
    day: 17,
    name: "Zah",
    character: "ظ",
    transliteration: "Zah",
    description: "The seventeenth letter of the Arabic alphabet",
    fatha: { arabic: "ظَ", translit: "Za" },
    kasrah: { arabic: "ظِ", translit: "Zi" },
    dhamma: { arabic: "ظُ", translit: "Zu" },
    sukoon: { arabic: "ظْ", translit: "Z (silent)" },
    joining: { arabic: "ظَا", translit: "Zaa", description: "Zah joined with Alif" },
    practice: { arabic: "ظِل", translit: "Zill", description: "Shade - practice word" },
  },
  {
    day: 18,
    name: "Ain",
    character: "ع",
    transliteration: "Ain",
    description: "The eighteenth letter of the Arabic alphabet",
    fatha: { arabic: "عَ", translit: "Aa" },
    kasrah: { arabic: "عِ", translit: "Ii" },
    dhamma: { arabic: "عُ", translit: "Uu" },
    sukoon: { arabic: "عْ", translit: "ʿ (silent)" },
    joining: { arabic: "عَا", translit: "ʿaa", description: "Ain joined with Alif" },
    practice: { arabic: "عِلْم", translit: "Ilm", description: "Knowledge - practice word" },
  },
  {
    day: 19,
    name: "Ghain",
    character: "غ",
    transliteration: "Ghain",
    description: "The nineteenth letter of the Arabic alphabet",
    fatha: { arabic: "غَ", translit: "Gha" },
    kasrah: { arabic: "غِ", translit: "Ghi" },
    dhamma: { arabic: "غُ", translit: "Ghu" },
    sukoon: { arabic: "غْ", translit: "Gh (silent)" },
    joining: { arabic: "غَا", translit: "Ghaa", description: "Ghain joined with Alif" },
    practice: { arabic: "غَيْم", translit: "Ghaym", description: "Cloud - practice word" },
  },
  {
    day: 20,
    name: "Fa",
    character: "ف",
    transliteration: "Fa",
    description: "The twentieth letter of the Arabic alphabet",
    fatha: { arabic: "فَ", translit: "Fa" },
    kasrah: { arabic: "فِ", translit: "Fi" },
    dhamma: { arabic: "فُ", translit: "Fu" },
    sukoon: { arabic: "فْ", translit: "F (silent)" },
    joining: { arabic: "فَا", translit: "Faa", description: "Fa joined with Alif" },
    practice: { arabic: "فَجْر", translit: "Fajr", description: "Dawn - practice word" },
  },
  {
    day: 21,
    name: "Qaf",
    character: "ق",
    transliteration: "Qaf",
    description: "The twenty-first letter of the Arabic alphabet",
    fatha: { arabic: "قَ", translit: "Qa" },
    kasrah: { arabic: "قِ", translit: "Qi" },
    dhamma: { arabic: "قُ", translit: "Qu" },
    sukoon: { arabic: "قْ", translit: "Q (silent)" },
    joining: { arabic: "قَا", translit: "Qaa", description: "Qaf joined with Alif" },
    practice: { arabic: "قَلْب", translit: "Qalb", description: "Heart - practice word" },
  },
  {
    day: 22,
    name: "Kaf",
    character: "ك",
    transliteration: "Kaf",
    description: "The twenty-second letter of the Arabic alphabet",
    fatha: { arabic: "كَ", translit: "Ka" },
    kasrah: { arabic: "كِ", translit: "Ki" },
    dhamma: { arabic: "كُ", translit: "Ku" },
    sukoon: { arabic: "كْ", translit: "K (silent)" },
    joining: { arabic: "كَا", translit: "Kaa", description: "Kaf joined with Alif" },
    practice: { arabic: "كِتَاب", translit: "Kitaab", description: "Book - practice word" },
  },
  {
    day: 23,
    name: "Lam",
    character: "ل",
    transliteration: "Lam",
    description: "The twenty-third letter of the Arabic alphabet",
    fatha: { arabic: "لَ", translit: "La" },
    kasrah: { arabic: "لِ", translit: "Li" },
    dhamma: { arabic: "لُ", translit: "Lu" },
    sukoon: { arabic: "لْ", translit: "L (silent)" },
    joining: { arabic: "لَا", translit: "Laa", description: "Lam joined with Alif" },
    practice: { arabic: "لُغَة", translit: "Lughah", description: "Language - practice word" },
  },
  {
    day: 24,
    name: "Mim",
    character: "م",
    transliteration: "Mim",
    description: "The twenty-fourth letter of the Arabic alphabet",
    fatha: { arabic: "مَ", translit: "Ma" },
    kasrah: { arabic: "مِ", translit: "Mi" },
    dhamma: { arabic: "مُ", translit: "Mu" },
    sukoon: { arabic: "مْ", translit: "M (silent)" },
    joining: { arabic: "مَا", translit: "Maa", description: "Mim joined with Alif" },
    practice: { arabic: "مَدْرَسَة", translit: "Madrasah", description: "School - practice word" },
  },
  {
    day: 25,
    name: "Nun",
    character: "ن",
    transliteration: "Nun",
    description: "The twenty-fifth letter of the Arabic alphabet",
    fatha: { arabic: "نَ", translit: "Na" },
    kasrah: { arabic: "نِ", translit: "Ni" },
    dhamma: { arabic: "نُ", translit: "Nu" },
    sukoon: { arabic: "نْ", translit: "N (silent)" },
    joining: { arabic: "نَا", translit: "Naa", description: "Nun joined with Alif" },
    practice: { arabic: "نُور", translit: "Noor", description: "Light - practice word" },
  },
  {
    day: 26,
    name: "Ha",
    character: "ه",
    transliteration: "Ha",
    description: "The twenty-sixth letter of the Arabic alphabet",
    fatha: { arabic: "هَ", translit: "Ha" },
    kasrah: { arabic: "هِ", translit: "Hi" },
    dhamma: { arabic: "هُ", translit: "Hu" },
    sukoon: { arabic: "هْ", translit: "H (silent)" },
    joining: { arabic: "هَا", translit: "Haa", description: "Soft Ha joined with Alif" },
    practice: { arabic: "هَدِيَّة", translit: "Hadiyyah", description: "Gift - practice word" },
  },
  {
    day: 27,
    name: "Waw",
    character: "و",
    transliteration: "Waw",
    description: "The twenty-seventh letter of the Arabic alphabet",
    fatha: { arabic: "وَ", translit: "Wa" },
    kasrah: { arabic: "وِ", translit: "Wi" },
    dhamma: { arabic: "وُ", translit: "Wu" },
    sukoon: { arabic: "وْ", translit: "W (silent)" },
    joining: { arabic: "وَا", translit: "Waa", description: "Waw joined with Alif" },
    practice: { arabic: "وَرْد", translit: "Ward", description: "Rose - practice word" },
  },
  {
    day: 28,
    name: "Ya",
    character: "ي",
    transliteration: "Ya",
    description: "The twenty-eighth letter of the Arabic alphabet",
    fatha: { arabic: "يَ", translit: "Ya" },
    kasrah: { arabic: "يِ", translit: "Yi" },
    dhamma: { arabic: "يُ", translit: "Yu" },
    sukoon: { arabic: "يْ", translit: "Y (silent)" },
    joining: { arabic: "يَا", translit: "Yaa", description: "Ya joined with Alif" },
    practice: { arabic: "يَقِين", translit: "Yaqeen", description: "Certainty - practice word" },
  },
]

type LessonEnrichment = Omit<ChildLesson, "id">

const DAY_ENRICHMENTS: Record<number, LessonEnrichment[]> = {
  1: [
    {
      day: 1,
      title: "Tanwin Introduction",
      level: "Beginner",
      arabic: "ًٌٍ",
      translit: "tanwin signs",
      rule: "Tanwin",
      description: "Discover the double vowel endings called tanwin.",
    },
    {
      day: 1,
      title: "Tanwin Fathatan",
      level: "Beginner",
      arabic: "بً",
      translit: "ban",
      rule: "Tanwin Fatha",
      description: "Practice the -an sound using fathatan.",
    },
    {
      day: 1,
      title: "Tanwin Kasratan",
      level: "Beginner",
      arabic: "بٍ",
      translit: "bin",
      rule: "Tanwin Kasrah",
      description: "Practice the -in sound using kasratan.",
    },
    {
      day: 1,
      title: "Tanwin Dammatan",
      level: "Beginner",
      arabic: "بٌ",
      translit: "bun",
      rule: "Tanwin Dhamma",
      description: "Practice the -un sound using dammatan.",
    },
    {
      day: 1,
      title: "Syllable Blend: أَبَ",
      level: "Beginner",
      arabic: "أَبَ",
      translit: "aba",
      rule: "Blend Practice",
      description: "Blend Alif with Ba for a smooth syllable.",
    },
    {
      day: 1,
      title: "Syllable Blend: أَتَ",
      level: "Beginner",
      arabic: "أَتَ",
      translit: "ata",
      rule: "Blend Practice",
      description: "Blend Alif with Ta to form a light syllable.",
    },
    {
      day: 1,
      title: "Ending Practice: أَنْ",
      level: "Beginner",
      arabic: "أَنْ",
      translit: "an",
      rule: "Ending Practice",
      description: "Combine Alif with Nun Sukoon for a nasal ending.",
    },
    {
      day: 1,
      title: "Vowel Mix Drill",
      level: "Beginner",
      arabic: "أَ • أِ • أُ",
      translit: "a • i • u",
      rule: "Vowel Review",
      description: "Compare all short vowels on Alif in one go.",
    },
    {
      day: 1,
      title: "Word Practice: أَمَان",
      level: "Beginner+",
      arabic: "أَمَان",
      translit: "amaan",
      rule: "Word Practice",
      description: "Meaning: Safety – read this gentle word.",
    },
    {
      day: 1,
      title: "Word Practice: إِيمَان",
      level: "Beginner+",
      arabic: "إِيمَان",
      translit: "imaan",
      rule: "Word Practice",
      description: "Meaning: Faith – practise a slightly longer word.",
    },
    {
      day: 1,
      title: "Stretch Sound: آ",
      level: "Beginner+",
      arabic: "آ",
      translit: "aa",
      rule: "Madd Practice",
      description: "Stretch the Alif sound for two counts.",
    },
    {
      day: 1,
      title: "Reading Challenge: أُنْس",
      level: "Beginner+",
      arabic: "أُنْس",
      translit: "uns",
      rule: "Challenge",
      description: "Meaning: Warm companionship – read slowly and clearly.",
    },
    {
      day: 1,
      title: "Mini Quiz: Vowels",
      level: "Beginner",
      arabic: "؟",
      translit: "quiz",
      rule: "Check-Up",
      description: "Point to the matching vowel sound for Alif.",
    },
  ],
  3: [
    {
      day: 3,
      title: "Tanwin with Ta (an)",
      level: "Beginner",
      arabic: "تً",
      translit: "tan",
      rule: "Tanwin Fatha",
      description: "Add fathatan to Ta for the bright -an ending.",
    },
    {
      day: 3,
      title: "Tanwin with Ta (in)",
      level: "Beginner",
      arabic: "تٍ",
      translit: "tin",
      rule: "Tanwin Kasrah",
      description: "Add kasratan to Ta for the gentle -in ending.",
    },
    {
      day: 3,
      title: "Tanwin with Ta (un)",
      level: "Beginner",
      arabic: "تٌ",
      translit: "tun",
      rule: "Tanwin Dhamma",
      description: "Add dammatan to Ta for the rounded -un ending.",
    },
    {
      day: 3,
      title: "Blend Ladder: تَ • تِ • تُ",
      level: "Beginner",
      arabic: "تَ • تِ • تُ",
      translit: "ta • ti • tu",
      rule: "Blend Drill",
      description: "Chant Ta with every short vowel in a flowing rhythm.",
    },
    {
      day: 3,
      title: "Syllable Bridge: تَا + بَ",
      level: "Beginner",
      arabic: "تَا + بَ = تَابَ",
      translit: "taa + ba = taaba",
      rule: "Blend Practice",
      description: "Join Ta and Ba to read a smooth open syllable.",
    },
    {
      day: 3,
      title: "Word Practice: بَيْتٌ",
      level: "Beginner+",
      arabic: "بَيْتٌ",
      translit: "baytun",
      rule: "Tanwin Word",
      description: "Meaning: house – notice the Ta before the tanwin ending.",
    },
    {
      day: 3,
      title: "Word Practice: كِتَابٌ",
      level: "Beginner+",
      arabic: "كِتَابٌ",
      translit: "kitaabun",
      rule: "Tanwin Word",
      description: "Meaning: book – Ta shines in the middle of the word.",
    },
    {
      day: 3,
      title: "Word Practice: تَاجٌ",
      level: "Beginner+",
      arabic: "تَاجٌ",
      translit: "taajun",
      rule: "Tanwin Word",
      description: "Meaning: crown – read with a soft tanwin sound.",
    },
    {
      day: 3,
      title: "Word Practice: وَقْتٌ",
      level: "Beginner+",
      arabic: "وَقْتٌ",
      translit: "waqtun",
      rule: "Tanwin Word",
      description: "Meaning: time – pause lightly on the sukoon before tanwin.",
    },
    {
      day: 3,
      title: "Word Practice: مِفْتَاحٌ",
      level: "Explorer",
      arabic: "مِفْتَاحٌ",
      translit: "miftaahun",
      rule: "Tanwin Word",
      description: "Meaning: key – stretch the long alif before Ta.",
    },
    {
      day: 3,
      title: "Word Practice: نَبَاتٌ",
      level: "Explorer",
      arabic: "نَبَاتٌ",
      translit: "nabaatun",
      rule: "Tanwin Word",
      description: "Meaning: plant – feel the light Ta ahead of tanwin.",
    },
    {
      day: 3,
      title: "Reading Challenge: تِلْمِيذٌ",
      level: "Explorer",
      arabic: "تِلْمِيذٌ",
      translit: "tilmeedhun",
      rule: "Challenge",
      description: "Meaning: student – glide over the dh sound after Ta.",
    },
    {
      day: 3,
      title: "Mini Phrase: تَابَ تَائِبٌ",
      level: "Explorer",
      arabic: "تَابَ تَائِبٌ",
      translit: "taaba taa'ibun",
      rule: "Phrase Practice",
      description: "Meaning: a repentant person repented – trace both shining Ta sounds.",
    },
  ],
}


const TWO_LETTER_WORDS: StageDefinition[] = [
  {
    day: 29,
    stage: "Two-Letter Words",
    level: "Explorer",
    focus: "Long Alif Blends",
    intro: "Blend consonants with long alif to make smooth open sounds.",
    words: [
      { arabic: "بَا", translit: "Baa", meaning: "ba" },
      { arabic: "تَا", translit: "Taa", meaning: "ta" },
      { arabic: "مَا", translit: "Maa", meaning: "ma" },
      { arabic: "نَا", translit: "Naa", meaning: "na" },
      { arabic: "لَا", translit: "Laa", meaning: "la" },
    ],
  },
  {
    day: 30,
    stage: "Two-Letter Words",
    level: "Explorer",
    focus: "Kasrah Melodies",
    intro: "Say cheerful two-letter sounds with the smiling kasrah vowel.",
    words: [
      { arabic: "بِي", translit: "Bee", meaning: "bi" },
      { arabic: "تِي", translit: "Tee", meaning: "ti" },
      { arabic: "مِي", translit: "Mee", meaning: "mi" },
      { arabic: "نِي", translit: "Nee", meaning: "ni" },
      { arabic: "سِي", translit: "See", meaning: "si" },
    ],
  },
  {
    day: 31,
    stage: "Two-Letter Words",
    level: "Explorer",
    focus: "Damma Rockets",
    intro: "Round your lips for playful damma sounds that zoom like rockets.",
    words: [
      { arabic: "بُو", translit: "Boo", meaning: "bu" },
      { arabic: "تُو", translit: "Too", meaning: "tu" },
      { arabic: "مُو", translit: "Moo", meaning: "mu" },
      { arabic: "نُو", translit: "Noo", meaning: "nu" },
      { arabic: "سُو", translit: "Soo", meaning: "su" },
    ],
  },
  {
    day: 32,
    stage: "Two-Letter Words",
    level: "Explorer",
    focus: "Sukoon Stoppers",
    intro: "Practice gentle stops with sukoon at the end of two-letter combos.",
    words: [
      { arabic: "أَبْ", translit: "Ab", meaning: "father" },
      { arabic: "أَتْ", translit: "At", meaning: "you" },
      { arabic: "أَلْ", translit: "Al", meaning: "the" },
      { arabic: "أَمْ", translit: "Am", meaning: "am" },
      { arabic: "أَنْ", translit: "An", meaning: "that" },
    ],
  },
  {
    day: 33,
    stage: "Two-Letter Words",
    level: "Explorer",
    focus: "Sunbeam Sounds",
    intro: "Shine bright with sunny letters that pair with alif.",
    words: [
      { arabic: "رَا", translit: "Raa", meaning: "ra" },
      { arabic: "زَا", translit: "Zaa", meaning: "za" },
      { arabic: "دَا", translit: "Daa", meaning: "da" },
      { arabic: "سَا", translit: "Saa", meaning: "sa" },
      { arabic: "شَا", translit: "Shaa", meaning: "sha" },
    ],
  },
  {
    day: 34,
    stage: "Two-Letter Words",
    level: "Explorer",
    focus: "Wavy Ya Blends",
    intro: "Glide into graceful sounds that end with the letter ya.",
    words: [
      { arabic: "بَيْ", translit: "Bay", meaning: "bay" },
      { arabic: "تَيْ", translit: "Tay", meaning: "tay" },
      { arabic: "مَيْ", translit: "May", meaning: "may" },
      { arabic: "نَيْ", translit: "Nay", meaning: "nay" },
      { arabic: "سَيْ", translit: "Say", meaning: "say" },
    ],
  },
]


const THREE_LETTER_WORDS: StageDefinition[] = [
  {
    day: 35,
    stage: "Three-Letter Words",
    level: "Adventurer",
    focus: "Everyday Treasures",
    intro: "Read friendly three-letter words you will meet all the time.",
    words: [
      { arabic: "أَمَل", translit: "Amal", meaning: "hope" },
      { arabic: "قَلَم", translit: "Qalam", meaning: "pen" },
      { arabic: "كَلْب", translit: "Kalb", meaning: "dog" },
      { arabic: "نُور", translit: "Noor", meaning: "light" },
      { arabic: "عِلْم", translit: "Ilm", meaning: "knowledge" },
    ],
  },
  {
    day: 36,
    stage: "Three-Letter Words",
    level: "Adventurer",
    focus: "Action Heroes",
    intro: "Sound out energetic three-letter verbs in the past tense.",
    words: [
      { arabic: "كَتَبَ", translit: "Kataba", meaning: "he wrote" },
      { arabic: "قَرَأَ", translit: "Qara'a", meaning: "he read" },
      { arabic: "دَرَسَ", translit: "Darasa", meaning: "he studied" },
      { arabic: "حَفِظَ", translit: "Hafiza", meaning: "he memorised" },
      { arabic: "شَرِبَ", translit: "Shariba", meaning: "he drank" },
    ],
  },
  {
    day: 37,
    stage: "Three-Letter Words",
    level: "Adventurer",
    focus: "Nature Wonders",
    intro: "Explore nature with three-letter Arabic words.",
    words: [
      { arabic: "بَحْر", translit: "Bahr", meaning: "sea" },
      { arabic: "نَهْر", translit: "Nahr", meaning: "river" },
      { arabic: "جَبَل", translit: "Jabal", meaning: "mountain" },
      { arabic: "رِيح", translit: "Reeh", meaning: "wind" },
      { arabic: "زَرْع", translit: "Zarʿ", meaning: "crops" },
    ],
  },
  {
    day: 38,
    stage: "Three-Letter Words",
    level: "Adventurer",
    focus: "Family & Friends",
    intro: "Meet family-themed three-letter Arabic words.",
    words: [
      { arabic: "أَب", translit: "Ab", meaning: "father" },
      { arabic: "أُم", translit: "Umm", meaning: "mother" },
      { arabic: "أَخ", translit: "Akh", meaning: "brother" },
      { arabic: "أُخْت", translit: "Ukht", meaning: "sister" },
      { arabic: "صَدِيق", translit: "Sadeeq", meaning: "friend" },
    ],
  },
  {
    day: 39,
    stage: "Three-Letter Words",
    level: "Adventurer",
    focus: "Time & Place",
    intro: "Practice three-letter words that describe time and spaces.",
    words: [
      { arabic: "يَوْم", translit: "Yawm", meaning: "day" },
      { arabic: "لَيْل", translit: "Layl", meaning: "night" },
      { arabic: "بَيْت", translit: "Bayt", meaning: "house" },
      { arabic: "سُوق", translit: "Sooq", meaning: "market" },
      { arabic: "مَسْجِد", translit: "Masjid", meaning: "mosque" },
    ],
  },
  {
    day: 40,
    stage: "Three-Letter Words",
    level: "Adventurer",
    focus: "Faith Words",
    intro: "Let your heart smile with spiritual three-letter words.",
    words: [
      { arabic: "دِين", translit: "Deen", meaning: "religion" },
      { arabic: "إِيمَان", translit: "Imaan", meaning: "faith" },
      { arabic: "دُعَاء", translit: "Du'aa", meaning: "supplication" },
      { arabic: "سَبْح", translit: "Sabḥ", meaning: "glorify" },
      { arabic: "حَمْد", translit: "Hamd", meaning: "praise" },
    ],
  },
]


const FOUR_LETTER_WORDS: StageDefinition[] = [
  {
    day: 41,
    stage: "Four-Letter Words",
    level: "Trailblazer",
    focus: "School Stars",
    intro: "Grow confident with four-letter words you use in class.",
    words: [
      { arabic: "كِتَاب", translit: "Kitaab", meaning: "book" },
      { arabic: "دَرْس", translit: "Dars", meaning: "lesson" },
      { arabic: "قَلَم", translit: "Qalam", meaning: "pen" },
      { arabic: "صَفّ", translit: "Saff", meaning: "row" },
      { arabic: "مَكْتَب", translit: "Maktab", meaning: "desk" },
    ],
  },
  {
    day: 42,
    stage: "Four-Letter Words",
    level: "Trailblazer",
    focus: "Home Helpers",
    intro: "Read words that make a cosy home feel welcoming.",
    words: [
      { arabic: "بَاب", translit: "Baab", meaning: "door" },
      { arabic: "شُبَّاك", translit: "Shubbak", meaning: "window" },
      { arabic: "سِتَار", translit: "Sittar", meaning: "curtain" },
      { arabic: "سَقْف", translit: "Saqf", meaning: "ceiling" },
      { arabic: "أَرِيكَة", translit: "Areekah", meaning: "sofa" },
    ],
  },
  {
    day: 43,
    stage: "Four-Letter Words",
    level: "Trailblazer",
    focus: "Nature Explorers",
    intro: "Spot four-letter words hidden in the outdoors.",
    words: [
      { arabic: "نَخْل", translit: "Nakhl", meaning: "palm tree" },
      { arabic: "طَيْر", translit: "Tayr", meaning: "bird" },
      { arabic: "رَبِيع", translit: "Rabee'", meaning: "spring" },
      { arabic: "زَهْر", translit: "Zahr", meaning: "flower" },
      { arabic: "ثَلْج", translit: "Thalj", meaning: "snow" },
    ],
  },
  {
    day: 44,
    stage: "Four-Letter Words",
    level: "Trailblazer",
    focus: "Feeling Words",
    intro: "Name four-letter feelings with clarity and heart.",
    words: [
      { arabic: "حُبّ", translit: "Hubb", meaning: "love" },
      { arabic: "فَرَح", translit: "Farah", meaning: "joy" },
      { arabic: "خَوْف", translit: "Khawf", meaning: "fear" },
      { arabic: "رَجَاء", translit: "Rajaa", meaning: "hope" },
      { arabic: "أَمْن", translit: "Amn", meaning: "safety" },
    ],
  },
  {
    day: 45,
    stage: "Four-Letter Words",
    level: "Trailblazer",
    focus: "Faith Moments",
    intro: "Read words that shine during acts of worship.",
    words: [
      { arabic: "صَلَاة", translit: "Salaah", meaning: "prayer" },
      { arabic: "زَكَاة", translit: "Zakaah", meaning: "charity" },
      { arabic: "صَوْم", translit: "Sawm", meaning: "fasting" },
      { arabic: "حَجّ", translit: "Hajj", meaning: "pilgrimage" },
      { arabic: "دُعَاء", translit: "Du'aa", meaning: "supplication" },
    ],
  },
  {
    day: 46,
    stage: "Four-Letter Words",
    level: "Trailblazer",
    focus: "Community Helpers",
    intro: "Celebrate four-letter words that describe helpful people.",
    words: [
      { arabic: "طَبِيب", translit: "Tabeeb", meaning: "doctor" },
      { arabic: "مُعَلِّم", translit: "Mu'allim", meaning: "teacher" },
      { arabic: "خَبَّاز", translit: "Khabbaz", meaning: "baker" },
      { arabic: "نَجَّار", translit: "Najjar", meaning: "carpenter" },
      { arabic: "مُهَنْدِس", translit: "Muhandis", meaning: "engineer" },
    ],
  },
]


const FIVE_LETTER_WORDS: StageDefinition[] = [
  {
    day: 47,
    stage: "Five-Letter Words",
    level: "Champion",
    focus: "Travel Adventures",
    intro: "Set off with five-letter words for journeys and trips.",
    words: [
      { arabic: "سَفَرَة", translit: "Safarah", meaning: "journey" },
      { arabic: "مَطَار", translit: "Matar", meaning: "airport" },
      { arabic: "قِطَار", translit: "Qitar", meaning: "train" },
      { arabic: "حَقِيبَة", translit: "Haqeebah", meaning: "bag" },
      { arabic: "خَرِيطَة", translit: "Khareetah", meaning: "map" },
    ],
  },
  {
    day: 48,
    stage: "Five-Letter Words",
    level: "Champion",
    focus: "Healthy Habits",
    intro: "Strengthen reading with five-letter words about wellness.",
    words: [
      { arabic: "تَمْرِين", translit: "Tamreen", meaning: "exercise" },
      { arabic: "طَبِيبَة", translit: "Tabeebah", meaning: "female doctor" },
      { arabic: "أَدْوِيَة", translit: "Adwiyah", meaning: "medicines" },
      { arabic: "مُسْتَشْفَى", translit: "Mustashfa", meaning: "hospital" },
      { arabic: "صِحَّة", translit: "Siḥhah", meaning: "health" },
    ],
  },
  {
    day: 49,
    stage: "Five-Letter Words",
    level: "Champion",
    focus: "Science Sparks",
    intro: "Discover science-themed five-letter Arabic words.",
    words: [
      { arabic: "مِجْهَر", translit: "Mijhar", meaning: "microscope" },
      { arabic: "مِقْيَاس", translit: "Miqyaas", meaning: "measure" },
      { arabic: "مَخْبَر", translit: "Makhbar", meaning: "laboratory" },
      { arabic: "مَعْمَل", translit: "Ma'mal", meaning: "workshop" },
      { arabic: "نَتِيجَة", translit: "Nateejah", meaning: "result" },
    ],
  },
  {
    day: 50,
    stage: "Five-Letter Words",
    level: "Champion",
    focus: "Creative Arts",
    intro: "Paint, draw, and sing with expressive five-letter words.",
    words: [
      { arabic: "لَوْحَة", translit: "Lawhah", meaning: "canvas" },
      { arabic: "فَنَّان", translit: "Fannaan", meaning: "artist" },
      { arabic: "مُوسِيقَى", translit: "Mooseeqaa", meaning: "music" },
      { arabic: "مَسْرَح", translit: "Masraḥ", meaning: "stage" },
      { arabic: "قَصِيدَة", translit: "Qaseedah", meaning: "poem" },
    ],
  },
  {
    day: 51,
    stage: "Five-Letter Words",
    level: "Champion",
    focus: "Service & Kindness",
    intro: "Read about helping others with five-letter acts of kindness.",
    words: [
      { arabic: "مُتَطَوِّع", translit: "Mutatawwiʿ", meaning: "volunteer" },
      { arabic: "مُسَاعَدَة", translit: "Musaadah", meaning: "helping" },
      { arabic: "إِغَاثَة", translit: "Ighaathah", meaning: "relief" },
      { arabic: "تَبَرُّع", translit: "Tabarruʿ", meaning: "donation" },
      { arabic: "خِدْمَة", translit: "Khidmah", meaning: "service" },
    ],
  },
  {
    day: 52,
    stage: "Five-Letter Words",
    level: "Champion",
    focus: "Festive Joy",
    intro: "Celebrate seasons with cheerful five-letter words.",
    words: [
      { arabic: "عِيدِيَّة", translit: "Eediyyah", meaning: "Eid gift" },
      { arabic: "تَهَانِي", translit: "Tahani", meaning: "greetings" },
      { arabic: "مَوْسِم", translit: "Mawsim", meaning: "season" },
      { arabic: "فَرَحَة", translit: "Farhah", meaning: "celebration" },
      { arabic: "ضِيَافَة", translit: "Dhiyaafah", meaning: "hospitality" },
    ],
  },
]


const SIX_LETTER_WORDS: StageDefinition[] = [
  {
    day: 53,
    stage: "Six-Letter Words",
    level: "Scholar",
    focus: "Nature Scenes",
    intro: "Read flowing six-letter words that paint outdoor scenes.",
    words: [
      { arabic: "حَدِيقَة", translit: "Hadeeqah", meaning: "garden" },
      { arabic: "جَبَلِيَّة", translit: "Jabaliyyah", meaning: "mountainous" },
      { arabic: "شَلَّال", translit: "Shallaal", meaning: "waterfall" },
      { arabic: "غَيْمَة", translit: "Ghaymah", meaning: "cloud" },
      { arabic: "رَمْلِيَّة", translit: "Ramliyyah", meaning: "sandy" },
    ],
  },
  {
    day: 54,
    stage: "Six-Letter Words",
    level: "Scholar",
    focus: "Community Places",
    intro: "Discover six-letter words for places in your neighbourhood.",
    words: [
      { arabic: "مَكْتَبَة", translit: "Maktabah", meaning: "library" },
      { arabic: "مَسْرَحِيَّة", translit: "Masrahiyyah", meaning: "play" },
      { arabic: "مَسْبَحَة", translit: "Masbahah", meaning: "pool" },
      { arabic: "مَلْعَب", translit: "Malʿab", meaning: "stadium" },
      { arabic: "مُسْتَشْفَى", translit: "Mustashfa", meaning: "hospital" },
    ],
  },
  {
    day: 55,
    stage: "Six-Letter Words",
    level: "Scholar",
    focus: "Heart Feelings",
    intro: "Feel and pronounce heartfelt six-letter Arabic words.",
    words: [
      { arabic: "مَحَبَّة", translit: "Mahabbah", meaning: "affection" },
      { arabic: "مَوَدَّة", translit: "Mawaddah", meaning: "compassion" },
      { arabic: "سَعَادَة", translit: "Saʿaadah", meaning: "happiness" },
      { arabic: "طُمَأْنِينَة", translit: "Tuma'ninah", meaning: "calmness" },
      { arabic: "اِحْتِرَام", translit: "Ihtiraam", meaning: "respect" },
    ],
  },
  {
    day: 56,
    stage: "Six-Letter Words",
    level: "Scholar",
    focus: "Faith Journeys",
    intro: "Travel through six-letter words from the Qur'an and sunnah.",
    words: [
      { arabic: "مُؤْمِنَة", translit: "Mu'minah", meaning: "believing woman" },
      { arabic: "مُسْلِمَة", translit: "Muslimah", meaning: "Muslim woman" },
      { arabic: "مُتَّقِينَ", translit: "Muttaqeen", meaning: "the mindful" },
      { arabic: "مُهَاجِر", translit: "Muhajir", meaning: "migrant" },
      { arabic: "غَافِرُون", translit: "Ghafirun", meaning: "forgivers" },
    ],
  },
]


const QURAN_WORDS: StageDefinition[] = [
  {
    day: 57,
    stage: "Quran Words",
    level: "Quran Star",
    focus: "Mercy & Guidance",
    intro: "Learn bright Qur'an words about Allah's mercy and guidance.",
    practiceRule: "Vocabulary Practice",
    reviewRule: "Word Review",
    words: [
      { arabic: "رَحْمَة", translit: "Rahmah", meaning: "mercy" },
      { arabic: "هُدًى", translit: "Hudan", meaning: "guidance" },
      { arabic: "نُور", translit: "Noor", meaning: "light" },
      { arabic: "إِيمَان", translit: "Eemaan", meaning: "faith" },
      { arabic: "صَبْر", translit: "Sabr", meaning: "patience" },
    ],
    reviewMessage: "Use each word in a short dua or reminder sentence.",
  },
  {
    day: 58,
    stage: "Quran Words",
    level: "Quran Star",
    focus: "Worship & Community",
    intro: "Build a worship vocabulary with high-frequency Qur'an words.",
    practiceRule: "Vocabulary Practice",
    reviewRule: "Word Review",
    words: [
      { arabic: "صَلَاة", translit: "Salaah", meaning: "prayer" },
      { arabic: "زَكَاة", translit: "Zakaah", meaning: "charity" },
      { arabic: "صِرَاط", translit: "Siraat", meaning: "path" },
      { arabic: "أُمَّة", translit: "Ummah", meaning: "community" },
      { arabic: "آخِرَة", translit: "Aakhirah", meaning: "hereafter" },
    ],
    reviewMessage: "Match each word to its meaning while reciting aloud.",
  },
]

const QURAN_VERSES: StageDefinition[] = [
  {
    day: 59,
    stage: "Quran Verses",
    level: "Reciter",
    focus: "Surah Al-Fatihah",
    intro: "Recite beloved lines from Surah Al-Fatihah with tajweed awareness.",
    practiceRule: "Recitation Practice",
    reviewRule: "Verse Review",
    words: [
      {
        arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
        translit: "Bismillāh ar-Raḥmān ar-Raḥīm",
        meaning: "In the name of Allah, the Most Merciful, the Most Compassionate",
      },
      {
        arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
        translit: "Al-ḥamdu lillāhi Rabbil-ʿālamīn",
        meaning: "All praise is for Allah, Lord of the worlds",
      },
      {
        arabic: "الرَّحْمَٰنِ الرَّحِيمِ",
        translit: "Ar-Raḥmān ar-Raḥīm",
        meaning: "The Most Merciful, the Most Compassionate",
      },
      {
        arabic: "مَالِكِ يَوْمِ الدِّينِ",
        translit: "Māliki yawmi d-dīn",
        meaning: "Master of the Day of Judgement",
      },
      {
        arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
        translit: "Iyyāka naʿbudu wa iyyāka nastaʿīn",
        meaning: "You alone we worship and You alone we ask for help",
      },
    ],
    reviewMessage: "Recite the verses in order and focus on elongations and stops.",
  },
  {
    day: 60,
    stage: "Quran Verses",
    level: "Reciter",
    focus: "Surah Al-Ikhlas & Al-Asr",
    intro: "Review short surahs with deep meanings and steady rhythm.",
    practiceRule: "Recitation Practice",
    reviewRule: "Verse Review",
    words: [
      {
        arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ",
        translit: "Qul huwa Allāhu aḥad",
        meaning: "Say, He is Allah, One",
      },
      {
        arabic: "اللَّهُ الصَّمَدُ",
        translit: "Allāhu ṣ-ṣamad",
        meaning: "Allah, the Eternal Refuge",
      },
      {
        arabic: "لَمْ يَلِدْ وَلَمْ يُولَدْ",
        translit: "Lam yalid wa lam yūlad",
        meaning: "He neither begets nor is born",
      },
      {
        arabic: "وَالْعَصْرِ إِنَّ الْإِنسَانَ لَفِي خُسْرٍ",
        translit: "Wal-ʿaṣr inna l-insāna lafī khusr",
        meaning: "By time, surely humanity is in loss",
      },
      {
        arabic: "إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ",
        translit: "Illā alladhīna āmanū wa ʿamilū ṣ-ṣāliḥāt",
        meaning: "Except those who believe and do righteous deeds",
      },
    ],
    reviewMessage: "Recite both surahs smoothly, focusing on clear articulation.",
  },
]

const createLetterLessons = (): { lessons: ChildLesson[]; nextId: number } => {
  const lessons: ChildLesson[] = []
  let id = 1

  for (const definition of LETTER_DEFINITIONS) {
    const ordinal = ORDINALS[definition.day - 1] ?? `${definition.day}th`

    lessons.push({
      id: id++,
      day: definition.day,
      title: `${definition.name} - Introduction`,
      level: "Beginner",
      arabic: definition.character,
      translit: definition.transliteration,
      rule: `${ordinal} Letter`,
      description: definition.description,
    })

    lessons.push({
      id: id++,
      day: definition.day,
      title: `${definition.name} with Fatha`,
      level: "Beginner",
      arabic: definition.fatha.arabic,
      translit: definition.fatha.translit,
      rule: "Fatha",
      description: `${definition.name} with the fatha vowel sound`,
    })

    lessons.push({
      id: id++,
      day: definition.day,
      title: `${definition.name} with Kasrah`,
      level: "Beginner",
      arabic: definition.kasrah.arabic,
      translit: definition.kasrah.translit,
      rule: "Kasrah",
      description: `${definition.name} with the kasrah vowel sound`,
    })

    lessons.push({
      id: id++,
      day: definition.day,
      title: `${definition.name} with Dhamma`,
      level: "Beginner",
      arabic: definition.dhamma.arabic,
      translit: definition.dhamma.translit,
      rule: "Dhamma",
      description: `${definition.name} with the dhamma vowel sound`,
    })

    lessons.push({
      id: id++,
      day: definition.day,
      title: `${definition.name} with Sukoon`,
      level: "Beginner",
      arabic: definition.sukoon.arabic,
      translit: definition.sukoon.translit,
      rule: "Sukoon",
      description: `${definition.name} with a resting sound`,
    })

    lessons.push({
      id: id++,
      day: definition.day,
      title: `${definition.name} Joining`,
      level: "Beginner",
      arabic: definition.joining.arabic,
      translit: definition.joining.translit,
      rule: "Joining",
      description: definition.joining.description,
    })

    lessons.push({
      id: id++,
      day: definition.day,
      title: `${definition.name} Practice Word`,
      level: "Beginner",
      arabic: definition.practice.arabic,
      translit: definition.practice.translit,
      rule: "Practice",
      description: definition.practice.description,
    })
  }

  return { lessons, nextId: id }
}

const createStageLessons = (
  definitions: StageDefinition[],
  startId: number,
): { lessons: ChildLesson[]; nextId: number } => {
  const lessons: ChildLesson[] = []
  let id = startId

  for (const definition of definitions) {
    lessons.push({
      id: id++,
      day: definition.day,
      title: `${definition.stage} Mission`,
      level: definition.level,
      arabic: "⭐",
      translit: definition.focus,
      rule: `${definition.stage} Introduction`,
      description: definition.intro,
    })

    definition.words.forEach((word, index) => {
      lessons.push({
        id: id++,
        day: definition.day,
        title: `${definition.stage} Practice ${index + 1}`,
        level: definition.level,
        arabic: word.arabic,
        translit: word.translit,
        rule: word.rule ?? definition.practiceRule ?? `${definition.stage} Practice`,
        description: `Meaning: ${word.meaning}`,
      })
    })

    lessons.push({
      id: id++,
      day: definition.day,
      title: `${definition.stage} Review`,
      level: definition.level,
      arabic: "🎯",
      translit: "Review",
      rule: definition.reviewRule ?? `${definition.stage} Review`,
      description:
        definition.reviewMessage ??
        `Blend and recite all words for ${definition.focus.toLowerCase()}.`,
    })
  }

  return { lessons, nextId: id }
}

const letterResult = createLetterLessons()
const twoLetterResult = createStageLessons(TWO_LETTER_WORDS, letterResult.nextId)
const threeLetterResult = createStageLessons(THREE_LETTER_WORDS, twoLetterResult.nextId)
const fourLetterResult = createStageLessons(FOUR_LETTER_WORDS, threeLetterResult.nextId)
const fiveLetterResult = createStageLessons(FIVE_LETTER_WORDS, fourLetterResult.nextId)
const sixLetterResult = createStageLessons(SIX_LETTER_WORDS, fiveLetterResult.nextId)
const quranWordsResult = createStageLessons(QURAN_WORDS, sixLetterResult.nextId)
const quranVersesResult = createStageLessons(QURAN_VERSES, quranWordsResult.nextId)

const BASE_LESSONS: ChildLesson[] = [
  ...letterResult.lessons,
  ...twoLetterResult.lessons,
  ...threeLetterResult.lessons,
  ...fourLetterResult.lessons,
  ...fiveLetterResult.lessons,
  ...sixLetterResult.lessons,
  ...quranWordsResult.lessons,
  ...quranVersesResult.lessons,
]

const createPracticeLessons = (lessons: ChildLesson[]): ChildLesson[] => {
  if (lessons.length === 0) {
    return []
  }

  const groupedByDay = new Map<number, ChildLesson[]>()
  let maxId = lessons.reduce((acc, lesson) => Math.max(acc, lesson.id), 0)
  const expandedLessons: ChildLesson[] = []

  for (const lesson of lessons) {
    const dayLessons = groupedByDay.get(lesson.day)
    if (dayLessons) {
      dayLessons.push(lesson)
    } else {
      groupedByDay.set(lesson.day, [lesson])
    }
  }

  for (const day of Array.from(groupedByDay.keys()).sort((a, b) => a - b)) {
    const dayLessons = groupedByDay.get(day)
    if (!dayLessons || dayLessons.length === 0) {
      continue
    }

    const sortedBaseLessons = [...dayLessons].sort((a, b) => a.id - b.id)
    expandedLessons.push(...sortedBaseLessons)

    const enrichments = DAY_ENRICHMENTS[day] ?? []
    for (const enrichment of enrichments) {
      maxId += 1
      expandedLessons.push({
        ...enrichment,
        id: maxId,
      })
    }

    const totalForDay = sortedBaseLessons.length + enrichments.length
    const additionalLessonsNeeded = Math.max(0, 20 - totalForDay)

    for (let i = 0; i < additionalLessonsNeeded; i++) {
      const templateLesson = sortedBaseLessons[i % sortedBaseLessons.length]
      maxId += 1

      expandedLessons.push({
        ...templateLesson,
        id: maxId,
        title: `${templateLesson.title} Practice ${i + 1}`,
        description: `Additional practice for ${templateLesson.title}`,
        rule: templateLesson.rule.includes("Practice")
          ? templateLesson.rule
          : `${templateLesson.rule} Practice`,
      })
    }
  }

  return expandedLessons
}

export const LESSONS: ChildLesson[] = createPracticeLessons(BASE_LESSONS)

export const getLessonsByDay = (day: number): ChildLesson[] => {
  return LESSONS.filter((lesson) => lesson.day === day)
}

export const getTotalDays = (): number => {
  return Math.max(...LESSONS.map((lesson) => lesson.day))
}
