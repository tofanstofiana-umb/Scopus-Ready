"use client";

import { useActionState } from "react";
import { CheckCircle2, Clock3, Play, RotateCcw, Trash2 } from "lucide-react";
import { deleteActionTaskAction, setActionTaskStatusAction } from "@/app/actions/action-plan";
import type { ActionTask, ActionTaskStatus } from "@/types/action-plan";
import type { ActionResult } from "@/types/auth";

const statusLabels = { not_started: "Belum dimulai", in_progress: "Sedang dikerjakan", completed: "Selesai" } as const;
const priorityLabels = { low: "Rendah", medium: "Sedang", high: "Tinggi" } as const;

function nextStatus(task: ActionTask): { status: ActionTaskStatus; label: string; icon: typeof Play } {
  if (task.status === "not_started") return { status: "in_progress", label: "Mulai", icon: Play };
  if (task.status === "in_progress") return { status: "completed", label: "Tandai Selesai", icon: CheckCircle2 };
  return { status: "in_progress", label: "Buka Kembali", icon: RotateCcw };
}

export function ActionTaskCard({ task }: { task: ActionTask }) {
  const [statusState, statusAction, statusPending] = useActionState(setActionTaskStatusAction, { ok: false } as ActionResult);
  const [deleteState, deleteAction, deletePending] = useActionState(deleteActionTaskAction, { ok: false } as ActionResult);
  const next = nextStatus(task);
  const NextIcon = next.icon;
  const dueLabel = task.due_date ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" }).format(new Date(`${task.due_date}T00:00:00+07:00`)) : "Tanpa tanggal target";

  return (
    <article className={`section-card p-5 ${task.status === "completed" ? "bg-emerald-50/40" : ""}`}>
      <div className="flex items-start gap-4">
        <div className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full ${task.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-blue-50 text-blue-700"}`}>
          {task.status === "completed" ? <CheckCircle2 size={18} /> : <Clock3 size={18} />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><h3 className="font-extrabold text-[#082B5C]">{task.title}</h3><span className="badge bg-slate-100 text-slate-600">{statusLabels[task.status]}</span><span className={`badge ${task.priority === "high" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{priorityLabels[task.priority]}</span></div>
          {task.description && <p className="mt-2 text-sm leading-6 text-slate-600">{task.description}</p>}
          <p className="mt-3 text-xs font-semibold text-slate-400">Target: {dueLabel}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
        <form action={statusAction}><input type="hidden" name="taskId" value={task.id} /><input type="hidden" name="projectId" value={task.project_id} /><input type="hidden" name="status" value={next.status} /><button type="submit" disabled={statusPending} className="btn-outline"><NextIcon size={14} /> {statusPending ? "Memproses..." : next.label}</button></form>
        <form action={deleteAction}><input type="hidden" name="taskId" value={task.id} /><input type="hidden" name="projectId" value={task.project_id} /><button type="submit" disabled={deletePending} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-red-200 px-3 text-xs font-bold text-red-600 hover:bg-red-50"><Trash2 size={14} /> {deletePending ? "Menghapus..." : "Hapus"}</button></form>
      </div>
      {(statusState.message || deleteState.message) && <p className={`mt-3 text-xs ${statusState.ok || deleteState.ok ? "text-emerald-600" : "text-red-600"}`}>{statusState.message || deleteState.message}</p>}
    </article>
  );
}
