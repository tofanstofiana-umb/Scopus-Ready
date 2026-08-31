import Link from "next/link";
import { BookOpen, Users, ShieldCheck, BarChart3, Key } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CreateClassForm } from "@/components/admin/CreateClassForm";
import { EditClassDialog } from "@/components/admin/EditClassDialog";
import { ToggleUserActiveButton } from "@/components/admin/ToggleUserActiveButton";
import { LibraryResourceForm } from "@/components/admin/LibraryResourceForm";
import { EditLibraryResourceDialog } from "@/components/admin/EditLibraryResourceDialog";
import { DeleteLibraryResourceButton } from "@/components/admin/DeleteLibraryResourceButton";
import { requirePageIdentity } from "@/services/page-auth.service";
import { getAdminClassSummaries, getAdminUserSummaries, getTrainerOptions } from "@/services/class.service";
import { getAdminReportSummary } from "@/services/admin-report.service";
import { getWorksheetModuleStatuses } from "@/services/worksheet.service";
import { getAllLibraryResourcesForAdmin } from "@/services/library.service";
import type { ClassStatus } from "@/types/class";
import type { AdminReadinessBreakdown } from "@/types/admin-report";
import type { LibraryCategory } from "@/types/library";

const libraryCategoryLabel: Record<LibraryCategory, string> = {
  bacaan: "Bacaan",
  video: "Video",
  template: "Template",
  rubrik: "Rubrik",
  prompt: "Prompt AI",
};

const statusLabel: Record<ClassStatus, string> = { draft: "Belum Mulai", active: "Aktif", completed: "Selesai", archived: "Diarsipkan" };
const statusColor: Record<ClassStatus, string> = { draft: "#9CA3AF", active: "#10B981", completed: "#0B4EA2", archived: "#6B7280" };

const readinessLabel: Record<keyof AdminReadinessBreakdown, string> = {
  ready_to_submit: "Siap Submit",
  minor_revision: "Revisi Kecil",
  major_revision: "Revisi Besar",
  awaiting_assessment: "Belum Lengkap",
};
const readinessColor: Record<keyof AdminReadinessBreakdown, string> = {
  ready_to_submit: "#10B981",
  minor_revision: "#F59E0B",
  major_revision: "#EF4444",
  awaiting_assessment: "#9CA3AF",
};
const readinessOrder: (keyof AdminReadinessBreakdown)[] = ["ready_to_submit", "minor_revision", "major_revision", "awaiting_assessment"];

