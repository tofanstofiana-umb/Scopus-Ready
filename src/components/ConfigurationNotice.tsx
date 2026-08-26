import Link from "next/link";
import { Database, ExternalLink } from "lucide-react";

export function ConfigurationNotice() {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-amber-100 p-3"><Database size={22} /></div>
        <div>
          <h2 className="font-extrabold">Supabase belum dikonfigurasi</h2>
          <p className="mt-1 text-sm leading-relaxed text-amber-800">
            Salin <code>.env.example</code> menjadi <code>.env.local</code>, isi URL dan anon key, lalu jalankan migrasi di folder <code>supabase/migrations</code>.
          </p>
          <Link href="/login" className="mt-4 inline-flex items-center gap-2 text-sm font-bold underline">
            Kembali ke login <ExternalLink size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

