"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, ArrowRight, CheckCircle2, User, Building, GraduationCap, Globe } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 2 form state
  const [academicProfile, setAcademicProfile] = useState({
    name: "Tofan Stofiana",
    institution: "Universitas Indonesia",
    field: "Pendidikan & Teknologi Pembelajaran",
    degree: "S3 / Doktoral",
    userStatus: "Dosen / Peneliti",
    manuscriptLanguage: "Bahasa Inggris",
  });

  // Step 3 manuscript condition
  const [manuscriptCondition, setManuscriptCondition] = useState("Saya sudah memiliki draft artikel");

  const conditionOptions = [
    { title: "Saya baru memiliki ide", desc: "Mulai dari nol mengeksplorasi fenomena dan masalah" },
    { title: "Saya sudah memiliki proposal", desc: "Proposal telah disetujui, siap merumuskan artikel" },
    { title: "Saya sudah memiliki data", desc: "Data empiris/lapangan sudah terkumpul siap diolah" },
    { title: "Saya sudah memiliki draft artikel", desc: "Draft awal siap diperkuat structure & novelty-nya" },
    { title: "Saya sedang mencari jurnal", desc: "Manuskrip siap, mencari journal target yang paling fit" },
    { title: "Saya sedang revisi reviewer", desc: "Menjawab catatan peer-reviewer dari jurnal target" },
  ];

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "linear-gradient(135deg, #082B5C 0%, #0B4EA2 100%)" }}>
      <div className="w-full max-w-2xl bg-white rounded-3xl p-8 sm:p-10 shadow-2xl animate-fade-in relative overflow-hidden">
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(217,164,65,0.15)" }}>
              <BookOpen size={20} style={{ color: "#D9A441" }} />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-sm">SCOPUS READY™</div>
              <div className="text-xs text-gray-400">Onboarding Persiapan Manuskrip</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={{
                  background: step === s ? "#0B4EA2" : step > s ? "#10B981" : "#E2E8F0",
                  color: step >= s ? "white" : "#64748B",
                }}
              >
                {step > s ? "✓" : s}
              </div>
            ))}
          </div>
        </div>

        {/* STEP 1: Selamat Datang */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="inline-block px-3 py-1 rounded-full text-xs font-bold" style={{ background: "rgba(217,164,65,0.15)", color: "#D9A441" }}>
              Langkah 1 dari 3
            </div>
            <h1 className="text-3xl font-black text-gray-900 leading-tight">
              Selamat Datang di <br />
              <span className="gradient-text">SCOPUS READY™ Digital Workbook</span>
            </h1>
            <p className="text-gray-600 text-base leading-relaxed">
              SCOPUS READY™ akan membantu Anda membangun manuskrip secara bertahap. Setiap tahap menghasilkan bagian nyata yang dapat langsung digunakan untuk artikel jurnal target Anda.
            </p>
            <div className="p-5 rounded-2xl border border-blue-100 space-y-3" style={{ background: "rgba(11,78,162,0.03)" }}>
              <div className="font-bold text-sm text-gray-800">Prinsip Pendampingan Publikasi:</div>
              <ul className="text-xs text-gray-600 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                  Bekerja lebih terarah melalui 12 lembar kerja interaktif.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                  Mengukur kesiapan dengan sistem diagnosis <strong>SCOPUS READY Score™</strong>.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                  Mendapatkan review kritis dan bimbingan terstruktur dari trainer.
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* STEP 2: Profil Akademik */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="inline-block px-3 py-1 rounded-full text-xs font-bold" style={{ background: "rgba(11,78,162,0.1)", color: "#0B4EA2" }}>
              Langkah 2 dari 3
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">Profil Akademik Peneliti</h1>
              <p className="text-gray-500 text-sm mt-1">Lengkapi data untuk penyesuaian panduan dan template manuskrip Anda.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nama Lengkap & Gelar</label>
                <div className="relative">
                  <input
                    className="input-field pl-9 text-sm"
                    value={academicProfile.name}
                    onChange={(e) => setAcademicProfile({ ...academicProfile, name: e.target.value })}
                  />
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Institusi / Universitas</label>
                <div className="relative">
                  <input
                    className="input-field pl-9 text-sm"
                    value={academicProfile.institution}
                    onChange={(e) => setAcademicProfile({ ...academicProfile, institution: e.target.value })}
                  />
                  <Building size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Bidang Keilmuan</label>
                <input
                  className="input-field text-sm"
                  value={academicProfile.field}
                  onChange={(e) => setAcademicProfile({ ...academicProfile, field: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Jenjang Pendidikan / Gelar Target</label>
                <select
                  className="input-field text-sm"
                  value={academicProfile.degree}
                  onChange={(e) => setAcademicProfile({ ...academicProfile, degree: e.target.value })}
                >
                  <option>S1 / Sarjana</option>
                  <option>S2 / Magister</option>
                  <option>S3 / Doktoral</option>
                  <option>Post-Doctoral</option>
                  <option>Peneliti Independen</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Status Pengguna</label>
                <select
                  className="input-field text-sm"
                  value={academicProfile.userStatus}
                  onChange={(e) => setAcademicProfile({ ...academicProfile, userStatus: e.target.value })}
                >
                  <option>Dosen / Peneliti</option>
                  <option>Mahasiswa Pascasarjana</option>
                  <option>Praktisi / Industri</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Bahasa Manuskrip Utama</label>
                <select
                  className="input-field text-sm"
                  value={academicProfile.manuscriptLanguage}
                  onChange={(e) => setAcademicProfile({ ...academicProfile, manuscriptLanguage: e.target.value })}
                >
                  <option>Bahasa Inggris</option>
                  <option>Bahasa Indonesia</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Kondisi Manuskrip */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="inline-block px-3 py-1 rounded-full text-xs font-bold" style={{ background: "rgba(16,185,129,0.1)", color: "#10B981" }}>
              Langkah 3 dari 3
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">Di Mana Posisi Manuskrip Anda Sekarang?</h1>
              <p className="text-gray-500 text-sm mt-1">Kami akan mengonfigurasi dashboard dan prioritas pengerjaan sesuai kondisi Anda saat ini.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {conditionOptions.map((opt) => {
                const isSelected = manuscriptCondition === opt.title;
                return (
                  <div
                    key={opt.title}
                    onClick={() => setManuscriptCondition(opt.title)}
                    className="p-4 rounded-2xl border-2 transition-all cursor-pointer card-hover"
                    style={{
                      borderColor: isSelected ? "#0B4EA2" : "#E2E8F0",
                      background: isSelected ? "rgba(11,78,162,0.04)" : "white",
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-gray-900">{opt.title}</span>
                      {isSelected && <CheckCircle2 size={16} style={{ color: "#0B4EA2" }} />}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{opt.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom actions */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="btn-ghost text-sm font-semibold text-gray-500"
            >
              Kembali
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={handleNext}
            className="btn-primary"
            style={{
              background: step === 3 ? "linear-gradient(135deg, #D9A441, #c8932d)" : undefined,
            }}
          >
            {step === 1 ? "Mulai Sekarang" : step === 3 ? "Buka Dashboard Saya" : "Lanjutkan"} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
