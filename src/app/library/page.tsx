import { AppShell } from "@/components/AppShell";
import { LibraryView } from "@/components/library/LibraryView";
import { requirePageIdentity } from "@/services/page-auth.service";
import { getPublishedLibraryResources } from "@/services/library.service";

export default async function LibraryPage() {
  const identity = await requirePageIdentity(["participant", "trainer", "admin"]);
  const groups = await getPublishedLibraryResources();
  const role = identity.profile.role === "trainer" ? "trainer" : identity.profile.role === "admin" ? "admin" : "peserta";

  return (
    <AppShell role={role} title="Library" subtitle="Materi bacaan dan video tutorial pendamping workbook">
      <LibraryView groups={groups} />
    </AppShell>
  );
}
