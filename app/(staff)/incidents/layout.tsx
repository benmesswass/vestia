import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Incidents",
  description: "Tickets perdus, objets et emplacements à traiter.",
};

export default function SectionLayout({ children }: { children: ReactNode }) {
  return children;
}
