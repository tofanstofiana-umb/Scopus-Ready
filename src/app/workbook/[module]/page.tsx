"use client";
import { useState, useEffect, use } from "react";
import { AppShell } from "@/components/AppShell";
import Link from "next/link";
import {
  ChevronLeft, ChevronRight, Save, MessageSquare, CheckCircle2,
  Lightbulb, Plus, Trash2, Info, AlertTriangle
} from "lucide-react";
import { workbookAnswers } from "@/lib/mockData";

const modules: Record<string, {
  title: string;
  subtitle: string;
  tip?: string;
  sections: Array<{
    id: string;
    type: "textarea" | "input" | "select" | "checkbox" | "table";
    label: string;
    placeholder?: string;
    options?: string[];
    rows?: number;
    maxLength?: number;
  }>;
}> = {
  problem: {
    title: "Problem Builder",
    subtitle: "Temukan Masalah Penelitian Anda",
    tip: "Jawab setiap pertanyaan dengan jujur dan spesifik. Jawaban ini akan membentuk fondasi seluruh artikel Anda.",
    sections: [
      { id: "topic", type: "textarea", label: "Apa topik penelitian Anda?", placeholder: "Contoh: Pembelajaran berbasis proyek dalam pendidikan tinggi", rows: 3 },
      { id: "phenomenon", type: "textarea", label: "Fenomena apa yang sedang terjadi?", placeholder: "Jelaskan kondisi nyata yang Anda amati...", rows: 4 },
      { id: "problem", type: "textarea", label: "Apa yang menjadi masalah?", placeholder: "Apa yang salah atau tidak optimal dari fenomena tersebut?", rows: 4 },
      { id: "evidence", type: "textarea", label: "Apa bukti bahwa masalah itu benar-benar ada?", placeholder: "Sebutkan data, statistik, atau penelitian yang membuktikan...", rows: 4 },
      { id: "importance", type: "textarea", label: "Mengapa masalah tersebut penting?", placeholder: "Apa dampak jika masalah ini tidak diselesaikan?", rows: 4 },
    ],
  },
  literature: {
    title: "Literature Map",
    subtitle: "Peta Artikel Referensi Anda",
    tip: "Masukkan minimal 10 artikel dalam peta ini. Fokus pada artikel 5 tahun terakhir.",
    sections: [
      { id: "articles", type: "table", label: "Daftar Artikel" },
    ],
  },
  gap: {
    title: "Gap Detector",
    subtitle: "Temukan Research Gap Anda",
    tip: "Research gap yang kuat adalah fondasi novelty yang kuat. Pastikan gap Anda didukung oleh literatur.",
    sections: [
      { id: "known", type: "textarea", label: "Apa yang sudah diketahui?", placeholder: "Ringkas temuan utama penelitian sebelumnya...", rows: 4 },
      { id: "notKnown", type: "textarea", label: "Apa yang belum cukup diketahui?", placeholder: "Apa yang masih menjadi pertanyaan atau kekurangan?", rows: 4 },
      { id: "limitation", type: "textarea", label: "Apa keterbatasan penelitian sebelumnya?", placeholder: "Sebutkan 2-3 keterbatasan utama dari literatur...", rows: 4 },
      { id: "importance", type: "textarea", label: "Mengapa keterbatasan tersebut penting?", placeholder: "Apa dampak dari keterbatasan tersebut?", rows: 3 },
      { id: "contribution", type: "textarea", label: "Apa yang dilakukan penelitian Anda?", placeholder: "Bagaimana penelitian Anda mengatasi gap tersebut?", rows: 4 },
      {
        id: "gapTypes", type: "checkbox", label: "Jenis Research Gap",
        options: ["Empiris", "Teoretis", "Konseptual", "Metodologis", "Kontradiksi", "Kontekstual", "Populasi", "Waktu"]
      },
    ],
  },
  novelty: {
    title: "Novelty Builder",
    subtitle: "Apa yang Baru dari Penelitian Anda?",
    tip: "Novelty bukan hanya 'belum pernah dilakukan di Indonesia'. Novelty adalah kontribusi pengetahuan baru yang nyata.",
    sections: [
      { id: "known", type: "textarea", label: "Sudah diketahui (state of the art)", placeholder: "Apa yang sudah diketahui dari penelitian sebelumnya?", rows: 3 },
      { id: "notKnown", type: "textarea", label: "Belum diketahui", placeholder: "Apa yang masih menjadi pertanyaan terbuka?", rows: 3 },
      { id: "different", type: "textarea", label: "Penelitian saya melakukan hal berbeda yaitu", placeholder: "Apa perbedaan signifikan pendekatan Anda?", rows: 4 },
      { id: "newKnowledge", type: "textarea", label: "Pengetahuan baru yang dihasilkan", placeholder: "Apa yang bisa diketahui pembaca setelah membaca artikel ini?", rows: 4 },
      { id: "noveltyTest", type: "textarea", label: "Novelty Test (maks 500 karakter)", placeholder: "Jika editor bertanya 'Apa yang benar-benar baru dari penelitian ini?', apa jawaban Anda?", rows: 5, maxLength: 500 },
    ],
  },
  blueprint: {
    title: "Article Blueprint",
    subtitle: "Peta Lengkap Artikel Anda",
    tip: "Blueprint ini adalah kompas Anda. Isi dengan jelas agar arah penulisan tetap konsisten.",
    sections: [
      { id: "title", type: "input", label: "Judul sementara", placeholder: "Tulis judul artikel Anda saat ini..." },
      { id: "problem", type: "textarea", label: "Masalah", placeholder: "1-2 kalimat inti masalah penelitian", rows: 2 },
      { id: "gap", type: "textarea", label: "Research Gap", placeholder: "Apa gap yang Anda isi?", rows: 2 },
      { id: "rq", type: "textarea", label: "Research Question", placeholder: "Apa pertanyaan penelitian utama Anda?", rows: 2 },
      { id: "objective", type: "textarea", label: "Tujuan Penelitian", placeholder: "Apa yang ingin dicapai penelitian ini?", rows: 2 },
      { id: "theory", type: "input", label: "Teori/Kerangka Konsep", placeholder: "Teori utama yang digunakan" },
      { id: "method", type: "input", label: "Metode", placeholder: "Desain dan metode penelitian" },
      { id: "novelty", type: "textarea", label: "Novelty (1-2 kalimat)", placeholder: "Apa yang baru?", rows: 2 },
      { id: "contribution", type: "textarea", label: "Kontribusi utama", placeholder: "Kontribusi teoretis, metodologis, atau praktis", rows: 3 },
      { id: "audience", type: "input", label: "Pembaca utama", placeholder: "Siapa target pembaca artikel ini?" },
      { id: "journal", type: "input", label: "Jurnal potensial", placeholder: "Nama jurnal yang dituju" },
    ],
  },
  method: {
    title: "Method Fit",
    subtitle: "Apakah Metode Anda Sesuai?",
    tip: "Pastikan ada konsistensi dari pertanyaan penelitian → desain → data → analisis → klaim. Inkonsistensi akan menjadi alasan penolakan.",
    sections: [
      { id: "rq", type: "textarea", label: "Research Question", placeholder: "Pertanyaan penelitian spesifik Anda", rows: 2 },
      { id: "design", type: "textarea", label: "Research Design", placeholder: "Kualitatif/Kuantitatif/Mixed? Eksperimen/Survey/Studi kasus?", rows: 3 },
      { id: "data", type: "textarea", label: "Data", placeholder: "Dari mana data dikumpulkan? Berapa sampel? Bagaimana prosedurnya?", rows: 4 },
      { id: "analysis", type: "textarea", label: "Teknik Analisis", placeholder: "Analisis apa yang digunakan? Mengapa teknik ini sesuai?", rows: 3 },
      { id: "evidence", type: "textarea", label: "Bukti", placeholder: "Apa bentuk bukti yang dihasilkan dari analisis?", rows: 3 },
      { id: "claim", type: "textarea", label: "Klaim", placeholder: "Apa klaim yang didukung oleh bukti ini?", rows: 3 },
    ],
  },
  story: {
    title: "Scientific Story",
    subtitle: "Bangun Narasi Ilmiah Anda",
    tip: "Tiga bagian ini adalah inti artikel Anda. Isi secara berurutan: Pendahuluan → Hasil → Pembahasan.",
    sections: [
      { id: "context", type: "textarea", label: "Pendahuluan: Konteks", placeholder: "Latar belakang umum topik Anda...", rows: 4 },
      { id: "introProblem", type: "textarea", label: "Pendahuluan: Masalah", placeholder: "Masalah spesifik yang diangkat...", rows: 3 },
      { id: "introGap", type: "textarea", label: "Pendahuluan: Gap & Novelty", placeholder: "Gap dari literatur dan novelty penelitian...", rows: 3 },
      { id: "introObjective", type: "textarea", label: "Pendahuluan: Tujuan & Kontribusi", placeholder: "Tujuan penelitian dan kontribusi yang dijanjikan...", rows: 3 },
      { id: "finding1", type: "textarea", label: "Temuan 1", placeholder: "Deskripsikan temuan pertama dengan data...", rows: 4 },
      { id: "finding2", type: "textarea", label: "Temuan 2", placeholder: "Deskripsikan temuan kedua dengan data...", rows: 4 },
      { id: "finding3", type: "textarea", label: "Temuan 3 (jika ada)", placeholder: "Deskripsikan temuan ketiga dengan data...", rows: 4 },
      { id: "discussion1", type: "textarea", label: "Pembahasan Temuan 1: Makna & Perbandingan", placeholder: "Apa arti temuan? Sama/berbeda dengan penelitian sebelumnya?", rows: 5 },
      { id: "discussion2", type: "textarea", label: "Pembahasan Temuan 1: Penjelasan & Kontribusi", placeholder: "Mengapa hasilnya demikian? Apa kontribusinya?", rows: 4 },
    ],
  },
  journal: {
    title: "Journal Target",
    subtitle: "Temukan Jurnal yang Sesuai",
    tip: "Gunakan strategi tiga jurnal: ambisius, seimbang, dan realistis untuk memaksimalkan peluang publikasi.",
    sections: [
      { id: "journal1Name", type: "input", label: "Jurnal Ambisius: Nama", placeholder: "Nama jurnal target ambisius" },
      { id: "journal1Publisher", type: "input", label: "Publisher", placeholder: "Nama publisher" },
      { id: "journal1Quartile", type: "select", label: "Quartile", options: ["Q1", "Q2", "Q3", "Q4", "Tidak diketahui"] },
      { id: "journal1Scope", type: "textarea", label: "Scope Jurnal", placeholder: "Apa fokus/scope jurnal ini?", rows: 3 },
      { id: "journal1APC", type: "input", label: "Article Processing Charge (APC)", placeholder: "Contoh: $3,290 atau Free" },
      { id: "journal2Name", type: "input", label: "Jurnal Seimbang: Nama", placeholder: "Nama jurnal target seimbang" },
      { id: "journal3Name", type: "input", label: "Jurnal Realistis: Nama", placeholder: "Nama jurnal target realistis" },
    ],
  },
  review: {
    title: "Internal Review",
    subtitle: "Baca Artikel Anda Seperti Reviewer",
    tip: "Review jujur sebelum submit lebih baik dari penolakan reviewer. Gunakan 5 gerbang ini sebagai panduan.",
    sections: [
      { id: "gate1Novelty", type: "textarea", label: "Gerbang 1 — Novelty (apakah cukup baru?)", placeholder: "Nilai dan jelaskan novelty artikel Anda...", rows: 4 },
      { id: "gate2Evidence", type: "textarea", label: "Gerbang 2 — Bukti (apakah data mendukung klaim?)", placeholder: "Evaluasi kekuatan bukti empiris...", rows: 4 },
      { id: "gate3Logic", type: "textarea", label: "Gerbang 3 — Logika (apakah argumentasi konsisten?)", placeholder: "Periksa alur logika dari masalah hingga kesimpulan...", rows: 4 },
      { id: "gate4Fit", type: "textarea", label: "Gerbang 4 — Journal Fit (apakah sesuai scope?)", placeholder: "Seberapa sesuai artikel dengan jurnal target?", rows: 3 },
      { id: "gate5Technical", type: "textarea", label: "Gerbang 5 — Kesiapan Teknis (format, referensi, bahasa)", placeholder: "Periksa aspek teknis: word count, format, referensi...", rows: 3 },
      { id: "strengths", type: "textarea", label: "Kekuatan utama artikel", placeholder: "Apa yang sudah baik?", rows: 3 },
      { id: "weaknesses", type: "textarea", label: "Kelemahan utama artikel", placeholder: "Apa yang perlu diperbaiki?", rows: 3 },
      { id: "reviewStatus", type: "select", label: "Status Review", options: ["Siap Submit", "Revisi Kecil", "Revisi Besar", "Perlu Dibangun Ulang"] },
    ],
  },
  adaptation: {
    title: "Journal Adaptation",
    subtitle: "Sesuaikan Manuskrip dengan Jurnal",
    tip: "Setiap jurnal memiliki aturan berbeda. Ketidaksesuaian format adalah alasan penolakan yang bisa dihindari.",
    sections: [
      { id: "titleCheck", type: "textarea", label: "Judul: Kondisi saat ini vs. aturan jurnal", placeholder: "Judul saat ini: ...\nAturan jurnal: ...\nPerlu revisi: ...", rows: 3 },
      { id: "abstractCheck", type: "textarea", label: "Abstrak: Kondisi saat ini vs. aturan jurnal", placeholder: "Jumlah kata saat ini: ...\nBatas maksimal: ...\nStruktur yang diminta: ...", rows: 3 },
      { id: "keywordsCheck", type: "textarea", label: "Kata Kunci: Sesuai panduan?", placeholder: "Kata kunci Anda: ...\nJumlah yang diminta: ...", rows: 2 },
      { id: "referenceCheck", type: "textarea", label: "Referensi: Format yang digunakan", placeholder: "Format saat ini: ...\nFormat yang diminta: ...", rows: 2 },
      { id: "wordCount", type: "input", label: "Jumlah kata saat ini", placeholder: "Contoh: 7,842 kata" },
      { id: "wordLimit", type: "input", label: "Batas kata jurnal", placeholder: "Contoh: 8,000 kata" },
      { id: "notes", type: "textarea", label: "Catatan adaptasi lainnya", placeholder: "Hal lain yang perlu disesuaikan...", rows: 4 },
    ],
  },
  checklist: {
    title: "Submission Checklist",
    subtitle: "Pastikan Semua Dokumen Sudah Siap",
    tip: "Checklist ini berdasarkan persyaratan umum jurnal internasional. Sesuaikan dengan jurnal target Anda.",
    sections: [
      {
        id: "checklist", type: "checkbox", label: "Dokumen Submission",
        options: [
          "Manuskrip utama (Main Manuscript)",
          "Title Page (terpisah dari manuskrip)",
          "Cover Letter",
          "Ethics Statement / Ethical Clearance",
          "Conflict of Interest Statement",
          "Funding Statement",
          "Data Availability Statement",
          "Author Contribution Statement (CRediT)",
          "AI Disclosure Statement",
          "Supplementary Materials (jika ada)",
          "Figure files resolusi tinggi (jika ada)",
          "Response to reviewer (jika resubmisi)",
        ]
      },
    ],
  },
  roadmap: {
    title: "Publication Roadmap",
    subtitle: "Rencana Kerja Menuju Submission",
    tip: "Komitmen pada jadwal adalah kunci. Tetapkan deadline yang realistis dan patuhi rencana.",
    sections: [
      { id: "submitDate", type: "input", label: "Target Tanggal Submit", placeholder: "Contoh: 30 September 2026" },
      { id: "targetJournal", type: "input", label: "Jurnal Target", placeholder: "Nama jurnal yang dituju" },
      { id: "remainingRevisions", type: "textarea", label: "Sisa Revisi yang Diperlukan", placeholder: "Daftar revisi yang masih perlu dikerjakan...", rows: 4 },
      { id: "priority1", type: "input", label: "Prioritas 1", placeholder: "Tugas terpenting yang harus diselesaikan" },
      { id: "priority2", type: "input", label: "Prioritas 2", placeholder: "Tugas penting berikutnya" },
      { id: "priority3", type: "input", label: "Prioritas 3", placeholder: "Tugas tambahan" },
      { id: "week1Plan", type: "textarea", label: "Rencana Minggu 1", placeholder: "Apa yang akan dikerjakan minggu pertama?", rows: 3 },
      { id: "week2Plan", type: "textarea", label: "Rencana Minggu 2", placeholder: "Apa yang akan dikerjakan minggu kedua?", rows: 3 },
      { id: "week3Plan", type: "textarea", label: "Rencana Minggu 3", placeholder: "Apa yang akan dikerjakan minggu ketiga?", rows: 3 },
      { id: "week4Plan", type: "textarea", label: "Rencana Minggu 4", placeholder: "Finalisasi dan submission", rows: 3 },
    ],
  },
};

