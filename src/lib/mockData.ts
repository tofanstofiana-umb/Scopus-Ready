// Mock data for SCOPUS READY™ Digital Workbook

export const currentUser = {
  id: "u1",
  name: "Tofan Stofiana",
  email: "tofan@university.ac.id",
  role: "peserta" as "peserta" | "trainer" | "admin",
  institution: "Universitas Indonesia",
  field: "Pendidikan",
  degree: "S3",
  manuscriptLanguage: "Inggris",
  avatar: null,
};

export const manuscriptProject = {
  id: "p1",
  userId: "u1",
  title: "Pengaruh Pembelajaran Berbasis Proyek terhadap Kemampuan Berpikir Kritis Mahasiswa",
  field: "Pendidikan",
  status: "in-progress",
  targetJournal: "Education and Information Technologies",
  overallProgress: 72,
  scopusReadyScore: 78,
  scoreStatus: "Perlu Revisi Besar",
  lastUpdated: "2026-08-24",
};

export const moduleProgress = [
  { id: "problem", name: "Problem Builder", letter: "S", score: 8, maxScore: 12, status: "done", color: "#10B981" },
  { id: "literature", name: "Literature Map", letter: "C", score: 9, maxScore: 12, status: "done", color: "#10B981" },
  { id: "gap", name: "Gap Detector", letter: "O", score: 7, maxScore: 12, status: "revision", color: "#F59E0B" },
  { id: "novelty", name: "Novelty Builder", letter: "P", score: 6, maxScore: 12, status: "revision", color: "#F59E0B" },
  { id: "blueprint", name: "Article Blueprint", letter: "U", score: 10, maxScore: 12, status: "done", color: "#10B981" },
  { id: "method", name: "Method Fit", letter: "S", score: 9, maxScore: 12, status: "done", color: "#10B981" },
  { id: "story", name: "Scientific Story", letter: "R", score: 7, maxScore: 12, status: "revision", color: "#F59E0B" },
  { id: "journal", name: "Journal Target", letter: "E", score: 5, maxScore: 8, status: "warning", color: "#EF4444" },
  { id: "review", name: "Internal Review", letter: "A", score: 0, maxScore: 8, status: "empty", color: "#9CA3AF" },
  { id: "adaptation", name: "Journal Adaptation", letter: "D", score: 0, maxScore: 6, status: "empty", color: "#9CA3AF" },
  { id: "checklist", name: "Submission Checklist", letter: "Y", score: 0, maxScore: 6, status: "empty", color: "#9CA3AF" },
  { id: "roadmap", name: "Publication Roadmap", letter: "", score: 0, maxScore: 6, status: "empty", color: "#9CA3AF" },
];

export const scopusScoreComponents = [
  { subject: "Masalah", score: 8, fullMark: 8, weight: 8 },
  { subject: "Research Gap", score: 9, fullMark: 12, weight: 12 },
  { subject: "Novelty", score: 7, fullMark: 12, weight: 12 },
  { subject: "Kontribusi", score: 8, fullMark: 10, weight: 10 },
  { subject: "Teori & Literatur", score: 8, fullMark: 10, weight: 10 },
  { subject: "Metode", score: 10, fullMark: 12, weight: 12 },
  { subject: "Hasil & Bukti", score: 8, fullMark: 10, weight: 10 },
  { subject: "Pembahasan", score: 7, fullMark: 12, weight: 12 },
  { subject: "Journal Fit", score: 5, fullMark: 8, weight: 8 },
  { subject: "Bahasa & Teknis", score: 4, fullMark: 6, weight: 6 },
];

export const criticalGates = [
  { name: "Problem", status: "pass" as "pass" | "fail" | "warning" },
  { name: "Gap", status: "warning" as "pass" | "fail" | "warning" },
  { name: "Novelty", status: "warning" as "pass" | "fail" | "warning" },
  { name: "Method", status: "pass" as "pass" | "fail" | "warning" },
  { name: "Journal Fit", status: "fail" as "pass" | "fail" | "warning" },
  { name: "Reviewer Readiness", status: "fail" as "pass" | "fail" | "warning" },
];

