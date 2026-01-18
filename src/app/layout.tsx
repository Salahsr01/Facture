import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FigmaInvoice - Facturation design-first pour freelances",
  description:
    "Transformez vos designs Figma en factures professionnelles. Paiement intégré, export PDF, gestion simplifiée.",
  keywords: [
    "facturation",
    "freelance",
    "figma",
    "invoice",
    "design",
    "paiement",
  ],
  authors: [{ name: "FigmaInvoice" }],
  openGraph: {
    title: "FigmaInvoice - Facturation design-first",
    description: "Transformez vos designs Figma en factures professionnelles.",
    type: "website",
    locale: "fr_FR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
