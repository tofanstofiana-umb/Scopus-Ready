"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="id">
      <body style={{ margin: 0, fontFamily: "Arial, sans-serif", background: "#f5f7fb", color: "#172033" }}>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
          <div style={{ maxWidth: 480, border: "1px solid #e2e8f0", borderRadius: 16, background: "white", padding: 32, textAlign: "center" }}>
            <h1 style={{ color: "#082b5c" }}>Aplikasi Mengalami Kendala</h1>
            <p>Silakan coba memuat ulang aplikasi. Data yang sudah berhasil disimpan tetap berada di database.</p>
            <button type="button" onClick={reset} style={{ border: 0, borderRadius: 10, background: "#0b4ea2", color: "white", padding: "12px 18px", fontWeight: 700, cursor: "pointer" }}>Muat Ulang</button>
          </div>
        </main>
      </body>
    </html>
  );
}
