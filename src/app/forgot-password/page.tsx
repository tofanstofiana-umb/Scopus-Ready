import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-extrabold text-[#082B5C]">Pemulihan Password</h1>
        <p className="mt-2 text-sm text-slate-500">Pemulihan password akan diaktifkan setelah konfigurasi email Supabase selesai.</p>
        <span className="badge mt-4 bg-amber-50 text-amber-700">Segera Hadir</span>
        <div><Link href="/login" className="btn-outline mt-6">Kembali</Link></div>
      </div>
    </main>
  );
}
