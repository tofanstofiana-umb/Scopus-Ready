"use client";

import { useActionState } from "react";
import { BadgeCheck } from "lucide-react";
import { approveInternalReviewAction } from "@/app/actions/internal-review";
import type { ActionResult } from "@/types/auth";

export function InternalReviewApprovalForm({ projectId }: { projectId: string }) {
  const [state, action, pending] = useActionState(approveInternalReviewAction, { ok: false } as ActionResult);
  return (
    <form action={action} className="section-card space-y-3 border-emerald-200 bg-emerald-50/50 p-5">
      <input type="hidden" name="projectId" value={projectId} />
      <div className="flex items-center gap-3">
        <BadgeCheck className="text-emerald-600" size={22} />
        <div><h2 className="font-extrabold text-[#082B5C]">Persetujuan Reviewer Gate</h2><p className="mt-1 text-xs text-slate-600">Pastikan audit lengkap dan tidak ada feedback terbuka.</p></div>
      </div>
      <button type="submit" className="btn-primary w-full justify-center" disabled={pending}>{pending ? "Memproses..." : "Setujui Internal Review"}</button>
      {state.message && <p aria-live="polite" className={`text-xs ${state.ok ? "text-emerald-700" : "text-red-600"}`}>{state.message}</p>}
    </form>
  );
}
