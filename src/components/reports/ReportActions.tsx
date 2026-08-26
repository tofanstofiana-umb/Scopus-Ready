"use client";

import { Download, Printer } from "lucide-react";
import type { ProjectReportData } from "@/types/report";

export function ReportActions({ report }: { report: ProjectReportData }) {
  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `scopus-ready-${report.project.id}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <button type="button" onClick={() => window.print()} className="btn-primary"><Printer size={15} /> Cetak / Simpan PDF</button>
      <button type="button" onClick={downloadJson} className="btn-outline"><Download size={15} /> Unduh Data JSON</button>
    </div>
  );
}
