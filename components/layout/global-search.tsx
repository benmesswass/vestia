"use client";

import { Package, Search, UserRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/cn";
import { formatLocationShort, formatPhone, formatTime } from "@/lib/format";
import { useVestia } from "@/lib/store";

interface Result {
  href: string;
  primary: string;
  secondary: string;
  kind: "deposit" | "customer";
}

/**
 * Recherche globale : numéro de ticket, nom, téléphone ou emplacement.
 * Les résultats sont directs — aucun rechargement de page.
 */
export function GlobalSearch({ className }: { className?: string }) {
  const { state } = useVestia();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const results = useMemo<Result[]>(() => {
    const needle = query.trim().toLowerCase();
    if (needle.length < 1) return [];
    const compact = needle.replace(/[\s-]/g, "");
    const nameById = new Map(
      state.customers.map((customer) => [customer.id, customer]),
    );

    const deposits: Result[] = state.deposits
      .filter((deposit) => {
        const customer = nameById.get(deposit.customerId);
        return (
          deposit.id.toLowerCase().replace("-", "").includes(compact) ||
          customer?.name.toLowerCase().includes(needle) ||
          customer?.phone.includes(compact) ||
          formatLocationShort(deposit.location).toLowerCase().includes(compact)
        );
      })
      .sort((a, b) => (a.depositedAt < b.depositedAt ? 1 : -1))
      .slice(0, 5)
      .map((deposit) => ({
        href: `/deposits/${deposit.id}`,
        primary: deposit.id,
        secondary: `${nameById.get(deposit.customerId)?.name ?? "Client"} · ${formatLocationShort(deposit.location)} · ${formatTime(deposit.depositedAt)}`,
        kind: "deposit" as const,
      }));

    const customers: Result[] = state.customers
      .filter(
        (customer) =>
          customer.name.toLowerCase().includes(needle) ||
          customer.phone.includes(compact),
      )
      .slice(0, 3)
      .map((customer) => ({
        href: `/customers/${customer.id}`,
        primary: customer.name,
        secondary: formatPhone(customer.phone),
        kind: "customer" as const,
      }));

    return [...deposits, ...customers];
  }, [query, state.customers, state.deposits]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Search
        size={15}
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-faint"
      />
      <input
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Rechercher un ticket, un client, un emplacement…"
        aria-label="Recherche globale"
        className={cn(
          "h-9 w-full rounded-[10px] border border-line bg-subtle pr-3 pl-9 text-[13px] text-ink",
          "placeholder:text-faint transition-colors duration-150",
          "hover:border-line-strong focus:border-accent focus:bg-surface focus:ring-4 focus:ring-accent/12 focus:outline-none",
        )}
      />

      {open && query.trim().length > 0 && (
        <div className="animate-scale-in absolute top-11 right-0 left-0 z-50 overflow-hidden rounded-xl border border-line bg-surface shadow-lg">
          {results.length === 0 ? (
            <p className="px-4 py-5 text-center text-[13px] text-muted">
              Aucun résultat pour « {query.trim()} »
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {results.map((result) => (
                <li key={`${result.kind}-${result.href}`}>
                  <Link
                    href={result.href}
                    onClick={() => {
                      setOpen(false);
                      setQuery("");
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 transition-colors duration-150 hover:bg-subtle"
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-line bg-subtle text-faint">
                      {result.kind === "deposit" ? (
                        <Package size={14} />
                      ) : (
                        <UserRound size={14} />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-semibold text-ink">
                        {result.primary}
                      </span>
                      <span className="block truncate text-[12px] text-muted">
                        {result.secondary}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
