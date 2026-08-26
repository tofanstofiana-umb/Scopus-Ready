import { AppShell } from "@/components/AppShell";
import { ConfigurationNotice } from "@/components/ConfigurationNotice";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { getCurrentIdentity } from "@/services/auth.service";

export default async function ProfilePage() {
  if (!getSupabaseConfig().configured) return <AppShell title="Profil"><ConfigurationNotice /></AppShell>;
  const identity = await getCurrentIdentity();
  if (!identity) return null;
  const { profile } = identity;
  return <AppShell role={profile.role === "participant" ? "peserta" : profile.role} title="Profil"><div className="mx-auto max-w-2xl section-card p-8"><div className="grid gap-5 sm:grid-cols-2">{[["Nama", profile.full_name], ["Email", profile.email], ["Role", profile.role], ["Institusi", profile.institution || "Belum diisi"], ["Bidang Studi", profile.field_of_study || "Belum diisi"]].map(([label, value]) => <div key={label}><div className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</div><div className="mt-1 text-sm font-semibold text-slate-800">{value}</div></div>)}</div></div></AppShell>;
}
