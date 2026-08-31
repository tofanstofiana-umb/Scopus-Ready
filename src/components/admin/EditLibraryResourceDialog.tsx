"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";
import { LibraryResourceForm } from "./LibraryResourceForm";
import type { LibraryResource } from "@/types/library";

export function EditLibraryResourceDialog({
  resource,
  modules,
}: {
  resource: LibraryResource;
  modules: { id: string; name: string; sequence: number }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button type="button" className="btn-outline px-3 py-1.5 text-xs">
          <Pencil size={12} /> Edit
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <Dialog.Title className="font-extrabold text-[#082B5C]">Edit Materi</Dialog.Title>
            <Dialog.Close asChild>
              <button aria-label="Tutup" className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </Dialog.Close>
          </div>
          <LibraryResourceForm
            modules={modules}
            initial={resource}
            onSaved={() => {
              setOpen(false);
              router.refresh();
            }}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
