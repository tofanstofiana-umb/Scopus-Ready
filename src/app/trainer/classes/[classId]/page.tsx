import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { getTrainerClass, getTrainerParticipants } from "@/services/class.service";

export default async function TrainerClassPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params;
  const [trainerClass, participants] = await Promise.all([getTrainerClass(classId), getTrainerParticipants(classId)]);
  if (!trainerClass) notFound();
  return <AppShell role="trainer" title={trainerClass.name} subtitle={`${participants.length} peserta`}><div className="space-y-4"><Link href="/trainer" className="text-sm font-bold text-[#0B4EA2]">← Kembali ke dashboard</Link><div className="section-card divide-y divide-slate-100">{participants.length === 0 && <div className="p-8 text-center text-sm text-slate-500">Belum ada peserta dalam kelas ini.</div>}{participants.map((member) => { const profile = Array.isArray(member.profile) ? member.profile[0] : member.profile; return <div key={member.user_id} className="flex items-center justify-between gap-4 p-5"><div><div className="font-bold">{profile?.full_name || "Peserta"}</div><div className="text-xs text-slate-500">{profile?.institution || profile?.email}</div></div><Link href={`/trainer/classes/${classId}/participants/${member.user_id}`} className="btn-outline">Detail Peserta</Link></div>; })}</div></div></AppShell>;
}
