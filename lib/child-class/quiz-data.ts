import type { QuizQuestion } from "@/types/child-class"

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "What is the transliteration of أَ?",
    type: "multiple-choice",
    options: ["A", "Ba", "Ta", "Tha"],
    correct: "A",
  },
  {
    id: 2,
    question: "Which letter has the Sukoon rule?",
    type: "multiple-choice",
    options: ["أَ", "رْ", "بَ", "تَ"],
    correct: "رْ",
  },
  {
    id: 3,
    question: "What does Fatha sound like?",
    type: "multiple-choice",
    options: ["Ee", "Oo", "Ah", "Uh"],
    correct: "Ah",
  },
  {
    id: 4,
    question: "Match the word to its meaning: مِنْ",
    type: "matching",
    options: ["From", "To", "In", "At"],
    correct: "From",
  },
  {
    id: 5,
    question: "Which is a Qalqalah letter?",
    type: "multiple-choice",
    options: ["ن", "ق", "س", "ل"],
    correct: "ق",
  },
  {
    id: 6,
    question: "What is Tanween?",
    type: "multiple-choice",
    options: ["Double letter", "Double vowel", "Long vowel", "Silent letter"],
    correct: "Double vowel",
  },
  {
    id: 7,
    question: "Match: قُلْ",
    type: "matching",
    options: ["Say", "Hear", "See", "Know"],
    correct: "Say",
  },
  {
    id: 8,
    question: "What is Shaddah?",
    type: "multiple-choice",
    options: ["Long vowel", "Double letter emphasis", "Silent letter", "Vowel mark"],
    correct: "Double letter emphasis",
  },
  {
    id: 9,
    question: 'Which word means "Light"?',
    type: "multiple-choice",
    options: ["نُورْ", "كُنْ", "قُلْ", "لَمْ"],
    correct: "نُورْ",
  },
  {
    id: 10,
    question: "What is Madd?",
    type: "multiple-choice",
    options: ["Short vowel", "Long vowel", "Double letter", "Silent letter"],
    correct: "Long vowel",
  },
]
