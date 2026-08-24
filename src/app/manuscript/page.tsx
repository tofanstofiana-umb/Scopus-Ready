"use client";
import { AppShell } from "@/components/AppShell";
import { manuscriptProject, workbookAnswers } from "@/lib/mockData";
import { FileText, Download, ChevronRight, Edit3, Copy } from "lucide-react";

const sections = [
  { id: "problem", label: "Masalah Penelitian", content: workbookAnswers.problem.problem, status: "done" },
  { id: "gap", label: "Research Gap", content: workbookAnswers.gap.notKnown, status: "revision" },
  { id: "novelty", label: "Novelty", content: "Penelitian ini mengkaji seluruh dimensi berpikir kritis dalam implementasi PjBL pada konteks perguruan tinggi Indonesia, menggunakan pendekatan mixed-methods yang belum pernah dilakukan sebelumnya di konteks ini.", status: "revision" },
  { id: "rq", label: "Research Question", content: "Bagaimana implementasi Project-Based Learning mempengaruhi kemampuan berpikir kritis mahasiswa pada dimensi analisis, evaluasi, inferensi, dan interpretasi di perguruan tinggi Indonesia?", status: "done" },
  { id: "method", label: "Metode Penelitian", content: "Mixed-methods convergent design dengan n=120 mahasiswa S1. Kuantitatif menggunakan Watson-Glaser Critical Thinking Appraisal; kualitatif menggunakan wawancara mendalam dan observasi kelas.", status: "done" },
  { id: "contribution", label: "Kontribusi", content: "Teoretis: memperbarui model PjBL untuk konteks kolektivistik. Metodologis: instrumen validasi multidimensi berpikir kritis. Praktis: panduan implementasi berbasis evidence.", status: "done" },
  { id: "journal", label: "Jurnal Target", content: "Education and Information Technologies (Springer, Q1, Scopus)", status: "done" },
];

const statusCfg = {
  done: { color: "#10B981", label: "Selesai" },
  revision: { color: "#F59E0B", label: "Perlu Revisi" },
  empty: { color: "#9CA3AF", label: "Belum Diisi" },
};

export default function ManuscriptPage() {
  return (
    <AppShell title="Manuskrip Saya" subtitle={manuscriptProject.title}>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">

        {/* Manuscript header */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(11,78,162,0.1)" }}>
                <FileText size={24} style={{ color: "#0B4EA2" }} />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg leading-snug">{manuscriptProject.title}</h2>
                <div className="text-sm text-gray-400 mt-1">{manuscriptProject.field} · Terakhir diperbarui: {manuscriptProject.lastUpdated}</div>
                <div className="flex gap-2 mt-2">
                  <span className="badge text-xs" style={{ background: "rgba(16,185,129,0.08)", color: "#10B981" }}>
                    {manuscriptProject.overallProgress}% Selesai
                  </span>
                  <span className="badge text-xs" style={{ background: "rgba(245,158,11,0.08)", color: "#F59E0B" }}>
                    Score: {manuscriptProject.scopusReadyScore}/100
                  </span>
                </div>
              </div>
            </div>
            <button id="btn-export-manuscript" className="btn-primary text-sm flex-shrink-0">
              <Download size={16} /> Export PDF
            </button>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {sections.map((section) => {
            const st = statusCfg[section.status as keyof typeof statusCfg];
            return (
              <div key={section.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{section.label}</h3>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ color: st.color, background: st.color + "15" }}>
                    {st.label}
                  </span>
                  <div className="flex gap-2">
                    <button id={`btn-copy-${section.id}`} className="btn-ghost text-xs py-1.5 px-2">
                      <Copy size={14} />
                    </button>
                    <button id={`btn-edit-${section.id}`} className="btn-ghost text-xs py-1.5 px-2">
                      <Edit3 size={14} /> Edit
                    </button>
                  </div>
                </div>
                <div className="px-6 py-4">
                  <p className="text-sm text-gray-700 leading-relaxed">{section.content}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary card */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4">Manuscript Summary</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              ["Masalah", "Metode pembelajaran konvensional di PT"],
              ["Gap", "Mekanisme PjBL di konteks Indonesia"],
              ["Novelty", "Kajian multidimensi berpikir kritis"],
              ["Metode", "Mixed-methods, n=120"],
              ["Jurnal Target", "Education & IT (Q1)"],
              ["Status", manuscriptProject.scoreStatus],
            ].map(([k, v]) => (
              <div key={k} className="p-3 rounded-xl" style={{ background: "#F8FAFC" }}>
                <div className="text-xs font-bold text-gray-400 uppercase mb-1">{k}</div>
                <div className="font-semibold text-gray-700">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
