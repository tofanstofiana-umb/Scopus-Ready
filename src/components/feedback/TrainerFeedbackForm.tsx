"use client";

import { useActionState } from "react";
import { createFeedbackAction } from "@/app/actions/feedback";
import type { ActionResult } from "@/types/auth";

export function TrainerFeedbackForm({ projectId, worksheetAnswerId }: { projectId: string; worksheetAnswerId: string }) {
  const [state, action, pending] = useActionState(createFeedbackAction, { ok: false } as ActionResult);
  return (
    <form action={action} className="section-card space-y-4 p-6">
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="worksheetAnswerId" value={worksheetAnswerId} />
      <div><label className="mb-2 block text-sm font-bold" htmlFor="feedback-comment">Komentar</label><textarea id="feedback-comment" className="input-field" name="comment" required minLength={10} maxLength={5000} rows={5} placeholder="Berikan feedback yang spesifik dan dapat ditindaklanjuti..." />{state.fieldErrors?.comment?.[0] && <p className="mt-1 text-xs text-red-600">{state.fieldErrors.comment[0]}</p>}</div>
      <div><label className="mb-2 block text-sm font-bold" htmlFor="feedback-priority">Prioritas</label><select id="feedback-priority" name="priority" defaultValue="medium" className="input-field"><option value="low">Rendah</option><option value="medium">Sedang</option><option value="high">Tinggi</option></select></div>
      {state.message && <p aria-live="polite" className={`rounded-lg p-3 text-xs ${state.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{state.message}</p>}
      <button className="btn-primary" disabled={pending} type="submit">{pending ? "Menyimpan..." : "Kirim Feedback"}</button>
    </form>
  );
}
