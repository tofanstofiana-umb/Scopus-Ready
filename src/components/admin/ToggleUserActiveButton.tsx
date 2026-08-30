"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setUserActiveAction } from "@/app/actions/user";

export function ToggleUserActiveButton({ userId, isActive, isSelf }: { userId: string; isActive: boolean; isSelf: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isSelf) return <span className="text-xs text-slate-300">Akun Anda</span>;

  async function handleToggle() {
    if (isActive && !window.confirm("Nonaktifkan akun ini? Pengguna tidak akan bisa login sampai diaktifkan kembali.")) return;
    setPending(true);
    setError(null);
    const result = await setUserActiveAction(userId, !isActive);
    setPending(false);
    if (!result.ok) {
      setError(result.message || "Gagal memperbarui status.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {error && <span className="text-xs text-red-600">{error}</span>}
      <button
        type="button"
        onClick={handleToggle}
        disabled={pending}
        className={isActive ? "btn-outline px-3 py-1.5 text-xs text-red-600" : "btn-outline px-3 py-1.5 text-xs text-emerald-600"}
      >
        {pending ? "Memproses..." : isActive ? "Nonaktifkan" : "Aktifkan"}
      </button>
    </div>
  );
}
