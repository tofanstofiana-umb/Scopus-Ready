"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";
import { updateClassAction } from "@/app/actions/class";
import type { ActionResult } from "@/types/auth";
import type { AdminClassSummary, ClassStatus, TrainerOption } from "@/types/class";

const statusOptions: { value: ClassStatus; label: string }[] = [
  { value: "active", label: "Aktif" },
  { value: "completed", label: "Selesai" },
  { value: "archived", label: "Diarsipkan" },
];

export function EditClassDialog({ classItem, trainers }: { classItem: AdminClassSummary; trainers: TrainerOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(updateClassAction, { ok: false } as ActionResult);

  useEffect(() => {
    // Closing the dialog here is a direct, one-time reaction to the form
    // action's result (not a value derivable from props/state during
    // render), and only fires when state.ok actually flips — there's no
    // over-fetch/cascading-render risk this rule otherwise guards against.
    if (state.ok) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(false);
      router.refresh();
    }
  }, [state.ok, router]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button type="button" className="btn-outline px-3 py-1.5 text-xs">
          <Pencil size={12} /> Edit
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <Dialog.Title className="font-extrabold text-[#082B5C]">Edit Kelas</Dialog.Title>
            <Dialog.Close asChild>
              <button aria-label="Tutup" className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </Dialog.Close>
          </div>
          <form action={action} className="grid gap-4 p-5 sm:grid-cols-2">
            <input type="hidden" name="classId" value={classItem.id} />
            <div className="sm:col-span-2">
              <label htmlFor={`edit-name-${classItem.id}`} className="mb-2 block text-sm font-bold">Nama kelas</label>
              <input id={`edit-name-${classItem.id}`} name="name" required minLength={3} maxLength={200} defaultValue={classItem.name} className="input-field" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold">Kode kelas</label>
              <input disabled value={classItem.code} className="input-field font-mono opacity-60" />
              <p className="mt-1 text-[11px] text-slate-400">Kode tidak bisa diubah — sudah dibagikan ke peserta.</p>
            </div>
            <div>
              <label htmlFor={`edit-status-${classItem.id}`} className="mb-2 block text-sm font-bold">Status</label>
              <select id={`edit-status-${classItem.id}`} name="status" defaultValue={classItem.status === "draft" ? "active" : classItem.status} className="input-field">
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={`edit-trainer-${classItem.id}`} className="mb-2 block text-sm font-bold">Trainer pendamping</label>
              <select id={`edit-trainer-${classItem.id}`} name="trainerId" defaultValue={classItem.trainer_id ?? ""} className="input-field">
                <option value="">Belum ditugaskan</option>
                {trainers.map((trainer) => (
                  <option key={trainer.id} value={trainer.id}>{trainer.full_name || trainer.email}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={`edit-price-${classItem.id}`} className="mb-2 block text-sm font-bold">Harga (Rp)</label>
              <input id={`edit-price-${classItem.id}`} name="price" type="number" min={0} step={1000} defaultValue={classItem.price} className="input-field" />
            </div>
            <div>
              <label htmlFor={`edit-start-${classItem.id}`} className="mb-2 block text-sm font-bold">Tanggal mulai</label>
              <input id={`edit-start-${classItem.id}`} name="startDate" type="date" defaultValue={classItem.start_date ?? ""} className="input-field" />
            </div>
            <div>
              <label htmlFor={`edit-end-${classItem.id}`} className="mb-2 block text-sm font-bold">Tanggal selesai</label>
              <input id={`edit-end-${classItem.id}`} name="endDate" type="date" defaultValue={classItem.end_date ?? ""} className="input-field" />
            </div>
            {(state.message || state.fieldErrors) && !state.ok && (
              <p role="alert" className="sm:col-span-2 rounded-lg bg-red-50 p-3 text-xs text-red-700">
                {state.message || Object.values(state.fieldErrors ?? {}).flat()[0]}
              </p>
            )}
            <div className="sm:col-span-2">
              <button disabled={pending} className="btn-primary w-full justify-center" type="submit">
                {pending ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
