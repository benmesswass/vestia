import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Analytics",
  description: "Affluence, occupation et durées de garde.",
};

export default function SectionLayout({ children }: { children: ReactNode }) {
  return children;
}
