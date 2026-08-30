import { AppShell } from "@/components/AppShell";
import { JoinClassForm } from "@/components/classes/JoinClassForm";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { requirePageIdentity } from "@/services/page-auth.service";

export default async function JoinClassPage() {
  await requirePageIdentity(["participant"]);
  return (
    <AppShell title="Gabung Kelas" subtitle="Masukkan kode kelas yang diberikan admin">
      <div className="mx-auto max-w-lg space-y-4">
        <JoinClassForm />
        <div className="section-card flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">Belum punya kode kelas? Untuk masuk kelas Member, harap hubungi admin.</p>
          <WhatsAppButton message="Halo Admin, saya belum punya kode kelas SCOPUS READY. Mohon bantuannya." />
        </div>
      </div>
    </AppShell>
  );
}
