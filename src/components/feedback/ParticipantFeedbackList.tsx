import { MessageSquareText } from "lucide-react";
import { FeedbackStatusForm } from "@/components/feedback/FeedbackStatusForm";
import type { TrainerFeedback } from "@/types/feedback";

const priorityLabels = { low: "Rendah", medium: "Sedang", high: "Tinggi" };
const statusLabels = { open: "Perlu Revisi", addressed: "Menunggu Trainer", resolved: "Selesai" };

export function ParticipantFeedbackList({
  feedback,
  projectId,
}: {
  feedback: TrainerFeedback[];
  projectId: string;
}) {
  if (feedback.length === 0) return null;

  return (
    <section className="section-card p-5 sm:p-6" aria-labelledby="trainer-feedback-heading">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-[#0B4EA2]">
          <MessageSquareText size={19} aria-hidden="true" />
        </div>
        <div>
          <h2 id="trainer-feedback-heading" className="font-extrabold text-[#082B5C]">Feedback Trainer</h2>
          <p className="mt-1 text-xs text-slate-500">Tindak lanjuti komentar yang masih berstatus perlu revisi.</p>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {feedback.map((item) => (
          <article key={item.id} className="rounded-xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-wider">
              <span className="text-slate-400">Prioritas {priorityLabels[item.priority]}</span>
              <span className={item.status === "open" ? "text-amber-700" : item.status === "resolved" ? "text-emerald-700" : "text-blue-700"}>{statusLabels[item.status]}</span>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{item.comment}</p>
            {item.status === "open" && <FeedbackStatusForm feedbackId={item.id} projectId={projectId} mode="address" />}
          </article>
        ))}
      </div>
    </section>
  );
}
