"use client";

import { Search, Star, UserRound } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/field";
import { EmptyState, PageHeader } from "@/components/ui/states";
import { formatDateTime, formatPhone, initials } from "@/lib/format";
import { useVestia } from "@/lib/store";
import { customerStats } from "@/lib/stats";

export default function CustomersPage() {
  const { state } = useVestia();
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const compact = needle.replace(/[\s-]/g, "");
    return customerStats(state.customers, state.deposits).filter((row) => {
      if (needle.length === 0) return true;
      return (
        row.customer.name.toLowerCase().includes(needle) ||
        row.customer.phone.includes(compact)
      );
    });
  }, [state.customers, state.deposits, query]);

  const withActive = rows.filter((row) => row.hasActive).length;

  return (
    <>
      <PageHeader
        title="Clients"
        subtitle={`${state.customers.length} clients ce soir · ${withActive} ont encore des affaires au vestiaire`}
      />

      <div className="mb-4">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher un client par nom ou téléphone…"
          aria-label="Rechercher un client"
          icon={<Search size={15} />}
          className="max-w-md"
        />
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={<UserRound size={20} />}
          title="Aucun client trouvé"
          description={`Rien ne correspond à « ${query.trim()} ».`}
        />
      ) : (
        <>
          {/* Tableau — desktop */}
          <Card padded={false} className="hidden overflow-hidden md:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-line bg-subtle">
                  {["Client", "Téléphone", "Dépôts", "Dernier dépôt", "Statut"].map(
                    (header) => (
                      <th
                        key={header}
                        scope="col"
                        className="px-4 py-2.5 text-[11px] font-semibold tracking-wide text-faint uppercase"
                      >
                        {header}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={row.customer.id}
                    className="stagger border-b border-line transition-colors duration-150 last:border-0 hover:bg-subtle"
                    style={{ "--d": `${Math.min(index, 12) * 20}ms` } as CSSProperties}
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/customers/${row.customer.id}`}
                        className="flex items-center gap-2.5"
                      >
                        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-[11.5px] font-semibold text-accent">
                          {initials(row.customer.name)}
                        </span>
                        <span>
                          <span className="block text-[13.5px] font-medium text-ink hover:text-accent">
                            {row.customer.name}
                          </span>
                          {row.customer.vip && (
                            <span className="flex items-center gap-1 text-[11.5px] text-warn">
                              <Star size={11} />
                              Client fidèle
                            </span>
                          )}
                        </span>
                      </Link>
                    </td>
                    <td className="tabular px-4 py-3 text-[13px] text-muted">
                      {formatPhone(row.customer.phone)}
                    </td>
                    <td className="tabular px-4 py-3 text-[13px] text-ink">
                      {row.depositCount}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-muted">
                      {row.lastDepositAt ? formatDateTime(row.lastDepositAt) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={row.hasActive ? "accent" : "neutral"} dot>
                        {row.hasActive ? "Au vestiaire" : "Rendu"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Cartes — mobile */}
          <ul className="space-y-2 md:hidden">
            {rows.map((row, index) => (
              <li
                key={row.customer.id}
                className="stagger"
                style={{ "--d": `${Math.min(index, 12) * 25}ms` } as CSSProperties}
              >
                <Link href={`/customers/${row.customer.id}`}>
                  <Card interactive className="flex items-center gap-3 p-3.5">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-[13px] font-semibold text-accent">
                      {initials(row.customer.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-medium text-ink">
                        {row.customer.name}
                      </p>
                      <p className="tabular truncate text-[12.5px] text-muted">
                        {formatPhone(row.customer.phone)} · {row.depositCount} dépôt
                        {row.depositCount > 1 ? "s" : ""}
                      </p>
                    </div>
                    <Badge tone={row.hasActive ? "accent" : "neutral"} dot>
                      {row.hasActive ? "Au vestiaire" : "Rendu"}
                    </Badge>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
