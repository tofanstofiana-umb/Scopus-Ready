import Link from "next/link";
import { ProductAttribution } from "@/components/ProductAttribution";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-extrabold text-[#082B5C]">Pemulihan Password</h1>
        <p className="mt-2 text-sm text-slate-500">Masukkan email akun Anda — kami kirimkan tautan untuk membuat password baru.</p>
        <div className="mt-6"><ForgotPasswordForm /></div>
        <div><Link href="/login" className="btn-outline mt-6">Kembali</Link></div>
        <div className="mt-6 border-t border-slate-100 pt-5"><ProductAttribution centered /></div>
      </div>
    </main>
  );
}
