"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Eye,
  EyeOff,
  FileCheck2,
  ShieldCheck,
  Target,
} from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { ProductAttribution } from "@/components/ProductAttribution";
import { loginAction } from "@/app/actions/auth";
import type { ActionResult } from "@/types/auth";

const benefits = [
  {
    icon: FileCheck2,
    title: "Worksheet terstruktur",
    description: "Panduan menulis manuskrip tahap demi tahap.",
  },
  {
    icon: BarChart3,
    title: "Progres yang mudah dipahami",
    description: "Ketahui posisi pekerjaan dan prioritas berikutnya.",
  },
  {
    icon: Target,
    title: "Pendampingan terarah",
    description: "Terima catatan trainer pada bagian yang perlu diperbaiki.",
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [state, formAction, pending] = useActionState(loginAction, {
    ok: false,
  } as ActionResult);
  const errorMessage =
    state.message ?? Object.values(state.fieldErrors ?? {}).flat()[0] ?? null;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F5F7FA] text-[#172033]">
      <div className="relative min-h-screen lg:grid lg:grid-cols-[minmax(0,1.08fr)_minmax(460px,0.92fr)]">
        <section className="relative isolate flex min-h-[320px] flex-col overflow-hidden bg-[#082B5C] px-5 py-5 text-white sm:px-8 sm:py-7 lg:min-h-screen lg:px-12 lg:py-9 xl:px-16">
          <div
            className="pointer-events-none absolute inset-0 -z-10 opacity-80"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(circle at 16% 18%, rgba(11,78,162,.72), transparent 28rem), radial-gradient(circle at 88% 78%, rgba(217,164,65,.17), transparent 24rem), linear-gradient(145deg, #061E43 0%, #082B5C 62%, #073A77 100%)",
            }}
          />
          <div
            className="pointer-events-none absolute -right-24 top-20 -z-10 h-72 w-72 rounded-full border border-white/10"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -right-10 top-36 -z-10 h-48 w-48 rounded-full border border-[#D9A441]/20"
            aria-hidden="true"
          />

          <header className="flex items-center justify-between">
            <BrandMark inverse />
            <Link
              href="/register"
              className="hidden min-h-11 items-center rounded-[10px] border border-white/25 px-4 text-sm font-bold text-white transition hover:border-white/50 hover:bg-white/10 sm:inline-flex"
            >
              Daftar Akun
            </Link>
          </header>

          <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center py-10 lg:py-14">
            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-[#D9A441]/35 bg-[#D9A441]/10 px-3 py-1.5 text-xs font-bold text-[#F4C767] sm:mb-5">
              <ShieldCheck size={15} aria-hidden="true" />
              Digital Workbook untuk peserta dan trainer
            </div>

            <h1 className="max-w-xl text-[32px] font-extrabold leading-[1.14] tracking-[-0.035em] text-white sm:text-[40px] lg:text-[48px]">
              Dari Ide Penelitian Menjadi Manuskrip{" "}
              <span className="text-[#F0B94D]">Siap Submit</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/72 sm:text-base lg:mt-5">
              Susun pekerjaan secara bertahap, pantau kesiapan manuskrip, dan
              tindak lanjuti feedback trainer dalam satu ruang kerja yang fokus.
            </p>

            <div className="mt-8 hidden max-w-xl grid-cols-1 gap-3 sm:grid lg:grid-cols-3">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <div
                    key={benefit.title}
                    className="rounded-2xl border border-white/12 bg-white/[0.065] p-4 backdrop-blur-sm"
                  >
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#D9A441]/14 text-[#F0B94D]">
                      <Icon size={20} aria-hidden="true" />
                    </div>
                    <h2 className="text-sm font-bold text-white">
                      {benefit.title}
                    </h2>
                    <p className="mt-1.5 text-xs leading-5 text-white/62">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-7 hidden max-w-xl items-center gap-3 border-t border-white/10 pt-5 text-xs text-white/58 lg:flex">
              <CheckCircle2
                size={16}
                className="text-emerald-400"
                aria-hidden="true"
              />
              Pekerjaan tersusun rapi dan dapat dilanjutkan kembali sesuai akses
              akun.
            </div>
          </div>

          <footer className="hidden items-center justify-between border-t border-white/10 pt-5 text-[11px] text-white/45 lg:flex">
            <ProductAttribution inverse />
            <span>SCOPUS READY™ Digital Workbook</span>
          </footer>
        </section>

        <main className="flex items-center justify-center px-5 py-8 sm:px-8 sm:py-12 lg:px-12 xl:px-16">
          <div className="w-full max-w-[480px]">
            <div className="rounded-2xl border border-[#E1E7EF] bg-white p-6 shadow-[0_18px_55px_rgba(8,43,92,0.11)] sm:p-8 lg:p-10">
              <div className="mb-7">
                <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#0B4EA2]">
                  Masuk ke ruang kerja
                </p>
                <h2 className="text-[28px] font-extrabold leading-tight tracking-[-0.025em] text-[#172033] sm:text-[30px]">
                  Selamat Datang
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#64748B]">
                  Masuk untuk melanjutkan manuskrip Anda.
                </p>
              </div>

              <form action={formAction} className="space-y-5" noValidate>
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-bold text-[#334155]"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    aria-label="Email Akun"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    aria-invalid={Boolean(errorMessage)}
                    placeholder="nama@institusi.ac.id"
                    className="min-h-12 w-full rounded-[10px] border border-[#CBD5E1] bg-white px-4 text-[15px] text-[#172033] transition placeholder:text-[#94A3B8] hover:border-[#94A3B8] focus:border-[#0B4EA2] focus:outline-none focus:ring-4 focus:ring-[#0B4EA2]/10"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <label
                      htmlFor="password"
                      className="text-sm font-bold text-[#334155]"
                    >
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-xs font-bold text-[#0B4EA2] hover:underline"
                    >
                      Lupa password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      aria-invalid={Boolean(errorMessage)}
                      placeholder="Masukkan password"
                      className="min-h-12 w-full rounded-[10px] border border-[#CBD5E1] bg-white px-4 pr-12 text-[15px] text-[#172033] transition placeholder:text-[#94A3B8] hover:border-[#94A3B8] focus:border-[#0B4EA2] focus:outline-none focus:ring-4 focus:ring-[#0B4EA2]/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-[#64748B] transition hover:bg-[#F1F5F9] hover:text-[#0B4EA2]"
                      aria-label={
                        showPassword
                          ? "Sembunyikan password"
                          : "Tampilkan password"
                      }
                      aria-pressed={showPassword}
                    >
                      {showPassword ? (
                        <EyeOff size={19} aria-hidden="true" />
                      ) : (
                        <Eye size={19} aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                <label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm text-[#64748B]">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    value="true"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-4 w-4 rounded border-[#CBD5E1] accent-[#0B4EA2]"
                  />
                  Ingat saya di perangkat ini
                </label>

                {errorMessage && (
                  <div
                    role="alert"
                    aria-live="polite"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
                  >
                    <span className="font-bold">Tidak dapat masuk.</span>{" "}
                    {errorMessage}
                  </div>
                )}

                <button
                  id="btn-login"
                  type="submit"
                  disabled={pending}
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-[#0B4EA2] px-5 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(11,78,162,0.22)] transition hover:bg-[#083F85] hover:shadow-[0_10px_24px_rgba(11,78,162,0.28)] disabled:cursor-not-allowed disabled:bg-[#94A3B8] disabled:shadow-none"
                >
                  {pending ? (
                    <>
                      <span
                        className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white"
                        aria-hidden="true"
                      />
                      Memproses...
                    </>
                  ) : (
                    <>
                      Masuk
                      <ArrowRight size={18} aria-hidden="true" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-7 border-t border-[#E2E8F0] pt-6 text-center">
                <p className="text-sm text-[#64748B]">
                  Belum memiliki akun?{" "}
                  <Link
                    href="/register"
                    className="font-extrabold text-[#0B4EA2] hover:underline"
                  >
                    Daftar
                  </Link>
                </p>
              </div>
            </div>

            <p className="mt-5 text-center text-xs leading-5 text-[#64748B]">
              Dengan masuk, Anda menggunakan ruang kerja sesuai peran dan hak
              akses akun.
            </p>
            <div className="mt-4 lg:hidden"><ProductAttribution centered /></div>
          </div>
        </main>
      </div>
    </div>
  );
}
