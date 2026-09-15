import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { Providers } from "@/app/providers";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "VESTIA — Le vestiaire digital",
    template: "%s · VESTIA",
  },
  description:
    "VESTIA remplace les tickets papier par un vestiaire digital : dépôt en 15 secondes, QR code client, restitution scannée et pilotage en temps réel.",
  applicationName: "VESTIA",
};

export const viewport: Viewport = {
  themeColor: "#0a1a33",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
