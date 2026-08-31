"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { BookOpen, PlayCircle, FileText, ClipboardCheck, Sparkles, ExternalLink, X, Library } from "lucide-react";
import type { LibraryCategory, LibraryModuleGroup, LibraryResource } from "@/types/library";

const categoryMeta: Record<LibraryCategory, { label: string; icon: typeof BookOpen; color: string }> = {
  bacaan: { label: "Bacaan", icon: BookOpen, color: "#0B4EA2" },
  video: { label: "Video", icon: PlayCircle, color: "#D9A441" },
  template: { label: "Template", icon: FileText, color: "#6B7280" },
  rubrik: { label: "Rubrik", icon: ClipboardCheck, color: "#10B981" },
  prompt: { label: "Prompt AI", icon: Sparkles, color: "#8B5CF6" },
};

function ResourceCard({ resource }: { resource: LibraryResource }) {
  const meta = categoryMeta[resource.category];
  const [open, setOpen] = useState(false);
  const hasBody = Boolean(resource.body);
  const hasUrl = Boolean(resource.url);

  return (
    <div className="section-card flex flex-col gap-3 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: meta.color + "15" }}>
          <meta.icon size={17} style={{ color: meta.color }} />
        </div>
        <div className="min-w-0 flex-1">
          <span className="badge text-[10px]" style={{ color: meta.color, background: meta.color + "15" }}>{meta.label}</span>
          <h3 className="mt-1.5 font-extrabold leading-snug text-[#082B5C]">{resource.title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">{resource.description}</p>
        </div>
      </div>

      {hasBody && (
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <button type="button" className="btn-outline mt-1 justify-center text-xs">Baca Materi</button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
            <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white shadow-2xl">
              <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
                <Dialog.Title className="font-extrabold text-[#082B5C]">{resource.title}</Dialog.Title>
                <Dialog.Close asChild>
                  <button aria-label="Tutup" className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
                </Dialog.Close>
              </div>
              <div className="whitespace-pre-line px-6 py-5 text-sm leading-7 text-slate-700">{resource.body}</div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}

      {hasUrl && (
        <a href={resource.url!} target="_blank" rel="noopener noreferrer" className="btn-outline mt-1 justify-center text-xs">
          Buka Tautan <ExternalLink size={13} />
        </a>
      )}

      {!hasBody && !hasUrl && (
        <span className="badge mt-1 self-start bg-amber-50 text-[11px] text-amber-700">Segera hadir</span>
      )}
    </div>
  );
}

function ModuleGroupSection({ group }: { group: LibraryModuleGroup }) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        {group.moduleSequence !== null && (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#082B5C] text-[10px] font-black text-white">{group.moduleSequence}</span>
        )}
        <h2 className="font-extrabold text-[#082B5C]">{group.moduleName}</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {group.resources.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>
    </section>
  );
}

export function LibraryView({ groups }: { groups: LibraryModuleGroup[] }) {
  if (groups.length === 0) {
    return (
      <div className="section-card p-10 text-center">
        <Library size={42} className="mx-auto text-[#0B4EA2]" aria-hidden="true" />
        <h2 className="mt-4 text-lg font-extrabold text-[#082B5C]">Materi sedang disiapkan</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-slate-500">
          Bacaan dan video tutorial untuk tiap modul workbook akan tampil di sini begitu admin menerbitkannya.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <ModuleGroupSection key={group.moduleId ?? "pendukung"} group={group} />
      ))}
    </div>
  );
}
