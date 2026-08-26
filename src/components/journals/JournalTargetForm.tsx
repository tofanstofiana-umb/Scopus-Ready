"use client";

import { useActionState, useEffect, useRef } from "react";
import { Save } from "lucide-react";
import { saveJournalTargetAction } from "@/app/actions/journal";
import type { ActionResult } from "@/types/auth";
import type { JournalTarget } from "@/types/journal";

const ratingOptions = [
  { value: 0, label: "0 — Belum dinilai" },
  { value: 1, label: "1 — Sangat rendah" },
  { value: 2, label: "2 — Rendah" },
  { value: 3, label: "3 — Cukup" },
  { value: 4, label: "4 — Baik" },
  { value: 5, label: "5 — Sangat baik" },
];

function RatingField({ name, label, initialValue = 0 }: { name: string; label: string; initialValue?: number }) {
  return (
    <label className="space-y-1.5 text-xs font-bold text-slate-600">
      <span>{label}</span>
      <select name={name} defaultValue={initialValue} className="input-field" required>
        {ratingOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

export function JournalTargetForm({ projectId, initial }: { projectId: string; initial?: JournalTarget }) {
  const [state, action, pending] = useActionState(saveJournalTargetAction, { ok: false } as ActionResult);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok && !initial) formRef.current?.reset();
  }, [initial, state.ok]);

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <input type="hidden" name="projectId" value={projectId} />
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5 text-xs font-bold text-slate-600">
          <span>Nama jurnal</span>
          <input name="journalName" defaultValue={initial?.journal_name} className="input-field" required minLength={2} maxLength={300} placeholder="Contoh: Computers & Education" />
          {state.fieldErrors?.journalName?.[0] && <span className="text-red-600">{state.fieldErrors.journalName[0]}</span>}
        </label>
        <label className="space-y-1.5 text-xs font-bold text-slate-600">
          <span>Penerbit</span>
          <input name="publisher" defaultValue={initial?.publisher ?? ""} className="input-field" maxLength={300} placeholder="Nama penerbit" />
        </label>
        <label className="space-y-1.5 text-xs font-bold text-slate-600 sm:col-span-2">
          <span>Alamat website</span>
          <input name="websiteUrl" type="url" defaultValue={initial?.website_url ?? ""} className="input-field" maxLength={2048} placeholder="https://..." />
          {state.fieldErrors?.websiteUrl?.[0] && <span className="text-red-600">{state.fieldErrors.websiteUrl[0]}</span>}
        </label>
        <label className="space-y-1.5 text-xs font-bold text-slate-600">
          <span>Quartile</span>
          <select name="quartile" defaultValue={initial?.quartile ?? "unknown"} className="input-field">
            <option value="unknown">Belum diverifikasi</option><option value="q1">Q1</option><option value="q2">Q2</option><option value="q3">Q3</option><option value="q4">Q4</option><option value="unranked">Tidak berperingkat</option>
          </select>
        </label>
        <label className="space-y-1.5 text-xs font-bold text-slate-600">
          <span>Status target</span>
          <select name="status" defaultValue={initial?.status ?? "candidate"} className="input-field">
            <option value="candidate">Kandidat</option><option value="primary">Target utama</option><option value="backup">Cadangan</option><option value="rejected">Tidak dipilih</option>
          </select>
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <RatingField name="scopeMatch" label="Kesesuaian scope" initialValue={initial?.scope_match} />
        <RatingField name="articleTypeMatch" label="Kesesuaian jenis artikel" initialValue={initial?.article_type_match} />
        <RatingField name="audienceMatch" label="Kesesuaian audiens" initialValue={initial?.audience_match} />
        <RatingField name="requirementsMatch" label="Kesesuaian persyaratan" initialValue={initial?.requirements_match} />
      </div>
      <label className="block space-y-1.5 text-xs font-bold text-slate-600">
        <span>Catatan</span>
        <textarea name="notes" defaultValue={initial?.notes ?? ""} className="input-field" rows={3} maxLength={5000} placeholder="Catatan scope, batas kata, APC, atau pertimbangan lain..." />
      </label>
      {state.message && <p role="status" className={`rounded-lg p-3 text-xs ${state.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{state.message}</p>}
      <button type="submit" disabled={pending} className="btn-primary">
        <Save size={15} aria-hidden="true" /> {pending ? "Menyimpan..." : initial ? "Simpan Perubahan" : "Tambah Jurnal"}
      </button>
    </form>
  );
}
