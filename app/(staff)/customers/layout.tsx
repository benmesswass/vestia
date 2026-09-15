import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Clients",
  description: "Les clients du vestiaire et leur historique.",
};

export default function SectionLayout({ children }: { children: ReactNode }) {
  return children;
}
