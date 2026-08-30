"use client";

import { useActionState } from "react";
import { requestPasswordResetAction } from "@/app/actions/auth";
import type { ActionResult } from "@/types/auth";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, { ok: false } as ActionResult);

  if (state.ok) {
    return (
      <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-5 text-emerald-700">
        {state.message}
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-bold text-[#334155]">Email Akun</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          placeholder="nama@institusi.ac.id"
          className="min-h-12 w-full rounded-[10px] border border-[#CBD5E1] bg-white px-4 text-[15px] text-[#172033] transition placeholder:text-[#94A3B8] hover:border-[#94A3B8] focus:border-[#0B4EA2] focus:outline-none focus:ring-4 focus:ring-[#0B4EA2]/10"
        />
      </div>
      {(state.message || state.fieldErrors) && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
          {state.message || Object.values(state.fieldErrors ?? {}).flat()[0]}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-[#0B4EA2] px-5 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(11,78,162,0.22)] transition hover:bg-[#083F85] disabled:cursor-not-allowed disabled:bg-[#94A3B8]"
      >
        {pending ? "Mengirim..." : "Kirim Tautan Pemulihan"}
      </button>
    </form>
  );
}
