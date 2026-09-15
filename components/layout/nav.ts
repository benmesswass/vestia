import {
  ChartColumn,
  House,
  Package,
  PackagePlus,
  ScanLine,
  Settings,
  TriangleAlert,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** N'est actif que sur l'URL exacte. */
  exact?: boolean;
  /** Routes qui appartiennent à une autre entrée du menu. */
  exclude?: string[];
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Accueil", icon: House },
  { href: "/deposits/new", label: "Déposer", icon: PackagePlus, exact: true },
  { href: "/scan", label: "Scanner", icon: ScanLine },
  {
    href: "/deposits",
    label: "Dépôts",
    icon: Package,
    exclude: ["/deposits/new"],
  },
  { href: "/customers", label: "Clients", icon: Users },
  { href: "/analytics", label: "Analytics", icon: ChartColumn },
  { href: "/incidents", label: "Incidents", icon: TriangleAlert },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

export function isNavActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  if (
    item.exclude?.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    )
  ) {
    return false;
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
