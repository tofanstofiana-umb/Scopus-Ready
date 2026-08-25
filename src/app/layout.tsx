import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "SCOPUS READY™ Digital Workbook",
  description: "Platform pendamping penulisan artikel ilmiah. Dari Ide Penelitian Menjadi Manuskrip Siap Submit.",
  keywords: "scopus, jurnal internasional, artikel ilmiah, penelitian, manuskrip, workbook",
  authors: [{ name: "SCOPUS READY™" }],
  openGraph: {
    title: "SCOPUS READY™ Digital Workbook",
    description: "Dari Ide Penelitian Menjadi Manuskrip Siap Submit",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {process.env.NODE_ENV === "development" && (
          <Script
            id="browser-extension-hydration-guard"
            src="/browser-extension-hydration-guard.js"
            strategy="beforeInteractive"
          />
        )}
        {children}
      </body>
    </html>
  );
}
