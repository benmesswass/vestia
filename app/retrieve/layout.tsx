import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Retirer mes affaires",
  description: "Confirmer le retrait de votre dépôt.",
};

export default function SectionLayout({ children }: { children: ReactNode }) {
  return children;
}
