"use client";

import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";

import { ItemIcon } from "@/components/domain/item-icon";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { cn } from "@/lib/cn";
import { formatLocationShort, formatTime } from "@/lib/format";
import type { Customer, Deposit } from "@/lib/types";

export function DepositsTable({
  deposits,
  customers,
  pageSize = 12,
  onReturn,
  emptyTitle = "Aucun dépôt",
  emptyDescription = "Aucun dépôt ne correspond à cette recherche.",
}: {
  deposits: Deposit[];
  customers: Customer[];
  pageSize?: number;
  onReturn?: (deposit: Deposit) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  const [page, setPage] = useState(0);
  const nameById = useMemo(
    () => new Map(customers.map((customer) => [customer.id, customer])),
    [customers],
  );

  const pageCount = Math.max(1, Math.ceil(deposits.length / pageSize));
  // La liste peut rétrécir (filtre, recherche) : la page affichée est dérivée,
  // jamais corrigée après coup.
  const currentPage = Math.min(page, pageCount - 1);
  const visible = deposits.slice(
    currentPage * pageSize,
    currentPage * pageSize + pageSize,
  );

  if (deposits.length === 0) {
    return (
      <EmptyState
        icon={<Inbox size={20} />}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className="space-y-3">
      {/* Tableau — à partir de la tablette */}
      <div className="hidden overflow-hidden rounded-card border border-line bg-surface shadow-xs md:block">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-line bg-subtle">
              {["Ticket", "Client", "Objets", "Emplacement", "Heure", "Statut", ""].map(
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
            {visible.map((deposit, index) => {
              const customer = nameById.get(deposit.customerId);
              return (
                <tr
                  key={deposit.id}
                  className="stagger border-b border-line transition-colors duration-150 last:border-0 hover:bg-subtle"
                  style={{ "--d": `${Math.min(index, 10) * 25}ms` } as CSSProperties}
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/deposits/${deposit.id}`}
                      className="tabular text-[13px] font-semibold text-accent hover:underline"
                    >
                      {deposit.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="block text-[13px] font-medium text-ink">
                      {customer?.name ?? "Client"}
                    </span>
                    {customer?.vip && (
                      <span className="text-[11px] text-warn">Client fidèle</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex flex-wrap items-center gap-1.5">
                      {deposit.items.map((item) => (
                        <span
                          key={item.label}
                          title={item.label}
                          className="inline-flex items-center gap-1 rounded-md border border-line bg-subtle px-1.5 py-0.5 text-[11.5px] text-muted"
                        >
                          <ItemIcon kind={item.kind} size={12} />
                          {item.label}
                        </span>
                      ))}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="tabular text-[13px] text-ink">
                      {formatLocationShort(deposit.location)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="tabular text-[13px] text-ink">
                      {formatTime(deposit.depositedAt)}
                    </span>
                    {deposit.returnedAt && (
                      <span className="tabular block text-[11.5px] text-faint">
                        rendu {formatTime(deposit.returnedAt)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={deposit.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {deposit.status !== "returned" && onReturn && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onReturn(deposit)}
                      >
                        Restituer
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cartes — mobile */}
      <ul className="space-y-2 md:hidden">
        {visible.map((deposit, index) => {
          const customer = nameById.get(deposit.customerId);
          return (
            <li
              key={deposit.id}
              className="stagger rounded-card border border-line bg-surface p-3.5 shadow-xs"
              style={{ "--d": `${Math.min(index, 10) * 30}ms` } as CSSProperties}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/deposits/${deposit.id}`}
                    className="tabular text-[14px] font-semibold text-accent"
                  >
                    {deposit.id}
                  </Link>
                  <p className="mt-0.5 truncate text-[13px] font-medium text-ink">
                    {customer?.name ?? "Client"}
                  </p>
                </div>
                <StatusBadge status={deposit.status} />
              </div>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {deposit.items.map((item) => (
                  <span
                    key={item.label}
                    className="inline-flex items-center gap-1 rounded-md border border-line bg-subtle px-1.5 py-0.5 text-[11.5px] text-muted"
                  >
                    <ItemIcon kind={item.kind} size={12} />
                    {item.label}
                  </span>
                ))}
              </div>

              <div className="mt-2.5 flex items-center justify-between gap-3 border-t border-line pt-2.5">
                <span className="tabular text-[12px] text-muted">
                  {formatLocationShort(deposit.location)} ·{" "}
                  {formatTime(deposit.depositedAt)}
                </span>
                {deposit.status !== "returned" && onReturn && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onReturn(deposit)}
                  >
                    Restituer
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {pageCount > 1 && (
        <div className="flex items-center justify-between gap-3 px-1">
          <p className="text-[12.5px] text-muted">
            <span className="tabular">{currentPage * pageSize + 1}</span>–
            <span className="tabular">
              {Math.min((currentPage + 1) * pageSize, deposits.length)}
            </span>{" "}
            sur <span className="tabular">{deposits.length}</span> dépôts
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              aria-label="Page précédente"
              className={cn(
                "press grid size-8 place-items-center rounded-lg border border-line text-muted",
                "hover:bg-subtle hover:text-ink disabled:opacity-40 disabled:hover:bg-transparent",
              )}
            >
              <ChevronLeft size={16} />
            </button>
            <span className="tabular px-2 text-[12.5px] text-muted">
              {currentPage + 1} / {pageCount}
            </span>
            <button
              type="button"
              onClick={() =>
                setPage(Math.min(pageCount - 1, currentPage + 1))
              }
              disabled={currentPage >= pageCount - 1}
              aria-label="Page suivante"
              className={cn(
                "press grid size-8 place-items-center rounded-lg border border-line text-muted",
                "hover:bg-subtle hover:text-ink disabled:opacity-40 disabled:hover:bg-transparent",
              )}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
