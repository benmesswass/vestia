import { Briefcase, HardHat, Package, Shirt, ShoppingBag, Umbrella } from "lucide-react";

import type { ItemKind } from "@/lib/types";

const ICONS: Record<ItemKind, typeof Shirt> = {
  coat: Shirt,
  jacket: Briefcase,
  bag: ShoppingBag,
  helmet: HardHat,
  umbrella: Umbrella,
  other: Package,
};

export const ITEM_KIND_LABELS: Record<ItemKind, string> = {
  coat: "Manteau",
  jacket: "Veste",
  bag: "Sac",
  helmet: "Casque",
  umbrella: "Parapluie",
  other: "Autre",
};

export function ItemIcon({
  kind,
  size = 16,
  className,
}: {
  kind: ItemKind;
  size?: number;
  className?: string;
}) {
  const Icon = ICONS[kind] ?? Package;
  return <Icon size={size} className={className} aria-hidden />;
}
