"use client";

import { LogOut, Menu, PackagePlus, ScanLine, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { Logo, LogoMark } from "@/components/brand/logo";
import { GlobalSearch } from "@/components/layout/global-search";
import { NAV_ITEMS, isNavActive } from "@/components/layout/nav";
import { cn } from "@/lib/cn";
import { DEMO_NOW, demoNow, formatTime } from "@/lib/format";
import { useVestia } from "@/lib/store";
import { STAFF } from "@/lib/demo-data";

function DemoClock() {
  const [time, setTime] = useState(() => formatTime(DEMO_NOW));

  useEffect(() => {
    const update = () => setTime(formatTime(demoNow()));
    update();
    const timer = window.setInterval(update, 20_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <span className="tabular text-[13px] font-medium text-muted">{time}</span>
  );
}

function VenueCard() {
  const { venue } = useVestia();
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
      <p className="text-[10px] font-semibold tracking-[0.12em] text-white/40 uppercase">
        Établissement
      </p>
      <p className="mt-1 truncate text-[13px] font-semibold text-white">
        {venue.name}
      </p>
      <p className="mt-0.5 truncate text-[11px] text-white/45">
        {venue.type} · {venue.city}
      </p>
    </div>
  );
}

function UserCard({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-2.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/10 text-[12px] font-semibold text-white">
        {STAFF.initials}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-medium text-white">
          {STAFF.name}
        </span>
        <span className="block truncate text-[11px] text-white/45">
          {STAFF.role}
        </span>
      </span>
      <Link
        href="/login"
        onClick={onNavigate}
        aria-label="Se déconnecter"
        title="Se déconnecter"
        className="press grid size-8 shrink-0 place-items-center rounded-lg text-white/45 hover:bg-white/10 hover:text-white"
      >
        <LogOut size={15} />
      </Link>
    </div>
  );
}

function NavList({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-0.5">
      {NAV_ITEMS.map((item) => {
        const active = isNavActive(pathname, item);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "press flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13.5px] font-medium",
              active
                ? "bg-accent text-white shadow-xs"
                : "text-white/60 hover:bg-white/8 hover:text-white",
            )}
          >
            <Icon size={17} strokeWidth={2} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Le tiroir se referme depuis les liens qu'il contient, jamais en réaction
  // à un changement de route (ce qui déclencherait un rendu en cascade).
  const closeDrawer = () => setDrawerOpen(false);

  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  return (
    <div className="min-h-dvh">
      {/* Barre latérale — desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col gap-5 bg-navy p-4 lg:flex">
        <Link href="/dashboard" className="px-1 pt-1">
          <Logo tone="light" subtitle="Vestiaire digital" />
        </Link>
        <VenueCard />
        <div className="flex-1 overflow-y-auto">
          <NavList pathname={pathname} />
        </div>
        <UserCard />
      </aside>

      {/* Rail compact — tablette */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[72px] flex-col items-center gap-4 bg-navy py-4 md:flex lg:hidden">
        <Link href="/dashboard" aria-label="VESTIA">
          <LogoMark size={36} />
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isNavActive(pathname, item);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "press grid size-11 place-items-center rounded-[10px]",
                  active
                    ? "bg-accent text-white"
                    : "text-white/55 hover:bg-white/8 hover:text-white",
                )}
              >
                <Icon size={19} strokeWidth={2} />
              </Link>
            );
          })}
        </nav>
        <Link
          href="/login"
          aria-label="Se déconnecter"
          title="Se déconnecter"
          className="press grid size-10 place-items-center rounded-[10px] text-white/45 hover:bg-white/10 hover:text-white"
        >
          <LogOut size={17} />
        </Link>
      </aside>

      {/* Tiroir — mobile */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[90] md:hidden">
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setDrawerOpen(false)}
            className="animate-fade absolute inset-0 cursor-default bg-navy/45"
          />
          <div className="animate-slide-in absolute inset-y-0 left-0 flex w-[82%] max-w-xs flex-col gap-5 bg-navy p-4">
            <div className="flex items-center justify-between">
              <Logo tone="light" />
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Fermer le menu"
                className="press grid size-9 place-items-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            <VenueCard />
            <div className="flex-1 overflow-y-auto">
              <NavList pathname={pathname} onNavigate={closeDrawer} />
            </div>
            <UserCard onNavigate={closeDrawer} />
          </div>
        </div>
      )}

      <div className="md:pl-[72px] lg:pl-64">
        {/* Barre supérieure */}
        <header className="sticky top-0 z-30 border-b border-line bg-surface/85 backdrop-blur-md">
          <div className="flex h-14 items-center gap-3 px-4 sm:h-16 sm:px-6">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Ouvrir le menu"
              className="press grid size-9 shrink-0 place-items-center rounded-lg border border-line text-muted hover:bg-subtle hover:text-ink md:hidden"
            >
              <Menu size={18} />
            </button>

            <Link href="/dashboard" className="md:hidden" aria-label="VESTIA">
              <LogoMark size={32} />
            </Link>

            <GlobalSearch className="ml-auto hidden w-full max-w-md sm:block md:ml-0" />

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <span className="hidden items-center gap-2 rounded-full border border-line bg-subtle px-3 py-1.5 sm:flex">
                <span className="size-1.5 rounded-full bg-positive" aria-hidden />
                <span className="text-[12px] font-medium text-muted">
                  Service ouvert
                </span>
                <DemoClock />
              </span>
              <Link
                href="/scan"
                aria-label="Scanner un ticket"
                title="Scanner un ticket"
                className="press grid size-9 place-items-center rounded-[10px] border border-line text-muted hover:bg-subtle hover:text-ink lg:hidden"
              >
                <ScanLine size={17} />
              </Link>
              <Link
                href="/deposits/new"
                className="press hidden items-center gap-2 rounded-[10px] bg-accent px-3.5 py-2 text-[13px] font-medium text-white hover:bg-accent-hover lg:inline-flex"
              >
                <PackagePlus size={16} />
                Nouveau dépôt
              </Link>
            </div>
          </div>

          <div className="border-t border-line px-4 py-2 sm:hidden">
            <GlobalSearch />
          </div>
        </header>

        <main className="px-4 pt-5 pb-28 sm:px-6 sm:pt-6 md:pb-10">
          {children}
        </main>
      </div>

      {/* Barre d'onglets — mobile */}
      <MobileTabBar pathname={pathname} onMore={() => setDrawerOpen(true)} />
    </div>
  );
}

