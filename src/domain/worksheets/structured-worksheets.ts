export type StructuredWorksheetCode = "literature" | "gap";

export type StructuredWorksheetContent = Record<string, string>;

export interface StructuredWorksheetField {
  key: string;
  label: string;
  help: string;
  maxLength: number;
}

export interface StructuredWorksheetDefinition {
  code: StructuredWorksheetCode;
  title: string;
  description: string;
  fields: StructuredWorksheetField[];
}

export const structuredWorksheets: Record<StructuredWorksheetCode, StructuredWorksheetDefinition> = {
  literature: {
    code: "literature",
    title: "Literature Map",
    description: "Petakan temuan, teori, metode, konteks, dan keterbatasan penelitian terdahulu.",
    fields: [
      { key: "key_findings", label: "Apa temuan utama penelitian terdahulu?", help: "Rangkum pola temuan yang paling relevan dengan topik Anda.", maxLength: 2000 },
      { key: "theories", label: "Teori atau konsep apa yang digunakan?", help: "Catat teori, model, atau kerangka konseptual yang dominan.", maxLength: 2000 },
      { key: "methods", label: "Metode apa yang telah digunakan?", help: "Petakan desain, sampel, instrumen, dan teknik analisis yang umum.", maxLength: 2000 },
      { key: "contexts", label: "Dalam konteks apa penelitian dilakukan?", help: "Identifikasi lokasi, populasi, bidang, dan rentang waktu penelitian.", maxLength: 2000 },
      { key: "limitations", label: "Apa keterbatasan studi sebelumnya?", help: "Catat batasan yang dinyatakan penulis maupun yang Anda identifikasi.", maxLength: 2000 },
    ],
  },
  gap: {
    code: "gap",
    title: "Gap Detector",
    description: "Rumuskan celah penelitian secara logis dari peta literatur yang tersedia.",
    fields: [
      { key: "established_knowledge", label: "Apa yang sudah diketahui?", help: "Tuliskan pengetahuan yang telah konsisten didukung literatur.", maxLength: 2000 },
      { key: "inconsistency", label: "Apa yang belum konsisten?", help: "Identifikasi hasil, teori, atau metode yang masih bertentangan.", maxLength: 2000 },
      { key: "underexplored_area", label: "Area apa yang belum cukup diteliti?", help: "Tentukan populasi, konteks, variabel, atau hubungan yang masih kurang dikaji.", maxLength: 2000 },
      { key: "consequence", label: "Apa akibat dari celah tersebut?", help: "Jelaskan konsekuensi ilmiah atau praktis jika celah tetap tidak dijawab.", maxLength: 2000 },
      { key: "research_gap", label: "Apa rumusan research gap Anda?", help: "Susun satu pernyataan celah yang spesifik, terukur, dan didukung peta literatur.", maxLength: 2000 },
    ],
  },
};

export function isStructuredWorksheetCode(value: string): value is StructuredWorksheetCode {
  return value === "literature" || value === "gap";
}

export function createEmptyStructuredContent(code: StructuredWorksheetCode): StructuredWorksheetContent {
  return Object.fromEntries(structuredWorksheets[code].fields.map((field) => [field.key, ""]));
}
