import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  // `template` est redéclaré ici pour que les sous-routes (/deposits/new)
  // conservent le suffixe de marque dans l'onglet.
  title: { default: "Dépôts", template: "%s · VESTIA" },
  description: "Tous les dépôts de la soirée, avec recherche et filtres.",
};

export default function SectionLayout({ children }: { children: ReactNode }) {
  return children;
}
