import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Paramètres",
  description: "Configuration du vestiaire et des envois de tickets.",
};

export default function SectionLayout({ children }: { children: ReactNode }) {
  return children;
}
