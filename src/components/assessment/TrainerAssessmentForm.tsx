"use client";

import { useActionState } from "react";
import { Save, ShieldCheck } from "lucide-react";
import { saveProjectAssessmentsAction } from "@/app/actions/assessment";
import { SCOPUS_READY_RUBRIC } from "@/domain/scoring/score";
import type { Assessment } from "@/types/assessment";
import type { ActionResult } from "@/types/auth";

export function TrainerAssessmentForm({
  projectId,
  worksheetAnswerId,
  assessments,
}: {
  projectId: string;
  worksheetAnswerId: string;
  assessments: Assessment[];
}) {
  const [state, action, pending] = useActionState(saveProjectAssessmentsAction, { ok: false } as ActionResult);
  const assessmentByDimension = new Map(assessments.map((item) => [item.dimension, item]));

  return (
    <form action={action} className="section-card overflow-hidden">
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="worksheetAnswerId" value={worksheetAnswerId} />
      <div className="border-b border-slate-100 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck size={20} className="mt-0.5 shrink-0 text-[#0B4EA2]" aria-hidden="true" />
          <div><h2 className="font-extrabold text-[#082B5C]">Rubrik SCOPUS READY</h2><p className="mt-1 text-xs leading-5 text-slate-500">Nilai resmi disimpan melalui RPC tervalidasi. Kosongkan dimensi yang belum siap dinilai.</p></div>
        </div>
      </div>
      <div className="divide-y divide-slate-100">
        {SCOPUS_READY_RUBRIC.map((rubric) => {
          const current = assessmentByDimension.get(rubric.dimension);
          return (
            <fieldset key={rubric.dimension} className="grid gap-3 p-5 sm:grid-cols-[minmax(150px,0.8fr)_110px_minmax(180px,1.2fr)] sm:items-start">
              <div><legend className="text-sm font-extrabold text-[#082B5C]">{rubric.label}</legend><p className="mt-1 text-[10px] text-slate-400">Maksimum {rubric.maxScore} poin</p></div>
              <div><label className="sr-only" htmlFor={`score-${rubric.dimension}`}>Nilai {rubric.label}</label><select id={`score-${rubric.dimension}`} name={`score_${rubric.dimension}`} defaultValue={current?.score ?? ""} className="input-field" aria-label={`Nilai ${rubric.label}`}><option value="">Belum dinilai</option>{Array.from({ length: rubric.maxScore + 1 }, (_, value) => <option key={value} value={value}>{value}/{rubric.maxScore}</option>)}</select></div>
              <div><label className="sr-only" htmlFor={`notes-${rubric.dimension}`}>Catatan {rubric.label}</label><textarea id={`notes-${rubric.dimension}`} name={`notes_${rubric.dimension}`} defaultValue={current?.notes ?? ""} className="input-field min-h-20" maxLength={3000} placeholder={`Catatan ${rubric.label.toLowerCase()} (opsional)`} aria-label={`Catatan ${rubric.label}`} /></div>
            </fieldset>
          );
        })}
      </div>
      <div className="border-t border-slate-100 bg-slate-50/70 p-5">
        {state.message && <p aria-live="polite" className={`mb-4 rounded-lg p-3 text-xs ${state.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{state.message}</p>}
        <button type="submit" disabled={pending} className="btn-primary w-full justify-center"><Save size={15} aria-hidden="true" />{pending ? "Menyimpan penilaian..." : "Simpan Penilaian Resmi"}</button>
      </div>
    </form>
  );
}