export const priorityItems = [
  { rank: 1, area: "Perkuat Novelty", description: "Perjelas pengetahuan baru yang dihasilkan penelitian", score: 6, maxScore: 12, color: "#EF4444" },
  { rank: 2, area: "Perbaiki Discussion", description: "Perkuat analisis perbandingan dengan literatur", score: 7, maxScore: 12, color: "#F59E0B" },
  { rank: 3, area: "Lengkapi Journal Fit", description: "Sesuaikan scope artikel dengan jurnal target", score: 5, maxScore: 8, color: "#F59E0B" },
];

export const trainerFeedbacks = [
  {
    id: "f1",
    module: "Research Gap",
    comment: "Gap sudah cukup jelas, tetapi alasan mengapa keterbatasan tersebut penting belum terlihat. Tambahkan bukti empiris dari literatur terkini.",
    status: "revision" as "good" | "revision" | "critical",
    trainerName: "Dr. Siti Rahayu",
    createdAt: "2026-08-22",
  },
  {
    id: "f2",
    module: "Novelty",
    comment: "Novelty sudah menjelaskan pendekatan yang berbeda. Belum jelas pengetahuan baru apa yang dihasilkan. Perjelas dalam 2-3 kalimat.",
    status: "revision" as "good" | "revision" | "critical",
    trainerName: "Dr. Siti Rahayu",
    createdAt: "2026-08-23",
  },
  {
    id: "f3",
    module: "Method Fit",
    comment: "Desain penelitian sudah sesuai dengan research question. Lanjutkan.",
    status: "good" as "good" | "revision" | "critical",
    trainerName: "Dr. Siti Rahayu",
    createdAt: "2026-08-23",
  },
];

export const journalTargets = [
  {
    id: "j1",
    name: "Education and Information Technologies",
    publisher: "Springer",
    quartile: "Q1",
    scopus: true,
    apc: "$3,290",
    openAccess: "Hybrid",
    wordLimit: "8,000",
    fitScore: 88,
    fitStatus: "Sangat Sesuai",
    strategy: "ambisius",
  },
  {
    id: "j2",
    name: "Journal of Educational Technology & Society",
    publisher: "International Forum of Educational Technology",
    quartile: "Q2",
    scopus: true,
    apc: "Free",
    openAccess: "OA",
    wordLimit: "7,000",
    fitScore: 77,
    fitStatus: "Sesuai",
    strategy: "seimbang",
  },
  {
    id: "j3",
    name: "Interactive Learning Environments",
    publisher: "Taylor & Francis",
    quartile: "Q2",
    scopus: true,
    apc: "$2,950",
    openAccess: "Hybrid",
    wordLimit: "9,000",
    fitScore: 64,
    fitStatus: "Pertimbangkan Kembali",
    strategy: "realistis",
  },
];

export const actionPlanTasks = [
  { id: "t1", week: 1, task: "Perjelas novelty dalam 3 kalimat", status: "done" as "done" | "inprogress" | "todo", deadline: "2026-08-28" },
  { id: "t2", week: 1, task: "Tambah bukti empiris untuk research gap", status: "inprogress" as "done" | "inprogress" | "todo", deadline: "2026-08-28" },
  { id: "t3", week: 1, task: "Review kembali literature map", status: "todo" as "done" | "inprogress" | "todo", deadline: "2026-08-30" },
  { id: "t4", week: 2, task: "Perkuat bagian Discussion dengan 3 perbandingan literatur", status: "todo" as "done" | "inprogress" | "todo", deadline: "2026-09-04" },
  { id: "t5", week: 2, task: "Selesaikan Results Builder", status: "todo" as "done" | "inprogress" | "todo", deadline: "2026-09-05" },
  { id: "t6", week: 3, task: "Sesuaikan format dengan Author Guidelines jurnal target", status: "todo" as "done" | "inprogress" | "todo", deadline: "2026-09-11" },
  { id: "t7", week: 3, task: "Lengkapi Journal Fit Score", status: "todo" as "done" | "inprogress" | "todo", deadline: "2026-09-12" },
  { id: "t8", week: 4, task: "Internal Review lengkap", status: "todo" as "done" | "inprogress" | "todo", deadline: "2026-09-18" },
  { id: "t9", week: 4, task: "Final SCOPUS READY Score check", status: "todo" as "done" | "inprogress" | "todo", deadline: "2026-09-20" },
];

