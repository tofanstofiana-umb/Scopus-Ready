import { CheckCircle2, Circle } from "lucide-react";
import { publicationRoadmapCriteria } from "@/domain/roadmap/publication-roadmap";
import type { RoadmapModuleContent, WorksheetStatus } from "@/types/worksheet";

const emptyContent: RoadmapModuleContent = {
  task_count: 0,
  dated_count: 0,
  high_priority_count: 0,
  completed_count: 0,
};

export function RoadmapCriteria({
  content,
  completionPercent,
  status,
}: {
  content?: RoadmapModuleContent | null;
  completionPercent: number;
  status: WorksheetStatus;
}) {
  const snapshot = content ?? emptyContent;
  return (
    <section className="section-card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#0B4EA2]">Progres Modul 12</p>
          <h2 className="mt-1 text-lg font-extrabold text-[#082B5C]">Publication Roadmap {completionPercent}%</h2>
          <p className="mt-1 text-xs text-slate-500">Dihitung otomatis dari Action Plan—bukan angka yang diketik manual.</p>
        </div>
        <span className={`badge ${status === "completed" ? "bg-emerald-50 text-emerald-700" : status === "needs_revision" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"}`}>
          {status === "completed" ? "Selesai" : status === "needs_revision" ? "Perlu Revisi" : status === "in_progress" ? "Sedang dikerjakan" : "Belum dimulai"}
        </span>
      </div>
      <div className="mt-5 grid gap-2 sm:grid-cols-5">
        {publicationRoadmapCriteria.map((criterion) => {
          const met = criterion.isMet(snapshot);
          return (
            <div key={criterion.key} className={`flex items-center justify-center gap-2 rounded-lg p-3 text-center text-xs font-bold ${met ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
              {met ? <CheckCircle2 size={14} /> : <Circle size={14} />}
              {criterion.label}
            </div>
          );
        })}
      </div>
    </section>
  );
}
