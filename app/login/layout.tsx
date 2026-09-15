import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Accès au poste vestiaire.",
};

export default function SectionLayout({ children }: { children: ReactNode }) {
  return children;
}
