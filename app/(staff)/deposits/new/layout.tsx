import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Nouveau dépôt",
  description: "Créer un dépôt en trois étapes.",
};

export default function SectionLayout({ children }: { children: ReactNode }) {
  return children;
}
