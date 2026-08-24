import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

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
    <html lang="id" className={`${plusJakarta.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

