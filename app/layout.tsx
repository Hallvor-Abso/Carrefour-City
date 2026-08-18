import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Procédures · Carrefour City",
    template: "%s · Procédures Carrefour City",
  },
  description: "Les procédures internes du magasin, accessibles depuis le comptoir ou la réserve.",
  // Site interne : on ne veut pas le voir remonter dans les moteurs de recherche.
  robots: { index: false, follow: false },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0050a0",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
