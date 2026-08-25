"use client";

import { useMemo, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, LoaderCircle, RotateCcw, Save } from "lucide-react";
import { saveProblemBuilderAction } from "@/app/actions/worksheet";
import type { ProblemBuilderContent, SaveStatus } from "@/types/worksheet";

const fields: Array<{ key: keyof ProblemBuilderContent; label: string; help: string; maxLength: number }> = [
  { key: "topic", label: "Apa topik penelitian Anda?", help: "Tuliskan topik umum yang ingin Anda teliti.", maxLength: 500 },
  { key: "phenomenon", label: "Fenomena apa yang sedang terjadi?", help: "Jelaskan kondisi nyata yang Anda amati.", maxLength: 1500 },
  { key: "problem", label: "Apa yang menjadi masalah?", help: "Jelaskan kondisi yang salah atau belum optimal.", maxLength: 1500 },
  { key: "evidence", label: "Apa bukti bahwa masalah itu ada?", help: "Gunakan data, statistik, atau penelitian yang dapat diverifikasi.", maxLength: 2000 },
  { key: "importance", label: "Mengapa masalah tersebut penting?", help: "Jelaskan dampaknya jika masalah tidak diselesaikan.", maxLength: 1500 },
];

export function ProblemBuilderForm({ projectId, initialContent, initialUpdatedAt }: {
  projectId: string;
  initialContent: ProblemBuilderContent;
  initialUpdatedAt: string | null;
}) {
  const [content, setContent] = useState(initialContent);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const updatedAtRef = useRef(initialUpdatedAt);
  const [lastSavedContent, setLastSavedContent] = useState(initialContent);
  const completedFields = useMemo(
    () => fields.filter((field) => String(content[field.key]).trim().length > 0).length,
    [content],
  );
  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(content) !== JSON.stringify(lastSavedContent),
    [content, lastSavedContent],
  );

  async function save() {
    setSaveStatus("saving");
    setMessage(null);
    const result = await saveProblemBuilderAction({ projectId, content, lastKnownUpdatedAt: updatedAtRef.current });
    if (result.ok && result.data) {
      updatedAtRef.current = result.data.updatedAt;
      setLastSavedContent(content);
      setSaveStatus("saved");
      return;
    }
    setSaveStatus("error");
    setMessage(result.message || Object.values(result.fieldErrors ?? {}).flat()[0] || "Gagal menyimpan.");
  }

  function updateField(key: keyof ProblemBuilderContent, value: string) {
    setContent((current) => ({ ...current, [key]: value }));
    setSaveStatus("idle");
    setMessage(null);
  }

  const field = fields[activeStep];
  return (
    <div className="space-y-5">
      <div className="section-card">
        <div className="section-card-header">
          <div><div className="text-xs font-bold uppercase tracking-wider text-slate-400">Problem Builder</div><div className="mt-1 font-extrabold text-[#082B5C]">Langkah {activeStep + 1} dari {fields.length}</div></div>
          <div className="text-right"><div className="text-lg font-black text-[#082B5C]">{completedFields}/{fields.length}</div><div className="text-[10px] text-slate-400">jawaban terisi</div></div>
        </div>
        <div className="px-5 pt-5 sm:px-8">
          <div className="worksheet-stepper">
            {fields.map((item, index) => <button key={item.key} type="button" onClick={() => setActiveStep(index)} className={`worksheet-step ${index === activeStep ? "is-active" : ""} ${String(content[item.key] || "").trim() ? "is-complete" : ""}`} aria-label={`Buka langkah ${index + 1}`}><span>{index + 1}</span></button>)}
          </div>
        </div>
        <div className="space-y-4 p-5 sm:p-8">
          <div><h2 className="text-base font-extrabold text-[#082B5C]">{field.label}</h2><p className="mt-1 text-xs text-slate-500">{field.help}</p></div>
          <textarea aria-label={field.label} className="input-field min-h-56" maxLength={field.maxLength} value={String(content[field.key] || "")} onChange={(event) => updateField(field.key, event.target.value)} placeholder="Ketik jawaban Anda di sini..." />
          <div className="flex justify-end text-[10px] text-slate-400"><span>{String(content[field.key] || "").length}/{field.maxLength}</span></div>
          <div className="flex flex-wrap justify-between gap-3 border-t border-slate-100 pt-5">
            <button type="button" className="btn-outline" disabled={activeStep === 0} onClick={() => setActiveStep((step) => Math.max(0, step - 1))}>Kembali</button>
            <div className="flex gap-2">
              <button type="button" className="btn-outline" disabled={activeStep === fields.length - 1} onClick={() => setActiveStep((step) => Math.min(fields.length - 1, step + 1))}>Lanjut</button>
              <button type="button" className="btn-primary" disabled={saveStatus === "saving" || !hasUnsavedChanges} onClick={() => void save()}><Save size={15} /> Simpan Jawaban</button>
            </div>
          </div>
        </div>
      </div>

      <div aria-live="polite" className={`flex items-center gap-2 rounded-xl border p-3 text-xs ${saveStatus === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-slate-200 bg-white text-slate-500"}`}>
        {saveStatus === "saving" && <><LoaderCircle className="animate-spin" size={15} /> Menyimpan ke database...</>}
        {saveStatus === "saved" && <><CheckCircle2 className="text-emerald-500" size={15} /> Tersimpan di database</>}
        {saveStatus === "idle" && <span>{hasUnsavedChanges ? "Perubahan belum disimpan. Klik Simpan Jawaban." : initialUpdatedAt ? "Tidak ada perubahan baru." : "Isi jawaban lalu simpan ke database."}</span>}
        {saveStatus === "error" && <><AlertCircle size={15} /><span className="flex-1">{message}</span><button type="button" onClick={() => void save()} className="inline-flex items-center gap-1 font-bold"><RotateCcw size={13} /> Coba Lagi</button></>}
      </div>
    </div>
  );
}
