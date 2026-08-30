"use client";

import { useActionState } from "react";
import { createClassAction } from "@/app/actions/class";
import type { ActionResult } from "@/types/auth";
import type { TrainerOption } from "@/types/class";

export function CreateClassForm({ trainers }: { trainers: TrainerOption[] }) {
  const [state, action, pending] = useActionState(createClassAction, { ok: false } as ActionResult);
  return (
    <form action={action} className="grid gap-4 p-5 sm:p-6 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor="name" className="mb-2 block text-sm font-bold">Nama kelas</label>
        <input id="name" name="name" required minLength={3} maxLength={200} className="input-field" placeholder="Contoh: Workshop Angkatan 03" />
      </div>
      <div>
        <label htmlFor="code" className="mb-2 block text-sm font-bold">Kode kelas</label>
        <input id="code" name="code" required minLength={3} maxLength={50} className="input-field font-mono" placeholder="SR-2026-03" />
      </div>
      <div>
        <label htmlFor="trainerId" className="mb-2 block text-sm font-bold">Trainer pendamping</label>
        <select id="trainerId" name="trainerId" defaultValue="" className="input-field">
          <option value="">Belum ditugaskan</option>
          {trainers.map((trainer) => (
            <option key={trainer.id} value={trainer.id}>{trainer.full_name || trainer.email}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="price" className="mb-2 block text-sm font-bold">Harga (Rp)</label>
        <input id="price" name="price" type="number" min={0} step={1000} defaultValue={0} className="input-field" placeholder="0 = gratis" />
      </div>
      <div>
        <label htmlFor="startDate" className="mb-2 block text-sm font-bold">Tanggal mulai</label>
        <input id="startDate" name="startDate" type="date" className="input-field" />
      </div>
      <div>
        <label htmlFor="endDate" className="mb-2 block text-sm font-bold">Tanggal selesai</label>
        <input id="endDate" name="endDate" type="date" className="input-field" />
      </div>
      {(state.message || state.fieldErrors) && (
        <p role="alert" className="sm:col-span-2 rounded-lg bg-red-50 p-3 text-xs text-red-700">
          {state.message || Object.values(state.fieldErrors ?? {}).flat()[0]}
        </p>
      )}
      <div className="sm:col-span-2">
        <button disabled={pending} className="btn-primary" type="submit">
          {pending ? "Menyimpan..." : "Buat Kelas"}
        </button>
      </div>
    </form>
  );
}
