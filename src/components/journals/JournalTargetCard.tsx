"use client";

import { useActionState } from "react";
import { ExternalLink, Trash2 } from "lucide-react";
import { deleteJournalTargetAction } from "@/app/actions/journal";
import { calculateJournalFit, determineJournalFitLabel } from "@/domain/journals/journal-fit";
import type { ActionResult } from "@/types/auth";
import type { JournalTarget } from "@/types/journal";
import { JournalTargetForm } from "./JournalTargetForm";

const statusLabels = { candidate: "Kandidat", primary: "Target utama", backup: "Cadangan", rejected: "Tidak dipilih" } as const;

export function JournalTargetCard({ target }: { target: JournalTarget }) {
  const [state, action, pending] = useActionState(deleteJournalTargetAction, { ok: false } as ActionResult);
  const score = calculateJournalFit({
    scopeMatch: target.scope_match,
    articleTypeMatch: target.article_type_match,
    audienceMatch: target.audience_match,
    requirementsMatch: target.requirements_match,
  });

  return (
    <article className="section-card p-5">
      <div className="flex flex-wrap items-start gap-4">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border-[6px] border-emerald-100 bg-white text-center">
          <span className="text-lg font-extrabold text-[#082B5C]">{score}<span className="text-[9px]">%</span></span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-extrabold text-[#082B5C]">{target.journal_name}</h3>
            <span className="badge bg-blue-50 text-blue-700">{target.quartile.toUpperCase()}</span>
            <span className={`badge ${target.status === "primary" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{statusLabels[target.status]}</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">{target.publisher || "Penerbit belum diisi"} · {determineJournalFitLabel(score)}</p>
          {target.notes && <p className="mt-3 text-sm leading-6 text-slate-600">{target.notes}</p>}
          {target.website_url && <a href={target.website_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#0B4EA2]">Buka website <ExternalLink size={13} /></a>}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
        <details className="min-w-0 flex-1">
          <summary className="cursor-pointer text-xs font-bold text-[#0B4EA2]">Edit penilaian jurnal</summary>
          <div className="mt-4 rounded-xl bg-slate-50 p-4"><JournalTargetForm projectId={target.project_id} initial={target} /></div>
        </details>
        <form action={action}>
          <input type="hidden" name="id" value={target.id} /><input type="hidden" name="projectId" value={target.project_id} />
          <button type="submit" disabled={pending} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-red-200 px-3 text-xs font-bold text-red-600 hover:bg-red-50"><Trash2 size={14} /> {pending ? "Menghapus..." : "Hapus"}</button>
        </form>
      </div>
      {state.message && <p className={`mt-3 text-xs ${state.ok ? "text-emerald-600" : "text-red-600"}`}>{state.message}</p>}
    </article>
  );
}
