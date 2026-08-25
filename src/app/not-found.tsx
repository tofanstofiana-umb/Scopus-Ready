import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <FileQuestion className="mx-auto text-[#0B4EA2]" size={42} aria-hidden="true" />
        <h1 className="mt-4 text-xl font-extrabold text-[#082B5C]">Data Tidak Ditemukan</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">Halaman mungkin tidak tersedia atau akun Anda tidak memiliki akses ke data tersebut.</p>
        <Link href="/dashboard" className="btn-primary mt-6">Kembali ke Beranda</Link>
      </div>
    </main>
  );
}
