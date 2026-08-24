"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Eye, 
  EyeOff, 
  BookOpen, 
  ArrowRight, 
  Star, 
  Sparkles, 
  CheckCircle2, 
  Award, 
  Users, 
  FileText,
  Compass
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"peserta" | "trainer" | "admin">("peserta");
  const [email, setEmail] = useState("tofan@university.ac.id");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [classCode, setClassCode] = useState("");

  const handleRoleChange = (selectedRole: "peserta" | "trainer" | "admin") => {
    setRole(selectedRole);
    if (selectedRole === "peserta") {
      setEmail("tofan@university.ac.id");
      setPassword("password123");
    } else if (selectedRole === "trainer") {
      setEmail("trainer@scopusready.id");
      setPassword("trainer2026");
    } else if (selectedRole === "admin") {
      setEmail("admin@scopusready.id");
      setPassword("admin2026");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    
    if (role === "trainer") {
      router.push("/trainer");
    } else if (role === "admin") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
  };

  const handleDirectDemoLogin = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    if (role === "trainer") {
      router.push("/trainer");
    } else if (role === "admin") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col lg:flex-row"
      style={{ 
        background: "linear-gradient(135deg, #061B3B 0%, #082B5C 40%, #0B4EA2 100%)",
        color: "#FFFFFF"
      }}
    >
      {/* LEFT BRANDING HERO SECTION */}
      <div className="hidden lg:flex lg:w-7/12 flex-col justify-between p-12 xl:p-16 relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(217, 164, 65, 0.12)" }} />
        <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(11, 78, 162, 0.35)" }} />
        <div className="absolute -bottom-32 left-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(217, 164, 65, 0.08)" }} />

        {/* Top: Logo Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3.5">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ 
                background: "linear-gradient(135deg, #D9A441 0%, #B88225 100%)",
                boxShadow: "0 8px 24px rgba(217, 164, 65, 0.35)"
              }}
            >
              <BookOpen size={24} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold tracking-tight" style={{ color: "#FFFFFF" }}>
                  SCOPUS<span style={{ color: "#D9A441" }}>READY</span>
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider" style={{ background: "rgba(217,164,65,0.2)", color: "#D9A441", border: "1px solid rgba(217,164,65,0.4)" }}>
                  v2.0
                </span>
              </div>
              <div className="text-xs text-white/60 font-medium tracking-wide">
                Digital Manuscript Accelerator & Workbook
              </div>
            </div>
          </div>
        </div>

        {/* Center: Main Value Proposition */}
        <div className="relative z-10 py-8 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
            <Sparkles size={14} style={{ color: "#D9A441" }} />
            <span>Pendampingan Sistematis Menuju Publikasi Q1–Q4</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight tracking-tight">
            Dari Ide Penelitian <br />
            <span style={{ color: "#D9A441" }}>Menjadi Manuskrip Siap Submit</span>
          </h1>

          <p className="text-base xl:text-lg text-white/75 leading-relaxed max-w-xl">
            Framework bertahap 8 modul terstruktur, kalkulator skor kesiapan Scopus, 
            pencarian jurnal target presisi, serta pendampingan langsung oleh trainer berpengalaman.
          </p>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-2 gap-3.5 pt-2 max-w-xl">
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="p-2 rounded-lg" style={{ background: "rgba(217,164,65,0.15)", color: "#D9A441" }}>
                <FileText size={18} />
              </div>
              <div>
                <div className="text-sm font-bold text-white">8 Modul Interaktif</div>
                <div className="text-xs text-white/60">Panduan step-by-step IMRaD</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="p-2 rounded-lg" style={{ background: "rgba(16,185,129,0.15)", color: "#10B981" }}>
                <Award size={18} />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Scopus Index Score</div>
                <div className="text-xs text-white/60">Audit kesiapan 5 dimensi</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="p-2 rounded-lg" style={{ background: "rgba(59,130,246,0.15)", color: "#60A5FA" }}>
                <Compass size={18} />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Target Journal Match</div>
                <div className="text-xs text-white/60">Database Q1–Q4 & SJR Index</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="p-2 rounded-lg" style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B" }}>
                <Users size={18} />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Feedback Mentor</div>
                <div className="text-xs text-white/60">Review rubrik & perbaikan</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Testimonial Quote */}
        <div 
          className="relative z-10 p-5 rounded-2xl max-w-xl"
          style={{ 
            background: "rgba(255, 255, 255, 0.05)", 
            border: "1px solid rgba(255, 255, 255, 0.12)",
            backdropFilter: "blur(8px)"
          }}
        >
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} size={14} fill="#D9A441" color="#D9A441" />
            ))}
            <span className="text-xs text-white/70 ml-2 font-medium">Testimoni Peserta Cohort</span>
          </div>
          <p className="text-white/85 text-xs xl:text-sm leading-relaxed italic mb-3">
            &ldquo;Platform ScopusReady sangat terarah. Dari menyusun state-of-the-art sampai response letter, 
            semua modulnya konkret. Manuskrip saya diterima di jurnal Q2 dalam 4 bulan.&rdquo;
          </p>
          <div className="flex items-center justify-between text-xs text-white/60">
            <span className="font-semibold text-white/90">Dr. Rina Pratiwi, M.Kom.</span>
            <span>Universitas Gadjah Mada</span>
          </div>
        </div>
      </div>

      {/* RIGHT AUTH PANEL */}
      <div 
        className="w-full lg:w-5/12 flex items-center justify-center p-6 sm:p-10 lg:p-12"
        style={{ background: "#F4F6F8" }}
      >
        <div className="w-full max-w-md">
          {/* Mobile Header Logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-6">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "#082B5C" }}
            >
              <BookOpen size={20} style={{ color: "#D9A441" }} />
            </div>
            <div>
              <div className="text-xl font-black text-gray-900 tracking-tight">
                SCOPUS<span style={{ color: "#D9A441" }}>READY</span>
              </div>
              <div className="text-xs text-gray-500 font-medium">Digital Workbook</div>
            </div>
          </div>

          {/* Main Login Card */}
          <div 
            className="bg-white rounded-3xl p-7 sm:p-9 shadow-xl border border-gray-100"
            style={{ boxShadow: "0 20px 40px -12px rgba(8, 43, 92, 0.1)" }}
          >
            {/* Card Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                Selamat Datang
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Masuk untuk mengakses lembar kerja manuskrip Anda
              </p>
            </div>

            {/* Role Switcher (Demo selector) */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Pilih Peran Akun (Demo)
                </label>
                <span className="text-[11px] text-blue-600 font-medium">Klik untuk ganti mode</span>
              </div>

              <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleRoleChange("peserta")}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all text-center ${
                    role === "peserta"
                      ? "bg-white text-[#082B5C] shadow-sm border border-gray-200/60"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  🎓 Peserta
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleChange("trainer")}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all text-center ${
                    role === "trainer"
                      ? "bg-white text-[#082B5C] shadow-sm border border-gray-200/60"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  👨‍🏫 Trainer
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleChange("admin")}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all text-center ${
                    role === "admin"
                      ? "bg-white text-[#082B5C] shadow-sm border border-gray-200/60"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  ⚙️ Admin
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Email Institusi / Akun
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0B4EA2] focus:border-transparent transition-all bg-gray-50/50 hover:bg-white"
                  placeholder="nama@institusi.ac.id"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Password
                  </label>
                  <Link 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); alert("Untuk demo, gunakan password default atau langsung klik tombol Masuk."); }}
                    className="text-xs font-semibold text-[#0B4EA2] hover:underline"
                  >
                    Lupa Password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0B4EA2] focus:border-transparent transition-all bg-gray-50/50 hover:bg-white"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-[#0B4EA2] focus:ring-[#0B4EA2] w-4 h-4" 
                  />
                  <span>Ingat sesi saya</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                id="btn-login"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg disabled:opacity-75"
                style={{
                  background: loading 
                    ? "#6B7280" 
                    : "linear-gradient(135deg, #082B5C 0%, #0B4EA2 100%)",
                }}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Memproses...</span>
                  </div>
                ) : (
                  <>
                    <span>Masuk ke Akun {role === "peserta" ? "Peserta" : role === "trainer" ? "Trainer" : "Admin"}</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>

              {/* Quick Direct Demo Button */}
              <button
                type="button"
                onClick={handleDirectDemoLogin}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles size={14} className="text-[#D9A441]" />
                <span>Masuk Langsung (1-Click Demo)</span>
              </button>
            </form>

            {/* Bottom links */}
            <div className="mt-6 pt-5 border-t border-gray-100 text-center space-y-3">
              <p className="text-xs text-gray-500">
                Belum terdaftar di program?{" "}
                <Link href="/register" className="font-bold text-[#0B4EA2] hover:underline">
                  Daftar Sekarang
                </Link>
              </p>

              {/* Class code input */}
              <div className="pt-2">
                <div className="flex items-center gap-2">
                  <input
                    id="class-code"
                    type="text"
                    value={classCode}
                    onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                    placeholder="Kode Kelas (cth: SR-2026-01)"
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-gray-200 font-mono text-center uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-[#0B4EA2]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!classCode) alert("Silakan masukkan kode kelas terlebih dahulu.");
                      else {
                        alert(`Kode kelas ${classCode} valid! Anda akan diarahkan ke pendaftaran cohort.`);
                        router.push("/register");
                      }
                    }}
                    className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all"
                  >
                    Gabung
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Copyright */}
          <div className="text-center text-xs text-gray-400 mt-6">
            © 2026 SCOPUS READY™. Hak Cipta Dilindungi.
          </div>
        </div>
      </div>
    </div>
  );
}
