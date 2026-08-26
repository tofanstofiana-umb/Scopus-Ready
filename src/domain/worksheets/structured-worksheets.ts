export type StructuredWorksheetCode = "literature" | "gap" | "novelty" | "blueprint" | "method" | "scientific_story" | "internal_review" | "journal_adaptation" | "submission";

export type StructuredWorksheetContent = Record<string, string | boolean>;

export interface StructuredWorksheetField {
  key: string;
  label: string;
  help: string;
  maxLength: number;
  kind?: "text" | "check";
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
  internal_review: {
    code: "internal_review",
    title: "Internal Review",
    description: "Audit kesiapan manuskrip secara menyeluruh sebelum trainer memberikan persetujuan Reviewer Gate.",
    fields: [
      { key: "scope_alignment", label: "Apakah manuskrip selaras dengan scope jurnal target?", help: "Catat bukti kesesuaian topik, jenis artikel, audiens, dan fokus jurnal.", maxLength: 2000 },
      { key: "argument_coherence", label: "Apakah argumen manuskrip tersusun koheren?", help: "Periksa kesinambungan masalah, gap, tujuan, hasil, pembahasan, dan kesimpulan.", maxLength: 2000 },
      { key: "evidence_quality", label: "Apakah setiap klaim utama didukung bukti yang memadai?", help: "Tinjau kecukupan data, tabel, gambar, analisis, dan referensi pendukung.", maxLength: 2000 },
      { key: "method_reporting", label: "Apakah metode dilaporkan secara lengkap dan dapat direplikasi?", help: "Periksa desain, sampel, instrumen, prosedur, etik, dan analisis.", maxLength: 2000 },
      { key: "submission_readiness", label: "Apa yang masih harus diperbaiki sebelum submit?", help: "Tuliskan temuan audit akhir dan tindakan perbaikan yang masih diperlukan.", maxLength: 1500 },
    ],
  },
  journal_adaptation: {
    code: "journal_adaptation",
    title: "Journal Adaptation",
    description: "Sesuaikan isi dan paket manuskrip dengan ketentuan jurnal utama tanpa mengubah integritas temuan penelitian.",
    fields: [
      { key: "author_guidelines", label: "Apa ketentuan utama author guidelines jurnal?", help: "Ringkas jenis artikel, struktur, panjang naskah, format berkas, dan ketentuan khusus jurnal.", maxLength: 2000 },
      { key: "title_abstract_keywords", label: "Bagaimana judul, abstrak, dan kata kunci harus disesuaikan?", help: "Catat perubahan yang diperlukan agar fokus, istilah, dan panjangnya sesuai dengan jurnal target.", maxLength: 2000 },
      { key: "structure_word_limit", label: "Bagaimana struktur dan batas kata manuskrip akan disesuaikan?", help: "Petakan bagian yang perlu dipadatkan, dipindahkan, ditambah, atau dihapus.", maxLength: 2000 },
      { key: "citations_references", label: "Apa penyesuaian sitasi, referensi, tabel, dan gambar?", help: "Periksa gaya referensi, jumlah sumber, format tabel atau gambar, serta berkas terpisah.", maxLength: 2000 },
      { key: "submission_package", label: "Apa saja paket dokumen yang harus disiapkan?", help: "Daftar manuskrip, title page, cover letter, pernyataan etik, data, dan lampiran yang diwajibkan.", maxLength: 1500 },
    ],
  },
  submission: {
    code: "submission",
    title: "Submission Checklist",
    description: "Konfirmasikan lima kelompok persyaratan final sebelum manuskrip dikirim ke jurnal.",
    fields: [
      { key: "manuscript_file_ready", label: "Berkas manuskrip final sudah siap diunggah", help: "Versi yang benar, bersih, dan anonim bila jurnal menerapkan blind review.", maxLength: 0, kind: "check" },
      { key: "journal_format_confirmed", label: "Format sudah mengikuti author guidelines", help: "Struktur, batas kata, gaya sitasi, tabel, gambar, dan penamaan berkas sudah diperiksa.", maxLength: 0, kind: "check" },
      { key: "metadata_complete", label: "Metadata artikel dan penulis sudah lengkap", help: "Judul, abstrak, kata kunci, afiliasi, ORCID, dan data corresponding author sudah benar.", maxLength: 0, kind: "check" },
      { key: "ethics_and_declarations_complete", label: "Etik dan seluruh deklarasi sudah lengkap", help: "Persetujuan etik, konflik kepentingan, pendanaan, kontribusi penulis, dan data availability tersedia.", maxLength: 0, kind: "check" },
      { key: "supplementary_files_ready", label: "Cover letter dan berkas pendukung sudah siap", help: "Title page, cover letter, checklist pelaporan, tabel, gambar, serta supplementary files sudah tersedia.", maxLength: 0, kind: "check" },
    ],
  },
};

export function isStructuredWorksheetCode(value: string): value is StructuredWorksheetCode {
  return value === "literature"
    || value === "gap"
    || value === "novelty"
    || value === "blueprint"
    || value === "method"
    || value === "scientific_story"
    || value === "internal_review"
    || value === "journal_adaptation"
    || value === "submission";
}

export function createEmptyStructuredContent(code: StructuredWorksheetCode): StructuredWorksheetContent {
  return Object.fromEntries(structuredWorksheets[code].fields.map((field) => [field.key, field.kind === "check" ? false : ""]));
}
