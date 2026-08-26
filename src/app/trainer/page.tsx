import Link from "next/link";
import { ArrowRight, BookOpen, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { getTrainerClasses, getTrainerParticipants } from "@/services/class.service";
import { requirePageIdentity } from "@/services/page-auth.service";

export default async function TrainerPage() {
  await requirePageIdentity(["trainer", "admin"]);
  const classes = await getTrainerClasses();
  const classSummaries = await Promise.all(
    classes.map(async (trainerClass) => ({
      ...trainerClass,
      participantCount: (await getTrainerParticipants(trainerClass.id)).length,
    })),
  );

  return (
    <AppShell role="trainer" title="Dashboard Trainer" subtitle="Baca worksheet dan berikan feedback kepada peserta kelas Anda.">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="wireframe-hero p-6 sm:p-8">
          <div className="relative z-10">
            <div className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#F4BF4F]">Pendampingan Aktif</div>
            <h2 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">{classSummaries.length} kelas terhubung</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">Data pada halaman ini dibaca langsung dari kelas dan keanggotaan Supabase.</p>
          </div>
        </section>

        <section id="participants" className="section-card">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <h2 className="text-lg font-extrabold text-[#082B5C]">Kelas Saya</h2>
            <p className="mt-1 text-xs text-slate-500">Pilih kelas untuk membuka peserta dan proyek manuskripnya.</p>
          </div>
          {classSummaries.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">Belum ada kelas yang ditugaskan kepada akun trainer ini.</div>
          ) : (
            <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
              {classSummaries.map((trainerClass) => (
                <article key={trainerClass.id} className="rounded-xl border border-slate-200 p-5">
                  <div className="flex items-start gap-3">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-[#0B4EA2]"><BookOpen size={20} aria-hidden="true" /></div>
                    <div className="min-w-0 flex-1">
                      <span className="badge bg-emerald-50 text-emerald-700">{trainerClass.status}</span>
                      <h3 className="mt-3 font-extrabold text-[#082B5C]">{trainerClass.name}</h3>
                      <div className="mt-2 flex items-center gap-2 text-xs text-slate-500"><Users size={14} aria-hidden="true" />{trainerClass.participantCount} peserta · Kode {trainerClass.code}</div>
                    </div>
                  </div>
                  <Link href={`/trainer/classes/${trainerClass.id}`} className="btn-primary mt-5 w-full justify-center">Buka Kelas <ArrowRight size={14} aria-hidden="true" /></Link>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
