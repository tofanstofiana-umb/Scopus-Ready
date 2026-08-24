"use client";
import { AppShell } from "@/components/AppShell";
import { BookOpen, Video, FileText, Download, CheckSquare, Cpu, Search } from "lucide-react";

const categories = [
  {
    id: "materi", label: "Materi Sesi", icon: BookOpen, color: "#0B4EA2",
    items: [
      { title: "Materi Sesi 1 — Problem Builder", type: "PDF", size: "2.1 MB" },
      { title: "Materi Sesi 2 — Literature Review", type: "PDF", size: "3.4 MB" },
      { title: "Materi Sesi 3 — Research Gap", type: "PDF", size: "1.8 MB" },
      { title: "Materi Sesi 4 — Novelty & Contribution", type: "PDF", size: "2.5 MB" },
    ]
  },
  {
    id: "template", label: "Template", icon: FileText, color: "#10B981",
    items: [
      { title: "Template Workbook Lengkap", type: "DOCX", size: "450 KB" },
      { title: "Template Cover Letter", type: "DOCX", size: "120 KB" },
      { title: "Template Response to Reviewer", type: "DOCX", size: "95 KB" },
    ]
  },
  {
    id: "rubrik", label: "Rubrik Penilaian", icon: CheckSquare, color: "#D9A441",
    items: [
      { title: "Rubrik SCOPUS READY Score™", type: "PDF", size: "340 KB" },
      { title: "Rubrik Internal Review", type: "PDF", size: "210 KB" },
    ]
  },
  {
    id: "video", label: "Video", icon: Video, color: "#8B5CF6",
    items: [
      { title: "Intro SCOPUS READY™ Digital Workbook", type: "Video", size: "12:30" },
      { title: "Tutorial: Problem Builder", type: "Video", size: "8:45" },
    ]
  },
  {
    id: "prompt", label: "AI Prompt", icon: Cpu, color: "#EF4444",
    items: [
      { title: "Prompt: Review Research Gap", type: "TXT", size: "2 KB" },
      { title: "Prompt: Uji Novelty", type: "TXT", size: "1.8 KB" },
      { title: "Prompt: Review Discussion", type: "TXT", size: "3 KB" },
    ]
  },
];

export default function LibraryPage() {
  return (
    <AppShell title="Library" subtitle="Materi, template, dan sumber daya workshop">
      <div className="space-y-6 animate-fade-in">

        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input id="library-search" className="input-field pl-12 text-sm" placeholder="Cari materi, template, atau video..." />
        </div>

        {/* Categories */}
        <div className="space-y-6">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: cat.color + "15" }}>
                  <cat.icon size={18} style={{ color: cat.color }} />
                </div>
                <h2 className="font-bold text-gray-900">{cat.label}</h2>
                <span className="ml-auto text-xs text-gray-400">{cat.items.length} item</span>
              </div>
              <div className="divide-y divide-gray-50">
                {cat.items.map((item) => (
                  <div key={item.title} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: cat.color }}>
                      {item.type.slice(0, 3)}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 text-sm">{item.title}</div>
                      <div className="text-xs text-gray-400">{item.size}</div>
                    </div>
                    <button id={`btn-download-${item.title.toLowerCase().replace(/ /g, "-").slice(0, 20)}`}
                      className="btn-ghost text-xs py-1.5 px-3">
                      <Download size={14} /> Unduh
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
