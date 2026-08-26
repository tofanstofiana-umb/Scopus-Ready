import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { getTrainerClass, getTrainerParticipants } from "@/services/class.service";
import { requirePageIdentity } from "@/services/page-auth.service";

export default async function TrainerParticipantPage({ params }: { params: Promise<{ classId: string; participantId: string }> }) {
  await requirePageIdentity(["trainer", "admin"]);
  const { classId, participantId } = await params;
  const [trainerClass, participants] = await Promise.all([getTrainerClass(classId), getTrainerParticipants(classId)]);
  const member = participants.find((item) => item.user_id === participantId);
  if (!trainerClass || !member) notFound();
  const profile = Array.isArray(member.profile) ? member.profile[0] : member.profile;
  return (
    <AppShell role="trainer" title={profile?.full_name || "Peserta"} subtitle={trainerClass.name}>
      <div className="space-y-4">
        {member.projects.length === 0 ? (
          <div className="section-card p-8 text-center text-sm text-slate-500">Peserta belum memiliki proyek aktif.</div>
        ) : member.projects.map((project) => (
          <div key={project.id} className="section-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="font-extrabold text-[#082B5C]">{project.title}</div>
                <div className="text-xs text-slate-500">Diperbarui {new Date(project.updated_at).toLocaleDateString("id-ID")}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/trainer/projects/${project.id}/problem`} className="btn-primary">Buka Problem Builder</Link>
                <Link href={`/trainer/projects/${project.id}/literature`} className="btn-outline">Buka Literature Map</Link>
                <Link href={`/trainer/projects/${project.id}/gap`} className="btn-outline">Buka Gap Detector</Link>
                <Link href={`/trainer/projects/${project.id}/novelty`} className="btn-outline">Buka Novelty Builder</Link>
                <Link href={`/trainer/projects/${project.id}/blueprint`} className="btn-outline">Buka Article Blueprint</Link>
                <Link href={`/trainer/projects/${project.id}/method`} className="btn-outline">Buka Method Fit</Link>
                <Link href={`/trainer/projects/${project.id}/scientific_story`} className="btn-outline">Buka Scientific Story</Link>
                <Link href={`/trainer/projects/${project.id}/journal-target`} className="btn-outline">Buka Journal Target</Link>
                <Link href={`/trainer/projects/${project.id}/internal_review`} className="btn-outline">Buka Internal Review</Link>
                <Link href={`/trainer/projects/${project.id}/journal_adaptation`} className="btn-outline">Buka Journal Adaptation</Link>
                <Link href={`/trainer/projects/${project.id}/submission`} className="btn-outline">Buka Submission Checklist</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
