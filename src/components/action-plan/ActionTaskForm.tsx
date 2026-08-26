"use client";

import { useActionState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { createActionTaskAction } from "@/app/actions/action-plan";
import type { ActionResult } from "@/types/auth";

export function ActionTaskForm({ projectId }: { projectId: string }) {
  const [state, action, pending] = useActionState(createActionTaskAction, { ok: false } as ActionResult);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.ok) formRef.current?.reset(); }, [state.ok]);

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <input type="hidden" name="projectId" value={projectId} />
      <label className="block space-y-1.5 text-xs font-bold text-slate-600">
        <span>Tugas berikutnya</span>
        <input name="title" className="input-field" required minLength={3} maxLength={300} placeholder="Contoh: Perkuat bukti pada Problem Builder" />
        {state.fieldErrors?.title?.[0] && <span className="text-red-600">{state.fieldErrors.title[0]}</span>}
      </label>
      <label className="block space-y-1.5 text-xs font-bold text-slate-600">
        <span>Deskripsi</span>
        <textarea name="description" className="input-field" rows={3} maxLength={2000} placeholder="Tuliskan hasil yang harus dicapai..." />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5 text-xs font-bold text-slate-600"><span>Tanggal target</span><input type="date" name="dueDate" className="input-field" /></label>
        <label className="space-y-1.5 text-xs font-bold text-slate-600"><span>Prioritas</span><select name="priority" defaultValue="medium" className="input-field"><option value="low">Rendah</option><option value="medium">Sedang</option><option value="high">Tinggi</option></select></label>
      </div>
      {state.message && <p role="status" className={`rounded-lg p-3 text-xs ${state.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{state.message}</p>}
      <button type="submit" disabled={pending} className="btn-primary"><Plus size={15} /> {pending ? "Menambahkan..." : "Tambah Tugas"}</button>
    </form>
  );
}