export const trainerClass = {
  id: "c1",
  name: "Workshop Angkatan 01",
  code: "SR-2026-01",
  trainerName: "Dr. Siti Rahayu, M.Pd.",
  startDate: "2026-08-01",
  endDate: "2026-09-30",
  status: "Aktif",
  totalParticipants: 30,
  avgProgress: 67,
  avgScore: 74,
};

export const trainerParticipants = [
  { id: "u1", name: "Tofan Stofiana", institution: "Universitas Indonesia", progress: 72, score: 78, status: "Revisi Besar" },
  { id: "u2", name: "Rina Pratiwi", institution: "UGM", progress: 90, score: 87, status: "Revisi Kecil" },
  { id: "u3", name: "Budi Santoso", institution: "ITB", progress: 62, score: 72, status: "Revisi Besar" },
  { id: "u4", name: "Dewi Kurniasih", institution: "Unpad", progress: 100, score: 92, status: "Siap Submit" },
  { id: "u5", name: "Andi Wijaya", institution: "UI", progress: 45, score: 58, status: "Perlu Dibangun Ulang" },
  { id: "u6", name: "Sari Indah", institution: "UNJ", progress: 78, score: 81, status: "Revisi Kecil" },
  { id: "u7", name: "Hendra Kusuma", institution: "UNY", progress: 55, score: 66, status: "Perlu Perbaikan Substansial" },
  { id: "u8", name: "Maya Susanti", institution: "UNDIP", progress: 88, score: 85, status: "Revisi Kecil" },
];

export const workbookAnswers = {
  problem: {
    topic: "Pembelajaran berbasis proyek (Project-Based Learning) dalam pendidikan tinggi",
    phenomenon: "Banyak mahasiswa menyelesaikan studi tanpa kemampuan berpikir kritis yang memadai untuk menghadapi tantangan dunia kerja abad 21",
    problem: "Metode pembelajaran konvensional di perguruan tinggi masih didominasi ceramah satu arah yang tidak melatih kemampuan analisis dan pemecahan masalah kompleks",
    evidence: "Data PISA dan laporan World Economic Forum 2023 menunjukkan gap besar antara kompetensi lulusan dan kebutuhan industri, dengan 67% employer melaporkan kurangnya kemampuan berpikir kritis lulusan",
    importance: "Kemampuan berpikir kritis merupakan kompetensi abad 21 yang fundamental dan menjadi prasyarat keberhasilan profesional di era transformasi digital",
  },
  gap: {
    known: "PjBL terbukti meningkatkan keterlibatan mahasiswa dan motivasi belajar dalam berbagai konteks pendidikan",
    notKnown: "Mekanisme spesifik bagaimana PjBL mempengaruhi dimensi berpikir kritis pada konteks perguruan tinggi Indonesia masih sangat terbatas",
    limitation: "Penelitian sebelumnya sebagian besar dilakukan di konteks Barat dengan asumsi budaya yang berbeda, dan hanya mengukur satu dimensi berpikir kritis",
    importance: "Tanpa memahami mekanisme ini, intervensi pembelajaran tidak dapat dirancang secara tepat sasaran",
    contribution: "Penelitian ini mengkaji seluruh dimensi berpikir kritis (analisis, evaluasi, inferensi, interpretasi) dalam implementasi PjBL pada mahasiswa Indonesia",
    gapTypes: ["Empiris", "Kontekstual", "Metodologis"],
  },
};
