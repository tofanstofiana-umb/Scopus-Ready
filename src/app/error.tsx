"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function ApplicationError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("application route error", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <AlertTriangle className="mx-auto text-amber-500" size={42} aria-hidden="true" />
        <h1 className="mt-4 text-xl font-extrabold text-[#082B5C]">Halaman Belum Dapat Dimuat</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">Terjadi kendala sementara saat membaca data. Coba kembali tanpa kehilangan data yang sudah tersimpan.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn-primary"><RotateCcw size={15} /> Coba Lagi</button>
          <Link href="/dashboard" className="btn-outline">Kembali ke Beranda</Link>
        </div>
        {error.digest && <p className="mt-5 text-[10px] text-slate-400">Referensi: {error.digest}</p>}
      </div>
    </main>
  );
}
