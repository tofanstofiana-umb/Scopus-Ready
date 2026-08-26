import Link from "next/link";
import type { Project } from "@/types/project";

export function ProjectSwitcher({
  projects,
  selectedProjectId,
  pathname,
}: {
  projects: Project[];
  selectedProjectId: string;
  pathname: string;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Pilih proyek manuskrip">
      {projects.map((project) => (
        <Link
          key={project.id}
          href={`${pathname}?projectId=${project.id}`}
          className={`shrink-0 rounded-lg border px-4 py-2 text-xs font-bold transition ${
            project.id === selectedProjectId
              ? "border-[#0B4EA2] bg-[#0B4EA2] text-white"
              : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
          }`}
        >
          {project.title}
        </Link>
      ))}
    </div>
  );
}
