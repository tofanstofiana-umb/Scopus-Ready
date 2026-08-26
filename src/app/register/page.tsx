"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import { BookOpen, ArrowRight, User, Mail, Lock, KeyRound } from "lucide-react";
import { registerAction } from "@/app/actions/auth";
import type { ActionResult } from "@/types/auth";
import { ProductAttribution } from "@/components/ProductAttribution";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    classCode: "",
  });
  const [state, formAction, pending] = useActionState(registerAction, { ok: false } as ActionResult);

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "linear-gradient(135deg, #082B5C 0%, #0B4EA2 100%)" }}>
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl animate-fade-in">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(217,164,65,0.2)" }}>
            <BookOpen size={20} style={{ color: "#D9A441" }} />
          </div>
          <div>
            <div className="text-xl font-black" style={{ color: "#082B5C" }}>SCOPUS READY™</div>
            <div className="text-xs text-gray-400 font-semibold">Digital Workbook</div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-1">Daftar Akun Baru</h2>
        <p className="text-gray-500 text-sm mb-6">Mulai langkah nyata mempersiapkan manuskrip Anda</p>

        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Nama Lengkap</label>
            <div className="relative">
              <input
                type="text"
                name="fullName"
                required
                className="input-field pl-9 text-sm"
                placeholder="Dr. Tofan Stofiana, M.Pd."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Email Institusi / Pribadi</label>
            <div className="relative">
              <input
                type="email"
                name="email"
                required
                className="input-field pl-9 text-sm"
                placeholder="nama@institusi.ac.id"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                name="password"
                required
                className="input-field pl-9 text-sm"
                placeholder="Minimal 8 karakter"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Kode Kelas Workshop <span className="text-gray-400 font-normal">(opsional)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="classCode"
                className="input-field pl-9 font-mono text-sm tracking-wider uppercase"
                placeholder="SR-2026-01"
                value={formData.classCode}
                onChange={(e) => setFormData({ ...formData, classCode: e.target.value })}
              />
              <KeyRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full py-3 mt-2 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 btn-primary"
          >
            {pending ? "Memproses..." : "Buat Akun"} <ArrowRight size={16} />
          </button>
          {(state.message || state.fieldErrors) && (
            <div aria-live="polite" className={`rounded-xl border p-3 text-xs ${state.ok ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>
              {state.message || Object.values(state.fieldErrors ?? {}).flat()[0]}
            </div>
          )}
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            Sudah memiliki akun?{" "}
            <Link href="/login" className="font-bold text-blue-700 hover:underline">
              Masuk di sini
            </Link>
          </p>
          <div className="mt-5 border-t border-gray-100 pt-5"><ProductAttribution centered /></div>
        </div>
      </div>
    </div>
  );
}
