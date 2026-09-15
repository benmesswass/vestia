import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Plan du vestiaire",
  description: "Zones, racks et positions en temps réel.",
};

export default function SectionLayout({ children }: { children: ReactNode }) {
  return children;
}
