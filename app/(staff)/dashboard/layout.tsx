import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Tableau de bord",
  description: "Vue d'ensemble de la soirée : dépôts, occupation et incidents.",
};

export default function SectionLayout({ children }: { children: ReactNode }) {
  return children;
}
