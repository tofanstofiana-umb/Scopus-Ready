import { AppShell } from "@/components/AppShell";
import { JoinClassForm } from "@/components/classes/JoinClassForm";
import { requirePageIdentity } from "@/services/page-auth.service";

export default async function JoinClassPage() {
  await requirePageIdentity(["participant"]);
  return (
    <AppShell title="Gabung Kelas" subtitle="Masukkan kode kelas yang diberikan admin">
      <div className="mx-auto max-w-lg"><JoinClassForm /></div>
    </AppShell>
  );
}
