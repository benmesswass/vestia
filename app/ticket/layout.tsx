import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Votre ticket",
  description: "Le ticket digital de votre dépôt.",
};

export default function SectionLayout({ children }: { children: ReactNode }) {
  return children;
}
