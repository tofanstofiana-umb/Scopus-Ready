import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

// Every route here is either auth-gated (reads cookies via
// createSupabaseServerClient) or reads Supabase config that may not be
// present at build time (e.g. a hosting provider's build step, before env
// vars are configured). Without this, Next.js's static-generation pass can
// throw SupabaseConfigurationError while attempting to prerender a page like
// /admin and fail the entire production build. Forcing dynamic rendering
// means every route always executes at request time instead, the same way
// it already does once deployed — this app has no page that benefits from
// static generation.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "SCOPUS READY™ Digital Workbook",
  applicationName: "SCOPUS READY™ Digital Workbook by Publish-Lab",
  description: "Platform pendamping penulisan artikel ilmiah. Dari Ide Penelitian Menjadi Manuskrip Siap Submit.",
  keywords: "scopus, jurnal internasional, artikel ilmiah, penelitian, manuskrip, workbook",
  authors: [{ name: "Dr. Tofan Stofiana, M.Pd." }],
  creator: "Dr. Tofan Stofiana, M.Pd.",
  publisher: "Publish-Lab",
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
    <html lang="id" data-scroll-behavior="smooth" suppressHydrationWarning>
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
