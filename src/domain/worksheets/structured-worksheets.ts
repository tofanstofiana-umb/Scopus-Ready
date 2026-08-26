export type StructuredWorksheetCode = "literature" | "gap" | "novelty" | "blueprint" | "method" | "scientific_story";

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
  novelty: {
    code: "novelty",
    title: "Novelty Builder",
    description: "Ubah research gap menjadi pernyataan kebaruan dan kontribusi ilmiah yang dapat dipertanggungjawabkan.",
    fields: [
      { key: "gap_basis", label: "Research gap apa yang menjadi dasar penelitian Anda?", help: "Nyatakan celah spesifik yang telah didukung oleh peta literatur.", maxLength: 2000 },
      { key: "difference", label: "Apa yang membedakan penelitian Anda?", help: "Jelaskan perbedaan konteks, variabel, teori, metode, atau sudut pandang.", maxLength: 2000 },
      { key: "new_contribution", label: "Kontribusi baru apa yang akan dihasilkan?", help: "Uraikan pengetahuan, model, bukti, atau implikasi baru yang ditawarkan.", maxLength: 2000 },
      { key: "originality_evidence", label: "Apa bukti bahwa kontribusi tersebut benar-benar baru?", help: "Hubungkan klaim kebaruan dengan hasil penelusuran literatur yang dapat diverifikasi.", maxLength: 2000 },
      { key: "novelty_statement", label: "Apa pernyataan novelty penelitian Anda?", help: "Rumuskan satu pernyataan kebaruan yang ringkas, spesifik, dan tidak berlebihan.", maxLength: 1500 },
    ],
  },
  blueprint: {
    code: "blueprint",
    title: "Article Blueprint",
    description: "Susun kerangka argumentasi manuskrip sebelum masuk ke penulisan bagian per bagian.",
    fields: [
      { key: "working_title", label: "Apa judul kerja manuskrip Anda?", help: "Gunakan judul sementara yang mencerminkan fokus, konteks, dan kontribusi utama.", maxLength: 500 },
      { key: "research_objective", label: "Apa tujuan utama artikel?", help: "Nyatakan tujuan penelitian atau pertanyaan yang akan dijawab manuskrip.", maxLength: 1500 },
      { key: "article_structure", label: "Bagaimana struktur logis artikelnya?", help: "Petakan alur pendahuluan, metode, hasil, pembahasan, dan kesimpulan.", maxLength: 2000 },
      { key: "key_argument", label: "Apa argumen utama yang ingin dibangun?", help: "Tuliskan klaim sentral dan hubungan logis antarbagiannya.", maxLength: 2000 },
      { key: "evidence_plan", label: "Bukti apa yang mendukung setiap argumen?", help: "Pasangkan klaim utama dengan data, analisis, literatur, tabel, atau gambar yang relevan.", maxLength: 2000 },
    ],
  },
  method: {
    code: "method",
    title: "Method Fit",
    description: "Pastikan desain, data, instrumen, dan analisis benar-benar sesuai dengan tujuan penelitian.",
    fields: [
      { key: "research_design", label: "Desain penelitian apa yang paling sesuai?", help: "Jelaskan pendekatan dan desain yang dipilih serta hubungannya dengan tujuan penelitian.", maxLength: 1500 },
      { key: "population_sample", label: "Siapa populasi dan bagaimana sampel ditentukan?", help: "Uraikan unit analisis, kriteria, teknik sampling, dan ukuran sampel.", maxLength: 2000 },
      { key: "variables_data", label: "Variabel atau data apa yang diperlukan?", help: "Definisikan variabel, konstruk, indikator, atau jenis data yang akan dianalisis.", maxLength: 2000 },
      { key: "instruments_procedure", label: "Bagaimana instrumen dan prosedur pengumpulan datanya?", help: "Jelaskan sumber data, instrumen, validitas, reliabilitas, dan tahapan pengumpulan.", maxLength: 2000 },
      { key: "analysis_plan", label: "Bagaimana rencana analisis datanya?", help: "Pasangkan setiap tujuan atau pertanyaan penelitian dengan teknik analisis yang tepat.", maxLength: 2000 },
    ],
  },
  scientific_story: {
    code: "scientific_story",
    title: "Scientific Story",
    description: "Bangun alur ilmiah yang menghubungkan masalah, bukti, interpretasi, dan pesan utama manuskrip.",
    fields: [
      { key: "central_message", label: "Apa pesan ilmiah utama manuskrip Anda?", help: "Tuliskan satu pesan sentral yang ingin dipahami dan diingat pembaca.", maxLength: 1500 },
      { key: "story_flow", label: "Bagaimana alur cerita dari masalah menuju jawaban?", help: "Susun urutan logis konteks, gap, tujuan, metode, hasil, dan implikasi.", maxLength: 2000 },
      { key: "key_results", label: "Hasil kunci apa yang menopang cerita ilmiah?", help: "Pilih hasil paling relevan dan hindari memasukkan temuan yang tidak mendukung fokus utama.", maxLength: 2000 },
      { key: "interpretation", label: "Bagaimana hasil tersebut harus diinterpretasikan?", help: "Hubungkan temuan dengan teori, penelitian terdahulu, konteks, dan batasannya.", maxLength: 2000 },
      { key: "take_home_message", label: "Apa take-home message untuk pembaca?", help: "Rumuskan kesimpulan singkat tentang kontribusi dan makna penelitian Anda.", maxLength: 1000 },
    ],
  },
};

export function isStructuredWorksheetCode(value: string): value is StructuredWorksheetCode {
  return value === "literature"
    || value === "gap"
    || value === "novelty"
    || value === "blueprint"
    || value === "method"
    || value === "scientific_story";
}

export function createEmptyStructuredContent(code: StructuredWorksheetCode): StructuredWorksheetContent {
  return Object.fromEntries(structuredWorksheets[code].fields.map((field) => [field.key, ""]));
}
