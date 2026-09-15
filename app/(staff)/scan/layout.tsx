import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Scanner",
  description: "Scanner un ticket et restituer les affaires.",
};

export default function SectionLayout({ children }: { children: ReactNode }) {
  return children;
}
