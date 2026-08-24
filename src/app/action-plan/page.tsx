"use client";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { actionPlanTasks } from "@/lib/mockData";
import { CheckCircle2, Circle, Clock, Target, Calendar, ChevronRight } from "lucide-react";

type TaskStatus = "done" | "inprogress" | "todo";

const statusConfig: Record<TaskStatus, { color: string; bg: string; label: string; icon: typeof CheckCircle2 }> = {
  done: { color: "#10B981", bg: "rgba(16,185,129,0.08)", label: "Selesai", icon: CheckCircle2 },
  inprogress: { color: "#0B4EA2", bg: "rgba(11,78,162,0.06)", label: "Sedang Dikerjakan", icon: Clock },
  todo: { color: "#9CA3AF", bg: "rgba(156,163,175,0.06)", label: "Belum Mulai", icon: Circle },
};

const weekLabels = ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4"];
const weekThemes = [
  "Masalah, Gap, dan Novelty",
  "Metode, Hasil, dan Pembahasan",
  "Journal Fit dan Adaptasi",
  "Review dan Submission",
];

export default function ActionPlanPage() {
  const [tasks, setTasks] = useState(actionPlanTasks);
  const done = tasks.filter(t => t.status === "done").length;
  const pct = Math.round((done / tasks.length) * 100);

  const cycleStatus = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const next: TaskStatus = t.status === "todo" ? "inprogress" : t.status === "inprogress" ? "done" : "todo";
      return { ...t, status: next };
    }));
  };

  return (
    <AppShell title="Action Plan" subtitle="30-Day Publication Roadmap">
      <div className="space-y-6 animate-fade-in">

        {/* Header */}
        <div className="rounded-2xl p-6 text-white"
          style={{ background: "linear-gradient(135deg, #082B5C, #0B4EA2)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-black">30-Day Action Plan</h2>
              <p className="text-white/60 text-sm mt-1">Rencana kerja terstruktur menuju submission</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black" style={{ color: "#D9A441" }}>{done}/{tasks.length}</div>
              <div className="text-white/50 text-xs">Tugas Selesai</div>
            </div>
          </div>
          <div className="progress-bar" style={{ height: "8px" }}>
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="text-xs text-white/40 mt-2">{pct}% selesai</div>
        </div>

        {/* Target summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Calendar, label: "Target Submit", value: "30 September 2026", color: "#D9A441" },
            { icon: Target, label: "Jurnal Target", value: "Education & IT", color: "#0B4EA2" },
            { icon: Clock, label: "Sisa Hari", value: "37 hari", color: "#10B981" },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: item.color + "15" }}>
                <item.icon size={20} style={{ color: item.color }} />
              </div>
              <div>
                <div className="text-xs text-gray-400 font-medium">{item.label}</div>
                <div className="font-bold text-gray-800">{item.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Weekly tasks */}
        <div className="space-y-4">
          {[1, 2, 3, 4].map((week) => {
            const weekTasks = tasks.filter(t => t.week === week);
            const weekDone = weekTasks.filter(t => t.status === "done").length;
            return (
              <div key={week} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between"
                  style={{ background: weekDone === weekTasks.length ? "rgba(16,185,129,0.04)" : "#FAFAFA" }}>
                  <div>
                    <div className="font-bold text-gray-900">{weekLabels[week - 1]}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{weekThemes[week - 1]}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-semibold text-gray-500">{weekDone}/{weekTasks.length} selesai</div>
                    <div className="w-20">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{
                          width: `${weekTasks.length ? (weekDone / weekTasks.length) * 100 : 0}%`
                        }} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-gray-50">
                  {weekTasks.map((task) => {
                    const st = statusConfig[task.status];
                    const Icon = st.icon;
                    return (
                      <div
                        key={task.id}
                        className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => cycleStatus(task.id)}
                      >
                        <Icon size={20} style={{ color: st.color, flexShrink: 0 }} />
                        <div className="flex-1">
                          <div className={`font-medium text-sm ${task.status === "done" ? "line-through text-gray-400" : "text-gray-800"}`}>
                            {task.task}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">Deadline: {task.deadline}</div>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{ color: st.color, background: st.bg }}>
                          {st.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add task */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4">Tambah Tugas</h2>
          <div className="flex gap-3">
            <input id="new-task-input" className="input-field flex-1" placeholder="Tulis tugas baru..." />
            <select id="new-task-week" className="input-field w-36">
              {weekLabels.map(w => <option key={w}>{w}</option>)}
            </select>
            <button id="btn-add-task" className="btn-primary whitespace-nowrap">+ Tambah</button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
