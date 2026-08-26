import { AppShell } from "@/components/AppShell";
import { Construction } from "lucide-react";

export function ComingSoonPage({ title, description, role = "peserta" }: { title: string; description: string; role?: "peserta" | "trainer" | "admin" }) {
  return <AppShell role={role} title={title}><div className="mx-auto max-w-2xl section-card p-10 text-center"><Construction className="mx-auto text-amber-500" size={46} /><span className="badge mt-4 bg-amber-50 text-amber-700">Segera Hadir</span><h2 className="mt-4 text-lg font-extrabold text-[#082B5C]">Di luar scope MVP 0.1</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-slate-500">{description}</p></div></AppShell>;
}
