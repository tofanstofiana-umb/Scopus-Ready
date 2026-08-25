"use client";

import { useActionState } from "react";
import {
  markFeedbackAddressedAction,
  resolveFeedbackAction,
} from "@/app/actions/feedback";
import type { ActionResult } from "@/types/auth";

export function FeedbackStatusForm({
  feedbackId,
  projectId,
  mode,
}: {
  feedbackId: string;
  projectId: string;
  mode: "address" | "resolve";
}) {
  const action = mode === "address" ? markFeedbackAddressedAction : resolveFeedbackAction;
  const [state, formAction, pending] = useActionState(action, { ok: false } as ActionResult);

  return (
    <form action={formAction} className="mt-3">
      <input type="hidden" name="feedbackId" value={feedbackId} />
      <input type="hidden" name="projectId" value={projectId} />
      <button type="submit" className="btn-outline" disabled={pending}>
        {pending
          ? "Memperbarui..."
          : mode === "address"
            ? "Tandai Sudah Diperbaiki"
            : "Tandai Selesai"}
      </button>
      {state.message && (
        <p
          aria-live="polite"
          className={`mt-2 text-xs ${state.ok ? "text-emerald-700" : "text-red-600"}`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
