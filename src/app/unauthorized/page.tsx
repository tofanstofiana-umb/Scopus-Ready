import Link from "next/link";
import { ShieldX } from "lucide-react";
import { ProductAttribution } from "@/components/ProductAttribution";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <ShieldX className="mx-auto text-red-500" size={42} />
        <h1 className="mt-4 text-xl font-extrabold text-[#082B5C]">Akses Ditolak</h1>
        <p className="mt-2 text-sm text-slate-500">Anda tidak memiliki hak akses ke halaman ini.</p>
        <Link href="/login" className="btn-primary mt-6">Masuk dengan akun lain</Link>
        <div className="mt-6 border-t border-slate-100 pt-5"><ProductAttribution centered /></div>
      </div>
    </main>
  );
}
