"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { joinClassAction } from "@/app/actions/join-class";
import type { ActionResult } from "@/types/auth";

export function JoinClassForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(joinClassAction, { ok: false } as ActionResult);

  useEffect(() => {
    if (state.ok) {
      router.push("/dashboard");
      router.refresh();
    }
  }, [state.ok, router]);

  return (
    <form action={action} className="section-card space-y-5 p-6 sm:p-8">
      <div>
        <label htmlFor="code" className="mb-2 block text-sm font-bold">Kode Kelas</label>
        <input id="code" name="code" required minLength={3} maxLength={50} className="input-field font-mono" placeholder="Contoh: SR-2026-01" autoComplete="off" />
        <p className="mt-2 text-xs text-slate-500">Dapatkan kode ini dari admin setelah verifikasi pembayaran.</p>
      </div>
      {(state.message || state.fieldErrors) && (
        <p role="alert" className={`rounded-lg p-3 text-xs ${state.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
          {state.message || Object.values(state.fieldErrors ?? {}).flat()[0]}
        </p>
      )}
      <button disabled={pending} className="btn-primary" type="submit">
        {pending ? "Memproses..." : "Gabung Kelas"}
      </button>
    </form>
  );
}
