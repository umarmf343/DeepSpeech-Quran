export interface TajweedRuleMetadata {
  key: string
  label: string
  color: string
  description?: string
}

export const TAJWEED_RULE_METADATA: Record<string, TajweedRuleMetadata> = {
  ham_wasl: {
    key: "ham_wasl",
    label: "Hamzat al-Wasl",
    color: "#aaaaaa",
    description: "Connective hamza shown in grey when skipped during fluent recitation.",
  },
  slnt: {
    key: "slnt",
    label: "Silent Letter",
    color: "#9ca3af",
    description: "Letters that are written but not pronounced in tajweed reading.",
  },
  laam_shamsiyah: {
    key: "laam_shamsiyah",
    label: "Lam Shamsiyyah",
    color: "#aaaaaa",
    description: "Assimilation of the lam with the following sun letter.",
  },
  madda_normal: {
    key: "madda_normal",
    label: "Madd 2 Counts",
    color: "#537fff",
    description: "Normal elongation held for two counts.",
  },
  madda_permissible: {
    key: "madda_permissible",
    label: "Permissible Madd",
    color: "#f38e02",
    description: "Elongation that may be read between two and four counts.",
  },
  madda_necessary: {
    key: "madda_necessary",
    label: "Necessary Madd",
    color: "#0b2d6a",
    description: "Mandatory elongation, typically six counts.",
  },
  madda_obligatory: {
    key: "madda_obligatory",
    label: "Obligatory Madd",
    color: "#f2007f",
    description: "Combined elongation for mandatory continuation.",
  },
  madda_obligatory_mottasel: {
    key: "madda_obligatory_mottasel",
    label: "Madd Muttasil",
    color: "#f2007f",
    description: "Obligatory elongation when hamza follows in the same word.",
  },
  madda_obligatory_monfasel: {
    key: "madda_obligatory_monfasel",
    label: "Madd Munfasil",
    color: "#f2007f",
    description: "Obligatory elongation when hamza appears in the next word.",
  },
  qalaqah: {
    key: "qalaqah",
    label: "Qalqalah",
    color: "#009ee6",
    description: "Echoing sound produced when stopping on certain letters.",
  },
  ikhafa_shafawi: {
    key: "ikhafa_shafawi",
    label: "Ikhfa' Shafawi",
    color: "#d500b7",
    description: "Labial concealment when meem saakin meets ba'.",
  },
  ikhafa: {
    key: "ikhafa",
    label: "Ikhfa'",
    color: "#9400a8",
    description: "Concealing the noon saakin or tanween with a nasal sound.",
  },
  iqlab: {
    key: "iqlab",
    label: "Iqlab",
    color: "#26bffd",
    description: "Changing noon saakin/tanween into a meem before ba'.",
  },
  idgham_shafawi: {
    key: "idgham_shafawi",
    label: "Idgham Shafawi",
    color: "#58b800",
    description: "Labial merging when meem saakin meets meem or waw.",
  },
  idgham_ghunnah: {
    key: "idgham_ghunnah",
    label: "Idgham with Ghunnah",
    color: "#169200",
    description: "Merging noon saakin/tanween into letters with nasalisation.",
  },
  idgham_wo_ghunnah: {
    key: "idgham_wo_ghunnah",
    label: "Idgham without Ghunnah",
    color: "#169200",
    description: "Merging noon saakin/tanween without nasalisation.",
  },
  idgham_mutajanisayn: {
    key: "idgham_mutajanisayn",
    label: "Idgham Mutajanisayn",
    color: "#a1a1a1",
    description: "Merging similar letters that share articulation points.",
  },
  idgham_mutaqaribayn: {
    key: "idgham_mutaqaribayn",
    label: "Idgham Mutaqaribayn",
    color: "#a1a1a1",
    description: "Merging closely related articulation points.",
  },
  ghunnah: {
    key: "ghunnah",
    label: "Ghunnah",
    color: "#ff7e1e",
    description: "Nasal resonance held for two counts.",
  },
  tafkheem: {
    key: "tafkheem",
    label: "Tafkheem",
    color: "#006994",
    description: "Thick or emphatic pronunciation for heavy letters.",
  },
  izhar: {
    key: "izhar",
    label: "Izhar",
    color: "#006400",
    description: "Clear articulation of noon saakin/tanween.",
  },
  izhar_shafawi: {
    key: "izhar_shafawi",
    label: "Izhar Shafawi",
    color: "#0000ff",
    description: "Clear pronunciation of meem saakin before letters other than meem/ba'.",
  },
}

export const DEFAULT_TAJWEED_LEGEND: Record<string, string> = Object.fromEntries(
  Object.entries(TAJWEED_RULE_METADATA).map(([key, value]) => [key, value.label]),
)

export const TAJWEED_RULE_ORDER = Object.keys(TAJWEED_RULE_METADATA)