function MobileTabBar({
  pathname,
  onMore,
}: {
  pathname: string;
  onMore: () => void;
}) {
  const items = NAV_ITEMS.filter((item) =>
    ["/dashboard", "/deposits", "/scan"].includes(item.href),
  );

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur-md md:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5 items-end px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {items.slice(0, 2).map((item) => (
          <TabLink key={item.href} item={item} pathname={pathname} />
        ))}

        <Link
          href="/deposits/new"
          aria-label="Nouveau dépôt"
          className="press mx-auto -mt-5 grid size-12 place-items-center rounded-2xl bg-accent text-white shadow-md"
        >
          <PackagePlus size={22} />
        </Link>

        {items.slice(2).map((item) => (
          <TabLink key={item.href} item={item} pathname={pathname} />
        ))}

        <button
          type="button"
          onClick={onMore}
          className="press flex flex-col items-center gap-1 rounded-lg py-1.5 text-faint"
        >
          <Menu size={19} />
          <span className="text-[10.5px] font-medium">Menu</span>
        </button>
      </div>
    </nav>
  );
}

function TabLink({
  item,
  pathname,
}: {
  item: (typeof NAV_ITEMS)[number];
  pathname: string;
}) {
  const active = isNavActive(pathname, item);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "press flex flex-col items-center gap-1 rounded-lg py-1.5",
        active ? "text-accent" : "text-faint",
      )}
    >
      <Icon size={19} strokeWidth={active ? 2.3 : 2} />
      <span className="text-[10.5px] font-medium">{item.label}</span>
    </Link>
  );
}