export default async function AdminPage() {
  const identity = await requirePageIdentity(["admin"]);
  const [classes, trainers, users, report, moduleStatuses, libraryGroups] = await Promise.all([
    getAdminClassSummaries(),
    getTrainerOptions(),
    getAdminUserSummaries(),
    getAdminReportSummary(),
    getWorksheetModuleStatuses(),
    getAllLibraryResourcesForAdmin(),
  ]);

  const totalParticipants = users.filter((u) => u.role === "participant").length;
  const activeClasses = classes.filter((c) => c.status === "active").length;
  // Classes are always created "active" (see createClass) — draft is a
  // schema-level status with no admin workflow to enter it, so counting it
  // here would always read 0. "Selesai" reflects a real, reachable status
  // instead (set via Edit Kelas).
  const completedClasses = classes.filter((c) => c.status === "completed").length;

  const stats = [
    { label: "Total Kelas", value: classes.length, icon: BookOpen, color: "#0B4EA2" },
    { label: "Total Peserta", value: totalParticipants, icon: Users, color: "#10B981" },
    { label: "Kelas Aktif", value: activeClasses, icon: ShieldCheck, color: "#D9A441" },
    { label: "Kelas Selesai", value: completedClasses, icon: BarChart3, color: "#6B7280" },
  ];

  return (
    <AppShell role="admin" title="Admin Dashboard" subtitle="Kelola kelas, trainer, dan peserta">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="section-card p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{stat.label}</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: stat.color + "15" }}>
                  <stat.icon size={16} style={{ color: stat.color }} />
                </div>
              </div>
              <div className="text-3xl font-black text-slate-900">{stat.value}</div>
            </div>
          ))}
        </div>

        <section id="classes" className="section-card overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="font-extrabold text-[#082B5C]">Manajemen Kelas</h2>
            <p className="mt-0.5 text-xs text-slate-500">Buat kelas baru dan tugaskan trainer pendamping.</p>
          </div>
          <CreateClassForm trainers={trainers} />
          <div className="divide-y divide-slate-50 border-t border-slate-100">
            {classes.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">Belum ada kelas.</div>
            ) : (
              classes.map((c) => (
                <div key={c.id} className="flex flex-wrap items-center gap-4 p-4 transition-colors hover:bg-slate-50">
                  <div
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl font-black text-white"
                    style={{ background: "linear-gradient(135deg, #082B5C, #0B4EA2)" }}
                  >
                    {c.name.charAt(0)}
                  </div>
                  <div className="min-w-[180px] flex-1">
                    <div className="font-bold text-slate-800">{c.name}</div>
                    <div className="text-sm text-slate-400">
                      {c.trainerName || "Belum ditugaskan"} · {c.participantCount} peserta · {c.price === 0 ? "Gratis" : new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(c.price)}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 font-mono text-xs">
                      <Key size={12} className="text-slate-400" /> {c.code}
                    </div>
                    <span className="badge text-xs" style={{ color: statusColor[c.status], background: statusColor[c.status] + "18" }}>
                      {statusLabel[c.status]}
                    </span>
                    <EditClassDialog classItem={c} trainers={trainers} />
                    <Link href={`/trainer/classes/${c.id}`} className="btn-outline px-3 py-1.5 text-xs">Kelola</Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section id="users" className="section-card overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="font-extrabold text-[#082B5C]">Pengguna</h2>
            <p className="mt-0.5 text-xs text-slate-500">{users.length} akun terdaftar. Perubahan role belum tersedia di MVP 0.1.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "#F8FAFC" }}>
                  {["Nama", "Email", "Role", "Institusi", "Status", ""].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-semibold text-slate-800">{u.full_name || "—"}</td>
                    <td className="px-6 py-3 text-slate-500">{u.email}</td>
                    <td className="px-6 py-3"><span className="badge bg-blue-50 text-xs capitalize text-blue-700">{u.role}</span></td>
                    <td className="px-6 py-3 text-slate-500">{u.institution || "—"}</td>
                    <td className="px-6 py-3">
                      <span className="badge text-xs" style={{ color: u.is_active ? "#10B981" : "#EF4444", background: u.is_active ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)" }}>
                        {u.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <ToggleUserActiveButton userId={u.id} isActive={u.is_active} isSelf={u.id === identity.profile.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="reports" className="section-card overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="font-extrabold text-[#082B5C]">Laporan & Statistik</h2>
            <p className="mt-0.5 text-xs text-slate-500">Agregasi score dan kesiapan submit dari seluruh proyek manuskrip aktif.</p>
          </div>
          {report.totalProjects === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">Belum ada proyek manuskrip aktif untuk dianalisis.</div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 p-5 sm:p-6 lg:grid-cols-5">
                <div>
                  <div className="text-xs font-semibold text-slate-500">Total Proyek</div>
                  <div className="mt-1 text-2xl font-black text-slate-900">{report.totalProjects}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500">Rata-rata Score</div>
                  <div className="mt-1 text-2xl font-black text-slate-900">{report.averageScore ?? "—"}</div>
                </div>
                {readinessOrder.map((key) => (
                  <div key={key}>
                    <div className="text-xs font-semibold text-slate-500">{readinessLabel[key]}</div>
                    <div className="mt-1 text-2xl font-black" style={{ color: readinessColor[key] }}>{report.readiness[key]}</div>
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto border-t border-slate-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: "#F8FAFC" }}>
                      {["Kelas", "Proyek", "Rata-rata Score", "Siap Submit", "Revisi Kecil", "Revisi Besar", "Belum Lengkap"].map((h) => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {report.byClass.map((row) => (
                      <tr key={row.classId ?? "none"} className="hover:bg-slate-50">
                        <td className="px-6 py-3 font-semibold text-slate-800">{row.className}</td>
                        <td className="px-6 py-3 text-slate-500">{row.totalProjects}</td>
                        <td className="px-6 py-3 text-slate-500">{row.averageScore ?? "—"}</td>
                        {readinessOrder.map((key) => (
                          <td key={key} className="px-6 py-3 font-bold" style={{ color: readinessColor[key] }}>{row.readiness[key]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        <section id="settings" className="section-card overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="font-extrabold text-[#082B5C]">Status Modul Workbook</h2>
            <p className="mt-0.5 text-xs text-slate-500">Tampilan baca saja. Modul dirilis bertahap lewat migrasi database dan terikat pada perhitungan progres peserta — mengubahnya lewat UI berisiko memutus autosave dan progres yang sedang berjalan.</p>
          </div>
          <div className="divide-y divide-slate-50">
            {moduleStatuses.map((module) => (
              <div key={module.id} className="flex items-center gap-4 px-6 py-3">
                <span className="w-6 text-xs font-bold text-slate-400">{module.sequence}</span>
                <span className="flex-1 text-sm font-semibold text-slate-800">{module.name}</span>
                <span className="font-mono text-xs text-slate-400">{module.code}</span>
                <span className="badge text-xs" style={{ color: module.is_active ? "#10B981" : "#9CA3AF", background: module.is_active ? "rgba(16,185,129,0.1)" : "rgba(156,163,175,0.1)" }}>
                  {module.is_active ? "Aktif" : "Belum Dirilis"}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section id="library" className="section-card overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="font-extrabold text-[#082B5C]">Materi Library</h2>
            <p className="mt-0.5 text-xs text-slate-500">Bacaan, video tutorial, dan materi pendukung. Materi berstatus Draf hanya terlihat di sini — terbitkan untuk menampilkannya di halaman Library peserta.</p>
          </div>
          <LibraryResourceForm modules={moduleStatuses} />
          <div className="divide-y divide-slate-50 border-t border-slate-100">
            {libraryGroups.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">Belum ada materi.</div>
            ) : (
              libraryGroups.map((group) => (
                <div key={group.moduleId ?? "pendukung"} className="p-4">
                  <div className="mb-2 px-2 text-xs font-bold uppercase tracking-wide text-slate-400">{group.moduleName}</div>
                  <div className="divide-y divide-slate-50">
                    {group.resources.map((resource) => (
                      <div key={resource.id} className="flex flex-wrap items-center gap-3 px-2 py-3">
                        <span className="badge text-[10px] bg-blue-50 text-blue-700">{libraryCategoryLabel[resource.category]}</span>
                        <span className="min-w-[160px] flex-1 text-sm font-semibold text-slate-800">{resource.title}</span>
                        <span className="badge text-[10px]" style={{ color: resource.is_published ? "#10B981" : "#9CA3AF", background: resource.is_published ? "rgba(16,185,129,0.1)" : "rgba(156,163,175,0.1)" }}>
                          {resource.is_published ? "Terbit" : "Draf"}
                        </span>
                        <div className="flex items-center gap-2">
                          <EditLibraryResourceDialog resource={resource} modules={moduleStatuses} />
                          <DeleteLibraryResourceButton id={resource.id} title={resource.title} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
