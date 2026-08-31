"use client";

import { useActionState } from "react";
import { upsertLibraryResourceAction } from "@/app/actions/library";
import type { ActionResult } from "@/types/auth";
import type { LibraryCategory, LibraryResource } from "@/types/library";

const categoryOptions: { value: LibraryCategory; label: string }[] = [
  { value: "bacaan", label: "Bacaan" },
  { value: "video", label: "Video" },
  { value: "template", label: "Template" },
  { value: "rubrik", label: "Rubrik" },
  { value: "prompt", label: "Prompt AI" },
];

export function LibraryResourceForm({
  modules,
  initial,
  onSaved,
}: {
  modules: { id: string; name: string; sequence: number }[];
  initial?: LibraryResource;
  onSaved?: () => void;
}) {
  const [state, action, pending] = useActionState(async (prevState: ActionResult, formData: FormData) => {
    const result = await upsertLibraryResourceAction(prevState, formData);
    if (result.ok) onSaved?.();
    return result;
  }, { ok: false } as ActionResult);

  const idPrefix = initial?.id ?? "new";

  return (
    <form action={action} className="grid gap-4 p-5 sm:p-6 sm:grid-cols-2">
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <div className="sm:col-span-2">
        <label htmlFor={`${idPrefix}-title`} className="mb-2 block text-sm font-bold">Judul</label>
        <input id={`${idPrefix}-title`} name="title" required minLength={3} maxLength={200} defaultValue={initial?.title} className="input-field" placeholder="Contoh: Dari Fenomena ke Klaim" />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor={`${idPrefix}-description`} className="mb-2 block text-sm font-bold">Deskripsi singkat</label>
        <input id={`${idPrefix}-description`} name="description" required minLength={3} maxLength={500} defaultValue={initial?.description} className="input-field" placeholder="Satu kalimat tentang isi materi" />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-category`} className="mb-2 block text-sm font-bold">Kategori</label>
        <select id={`${idPrefix}-category`} name="category" defaultValue={initial?.category ?? "bacaan"} className="input-field">
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor={`${idPrefix}-moduleId`} className="mb-2 block text-sm font-bold">Modul terkait</label>
        <select id={`${idPrefix}-moduleId`} name="moduleId" defaultValue={initial?.module_id ?? ""} className="input-field">
          <option value="">Materi Pendukung (semua modul)</option>
          {modules.map((module) => (
            <option key={module.id} value={module.id}>{String(module.sequence).padStart(2, "0")} · {module.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor={`${idPrefix}-status`} className="mb-2 block text-sm font-bold">Status</label>
        <select id={`${idPrefix}-status`} name="status" defaultValue={initial?.is_published ? "published" : "draft"} className="input-field">
          <option value="draft">Draf (hanya admin)</option>
          <option value="published">Terbit (tampil di Library)</option>
        </select>
      </div>
      <div>
        <label htmlFor={`${idPrefix}-sequence`} className="mb-2 block text-sm font-bold">Urutan</label>
        <input id={`${idPrefix}-sequence`} name="sequence" type="number" min={0} defaultValue={initial?.sequence ?? 0} className="input-field" />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor={`${idPrefix}-url`} className="mb-2 block text-sm font-bold">Tautan (video / template)</label>
        <input id={`${idPrefix}-url`} name="url" type="url" defaultValue={initial?.url ?? ""} className="input-field" placeholder="https://..." />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor={`${idPrefix}-body`} className="mb-2 block text-sm font-bold">Isi naskah (bacaan / prompt)</label>
        <textarea id={`${idPrefix}-body`} name="body" rows={6} defaultValue={initial?.body ?? ""} className="input-field" placeholder="Tulis isi materi bacaan di sini..." />
      </div>
      {(state.message || state.fieldErrors) && !state.ok && (
        <p role="alert" className="sm:col-span-2 rounded-lg bg-red-50 p-3 text-xs text-red-700">
          {state.message || Object.values(state.fieldErrors ?? {}).flat()[0]}
        </p>
      )}
      <div className="sm:col-span-2">
        <button disabled={pending} className="btn-primary" type="submit">
          {pending ? "Menyimpan..." : initial ? "Simpan Perubahan" : "Tambah Materi"}
        </button>
      </div>
    </form>
  );
}
