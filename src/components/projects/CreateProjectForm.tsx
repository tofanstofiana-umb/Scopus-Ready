"use client";

import { useActionState } from "react";
import { createProjectAction } from "@/app/actions/project";
import type { ActionResult } from "@/types/auth";
import type { ProjectClassOption } from "@/types/project";

export function CreateProjectForm({ classes }: { classes: ProjectClassOption[] }) {
  const [state, action, pending] = useActionState(createProjectAction, { ok: false } as ActionResult);
  return (
    <form action={action} className="section-card space-y-5 p-6 sm:p-8">
      <div>
        <label htmlFor="title" className="mb-2 block text-sm font-bold">Judul manuskrip</label>
        <textarea id="title" name="title" required minLength={5} maxLength={500} rows={3} className="input-field" placeholder="Masukkan judul sementara penelitian..." />
      </div>
      <div>
        <label htmlFor="field" className="mb-2 block text-sm font-bold">Bidang penelitian</label>
        <input id="field" name="field" maxLength={200} className="input-field" placeholder="Contoh: Pendidikan" />
      </div>
      <div>
        <label htmlFor="researchStage" className="mb-2 block text-sm font-bold">Tahap penelitian</label>
        <select id="researchStage" name="researchStage" defaultValue="idea" className="input-field">
          <option value="idea">Ide</option>
          <option value="proposal">Proposal</option>
          <option value="data_available">Data tersedia</option>
          <option value="draft_manuscript">Draft manuskrip</option>
          <option value="journal_targeting">Menentukan jurnal</option>
          <option value="review_revision">Review dan revisi</option>
        </select>
      </div>
      <div>
        <label htmlFor="classId" className="mb-2 block text-sm font-bold">Kelas pendampingan</label>
        <select id="classId" name="classId" defaultValue={classes[0]?.id ?? ""} className="input-field">
          <option value="">Tanpa kelas</option>
          {classes.map((classOption) => (
            <option key={classOption.id} value={classOption.id}>{classOption.name} ({classOption.code})</option>
          ))}
        </select>
        <p className="mt-2 text-xs text-slate-500">Trainer hanya dapat membaca proyek yang dihubungkan ke kelasnya.</p>
      </div>
      {(state.message || state.fieldErrors) && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-xs text-red-700">
          {state.message || Object.values(state.fieldErrors ?? {}).flat()[0]}
        </p>
      )}
      <button disabled={pending} className="btn-primary" type="submit">
        {pending ? "Menyimpan..." : "Buat Proyek"}
      </button>
    </form>
  );
}
