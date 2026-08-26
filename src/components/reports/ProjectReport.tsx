import { calculateJournalFit, determineJournalFitLabel } from "@/domain/journals/journal-fit";
import type { ProjectReportData } from "@/types/report";

const problemLabels = {
  topic: "Topik penelitian",
  phenomenon: "Fenomena",
  problem: "Masalah penelitian",
  evidence: "Bukti awal",
  importance: "Urgensi penelitian",
} as const;

const dateFormatter = new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeZone: "Asia/Jakarta" });

export function ProjectReport({ report }: { report: ProjectReportData }) {
  return (
    <article className="section-card overflow-hidden print:border-0 print:shadow-none">
      <header className="bg-[#082B5C] p-6 text-white sm:p-8 print:bg-white print:px-0 print:text-[#082B5C]">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#F4BF4F]">SCOPUS READY™ Digital Workbook</p>
        <h2 className="mt-3 text-2xl font-extrabold">Laporan Proyek Manuskrip</h2>
        <p className="mt-1 text-sm text-white/70 print:text-slate-600">{report.project.title}</p>
      </header>
      <div className="space-y-8 p-6 sm:p-8 print:px-0">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div><div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Peserta</div><div className="mt-1 text-sm font-bold text-[#082B5C]">{report.owner.full_name}</div><div className="text-xs text-slate-500">{report.owner.institution || report.owner.email}</div></div>
          <div><div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bidang</div><div className="mt-1 text-sm font-bold text-[#082B5C]">{report.project.field || report.owner.field_of_study || "Belum diisi"}</div></div>
          <div><div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Progres</div><div className="mt-1 text-2xl font-extrabold text-[#0B4EA2]">{report.progress}%</div></div>
          <div><div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SCOPUS READY Score</div><div className="mt-1 text-2xl font-extrabold text-[#0B4EA2]">{report.score ?? "—"}</div><div className="text-[10px] text-slate-400">{report.scoreCompletedDimensions}/{report.scoreTotalDimensions} dimensi dinilai</div></div>
        </section>

        <section>
          <h3 className="border-b border-slate-200 pb-2 font-extrabold text-[#082B5C]">Problem Builder</h3>
          {!report.problemBuilder ? <p className="mt-4 text-sm text-slate-500">Problem Builder belum diisi.</p> : <div className="mt-4 space-y-4">{Object.entries(problemLabels).map(([key, label]) => <div key={key}><div className="text-xs font-bold text-slate-500">{label}</div><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">{report.problemBuilder?.content[key as keyof typeof problemLabels] || "—"}</p></div>)}</div>}
        </section>

        <section>
          <h3 className="border-b border-slate-200 pb-2 font-extrabold text-[#082B5C]">Feedback Trainer</h3>
          {report.feedback.length === 0 ? <p className="mt-4 text-sm text-slate-500">Belum ada feedback trainer.</p> : <div className="mt-4 space-y-3">{report.feedback.map((item) => <div key={item.id} className="rounded-xl border border-slate-200 p-4"><div className="flex gap-2 text-[10px] font-bold uppercase"><span>{item.priority}</span><span>·</span><span>{item.status}</span></div><p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{item.comment}</p></div>)}</div>}
        </section>

        <section>
          <h3 className="border-b border-slate-200 pb-2 font-extrabold text-[#082B5C]">Journal Target Matrix</h3>
          {report.journals.length === 0 ? <p className="mt-4 text-sm text-slate-500">Belum ada target jurnal.</p> : <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="border-b border-slate-200 text-slate-400"><th className="py-2">Jurnal</th><th>Quartile</th><th>Fit</th><th>Status</th></tr></thead><tbody>{report.journals.map((journal) => { const fit = calculateJournalFit({ scopeMatch: journal.scope_match, articleTypeMatch: journal.article_type_match, audienceMatch: journal.audience_match, requirementsMatch: journal.requirements_match }); return <tr key={journal.id} className="border-b border-slate-100"><td className="py-3 font-bold text-[#082B5C]">{journal.journal_name}<div className="font-normal text-slate-400">{journal.publisher}</div></td><td>{journal.quartile.toUpperCase()}</td><td>{fit}% · {determineJournalFitLabel(fit)}</td><td>{journal.status}</td></tr>; })}</tbody></table></div>}
        </section>

        <section>
          <h3 className="border-b border-slate-200 pb-2 font-extrabold text-[#082B5C]">Action Plan</h3>
          {report.actionTasks.length === 0 ? <p className="mt-4 text-sm text-slate-500">Belum ada tugas tindak lanjut.</p> : <ol className="mt-4 space-y-3">{report.actionTasks.map((task, index) => <li key={task.id} className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">{index + 1}</span><div><div className="text-sm font-bold text-[#082B5C]">{task.title}</div><div className="text-xs text-slate-500">{task.status.replaceAll("_", " ")} · target {task.due_date ? dateFormatter.format(new Date(`${task.due_date}T00:00:00+07:00`)) : "belum ditetapkan"}</div></div></li>)}</ol>}
        </section>

        <footer className="border-t border-slate-200 pt-4 text-[10px] leading-5 text-slate-400">
          <div className="font-bold text-[#0B4EA2]">Publish-Lab — Dikembangkan oleh Dr. Tofan Stofiana, M.Pd. © 2026</div>
          <div>Dibuat {dateFormatter.format(new Date(report.generatedAt))}. Data laporan merupakan snapshot dari sumber data proyek pada saat laporan dibuka.</div>
        </footer>
      </div>
    </article>
  );
}