const moduleOrder = ["problem", "literature", "gap", "novelty", "blueprint", "method", "story", "journal", "review", "adaptation", "checklist", "roadmap"];

// Literature table component
function LiteratureTable() {
  const [articles, setArticles] = useState([
    { author: "Smith et al.", year: "2022", title: "Project-Based Learning in Higher Education", journal: "Higher Education Research", method: "Quasi-experiment", finding: "PjBL meningkatkan engagement mahasiswa", limitation: "Sampel terbatas" },
  ]);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#F8FAFC" }}>
              {["Penulis", "Tahun", "Judul", "Jurnal", "Metode", "Temuan", "Keterbatasan", ""].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {articles.map((article, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-3"><input className="input-field text-xs" defaultValue={article.author} style={{ minWidth: "120px" }} /></td>
                <td className="px-4 py-3"><input className="input-field text-xs" defaultValue={article.year} style={{ width: "60px" }} /></td>
                <td className="px-4 py-3"><input className="input-field text-xs" defaultValue={article.title} style={{ minWidth: "180px" }} /></td>
                <td className="px-4 py-3"><input className="input-field text-xs" defaultValue={article.journal} style={{ minWidth: "140px" }} /></td>
                <td className="px-4 py-3"><input className="input-field text-xs" defaultValue={article.method} style={{ minWidth: "120px" }} /></td>
                <td className="px-4 py-3"><input className="input-field text-xs" defaultValue={article.finding} style={{ minWidth: "180px" }} /></td>
                <td className="px-4 py-3"><input className="input-field text-xs" defaultValue={article.limitation} style={{ minWidth: "150px" }} /></td>
                <td className="px-4 py-3">
                  <button onClick={() => setArticles(articles.filter((_, j) => j !== i))}
                    className="text-red-400 hover:text-red-600 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        onClick={() => setArticles([...articles, { author: "", year: "", title: "", journal: "", method: "", finding: "", limitation: "" }])}
        className="btn-outline text-sm"
      >
        <Plus size={16} /> Tambah Artikel
      </button>
    </div>
  );
}

export default function ModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module } = use(params);
  const config = modules[module];
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");

  // Pre-fill with mock data
  useEffect(() => {
    if (module === "problem") {
      setAnswers(workbookAnswers.problem as Record<string, string>);
    } else if (module === "gap") {
      const { gapTypes, ...rest } = workbookAnswers.gap;
      setAnswers(rest as Record<string, string>);
      const checked: Record<string, boolean> = {};
      gapTypes.forEach(t => { checked[t] = true; });
      setCheckedItems(checked);
    }
  }, [module]);

  const handleChange = (id: string, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
    setSaveStatus("saving");
    setTimeout(() => setSaveStatus("saved"), 1500);
  };

  const toggleCheck = (item: string) => {
    setCheckedItems(prev => ({ ...prev, [item]: !prev[item] }));
    setSaveStatus("saving");
    setTimeout(() => setSaveStatus("saved"), 1500);
  };

  const currentIndex = moduleOrder.indexOf(module);
  const prevModule = currentIndex > 0 ? moduleOrder[currentIndex - 1] : null;
  const nextModule = currentIndex < moduleOrder.length - 1 ? moduleOrder[currentIndex + 1] : null;

  if (!config) {
    return (
      <AppShell title="Modul tidak ditemukan">
        <div className="text-center py-20">
          <p className="text-gray-500">Modul &quot;{module}&quot; tidak ditemukan.</p>
          <Link href="/workbook" className="btn-primary mt-4 inline-flex">Kembali ke Workbook</Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={config.title}
      subtitle={`Modul ${currentIndex + 1} dari ${moduleOrder.length}`}
      actions={
        <div className="autosave-indicator">
          {saveStatus === "saving" ? (
            <><div className="w-3 h-3 border border-blue-300 border-t-blue-600 rounded-full animate-spin" /> <span className="text-blue-500">Menyimpan...</span></>
          ) : (
            <><CheckCircle2 size={14} /> <span>Tersimpan</span></>
          )}
        </div>
      }
    >
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Module header */}
        <div className="rounded-2xl p-6" style={{ background: "linear-gradient(135deg, #082B5C, #0B4EA2)", color: "white" }}>
          <div className="flex items-center gap-2 mb-1 text-white/50 text-sm">
            <Link href="/workbook" className="hover:text-white/80 transition-colors">Workbook</Link>
            <ChevronRight size={14} />
            <span style={{ color: "#D9A441" }}>{config.title}</span>
          </div>
          <h1 className="text-2xl font-black mb-2">{config.subtitle}</h1>
          {config.tip && (
            <div className="flex gap-2 mt-3 p-3 rounded-xl" style={{ background: "rgba(217,164,65,0.12)", border: "1px solid rgba(217,164,65,0.25)" }}>
              <Lightbulb size={16} style={{ color: "#D9A441", flexShrink: 0, marginTop: "2px" }} />
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>{config.tip}</p>
            </div>
          )}
        </div>

        {/* Form sections */}
        <div className="bg-white rounded-2xl shadow-sm p-6 lg:p-8 space-y-8">
          {config.sections.map((section, i) => (
            <div key={section.id} className="space-y-3">
              <label className="block">
                <span className="flex items-center gap-2 font-bold text-gray-800 mb-1">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                    style={{ background: "#0B4EA2" }}>
                    {i + 1}
                  </span>
                  {section.label}
                  {section.maxLength && (
                    <span className="ml-auto text-xs text-gray-400 font-normal">
                      {String(answers[section.id] || "").length}/{section.maxLength}
                    </span>
                  )}
                </span>

                {section.type === "table" && <LiteratureTable />}

                {section.type === "textarea" && (
                  <textarea
                    id={`field-${section.id}`}
                    className="input-field mt-2"
                    rows={section.rows || 4}
                    placeholder={section.placeholder}
                    maxLength={section.maxLength}
                    value={String(answers[section.id] || "")}
                    onChange={(e) => handleChange(section.id, e.target.value)}
                  />
                )}

                {section.type === "input" && (
                  <input
                    id={`field-${section.id}`}
                    type="text"
                    className="input-field mt-2"
                    placeholder={section.placeholder}
                    value={String(answers[section.id] || "")}
                    onChange={(e) => handleChange(section.id, e.target.value)}
                  />
                )}

                {section.type === "select" && (
                  <select
                    id={`field-${section.id}`}
                    className="input-field mt-2"
                    value={String(answers[section.id] || "")}
                    onChange={(e) => handleChange(section.id, e.target.value)}
                  >
                    <option value="">Pilih...</option>
                    {section.options?.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}

                {section.type === "checkbox" && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {section.options?.map(opt => (
                      <label key={opt} className="flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all"
                        style={{
                          borderColor: checkedItems[opt] ? "#0B4EA2" : "#E5E7EB",
                          background: checkedItems[opt] ? "rgba(11,78,162,0.05)" : "white"
                        }}>
                        <input
                          type="checkbox"
                          checked={!!checkedItems[opt]}
                          onChange={() => toggleCheck(opt)}
                          className="w-4 h-4 rounded"
                          style={{ accentColor: "#0B4EA2" }}
                        />
                        <span className="text-sm font-medium text-gray-700">{opt}</span>
                        {checkedItems[opt] && <CheckCircle2 size={14} style={{ color: "#0B4EA2", marginLeft: "auto" }} />}
                      </label>
                    ))}
                  </div>
                )}
              </label>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button id="btn-save-module" className="btn-primary flex-1 justify-center">
            <Save size={16} /> Simpan Jawaban
          </button>
          <button id="btn-request-feedback" className="btn-outline flex-1 justify-center">
            <MessageSquare size={16} /> Minta Feedback Trainer
          </button>
          <button id="btn-mark-done" className="btn-ghost" style={{ color: "#10B981", border: "1.5px solid #10B981" }}>
            <CheckCircle2 size={16} /> Tandai Selesai
          </button>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          {prevModule ? (
            <Link href={`/workbook/${prevModule}`}>
              <button className="btn-ghost">
                <ChevronLeft size={16} /> Modul Sebelumnya
              </button>
            </Link>
          ) : <div />}
          {nextModule ? (
            <Link href={`/workbook/${nextModule}`}>
              <button className="btn-primary">
                Modul Berikutnya <ChevronRight size={16} />
              </button>
            </Link>
          ) : (
            <Link href="/score">
              <button className="btn-gold">
                Lihat SCOPUS READY Score™ <ChevronRight size={16} />
              </button>
            </Link>
          )}
        </div>
      </div>
    </AppShell>
  );
}
