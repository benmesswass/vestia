"use client";

import { ArrowUpRight, MapPin } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { ItemIcon } from "@/components/domain/item-icon";
import { StatusBadge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { buildGrid, type GridPosition } from "@/lib/cloakroom";
import { formatTime } from "@/lib/format";
import { useVestia } from "@/lib/store";

function Legend() {
  const entries = [
    { label: "Disponible", className: "border-line-strong bg-surface" },
    { label: "Occupé", className: "border-accent bg-accent" },
    { label: "Incident", className: "border-danger bg-danger" },
    { label: "Sélectionné", className: "border-navy bg-navy" },
  ];
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {entries.map((entry) => (
        <li key={entry.label} className="flex items-center gap-1.5">
          <span
            className={cn("size-3 rounded-[4px] border", entry.className)}
            aria-hidden
          />
          <span className="text-[12px] text-muted">{entry.label}</span>
        </li>
      ))}
    </ul>
  );
}

export function CloakroomMap({
  highlight,
  showLegend = true,
  className,
}: {
  /** Identifiant de dépôt à mettre en avant à l'ouverture. */
  highlight?: string;
  showLegend?: boolean;
  className?: string;
}) {
  const { state, venue } = useVestia();
  const grid = useMemo(
    () => buildGrid(venue, state.deposits),
    [venue, state.deposits],
  );

  const highlightKey = useMemo(() => {
    if (!highlight) return null;
    const deposit = state.deposits.find((item) => item.id === highlight);
    if (!deposit) return null;
    const { zone, rack, position } = deposit.location;
    return `${zone}-${rack}-${position}`;
  }, [highlight, state.deposits]);

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const activeKey = selectedKey ?? highlightKey;

  const selectedPosition = useMemo<GridPosition | null>(() => {
    if (!activeKey) return null;
    for (const zone of grid) {
      for (const rack of zone.racks) {
        const found = rack.positions.find((item) => item.key === activeKey);
        if (found) return found;
      }
    }
    return null;
  }, [activeKey, grid]);

  const selectedDeposit = selectedPosition?.depositId
    ? state.deposits.find((item) => item.id === selectedPosition.depositId)
    : undefined;
  const selectedCustomer = selectedDeposit
    ? state.customers.find((item) => item.id === selectedDeposit.customerId)
    : undefined;

  return (
    <div className={cn("space-y-4", className)}>
      {showLegend && <Legend />}

      <div className="space-y-4">
        {grid.map((zone) => (
          <div
            key={zone.id}
            className="rounded-xl border border-line bg-subtle/60 p-3"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-lg bg-navy text-[12px] font-semibold text-white">
                  {zone.id}
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-ink">
                    Zone {zone.id}
                  </p>
                  <p className="text-[11.5px] text-muted">{zone.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="tabular text-[12px] font-medium text-muted">
                  {zone.used}/{zone.capacity}
                </span>
                <span className="h-1.5 w-16 overflow-hidden rounded-full bg-line">
                  <span
                    className="block h-full rounded-full bg-accent transition-[width] duration-500"
                    style={{
                      width: `${zone.capacity === 0 ? 0 : (zone.used / zone.capacity) * 100}%`,
                    }}
                  />
                </span>
              </div>
            </div>

            <div className="space-y-1.5 overflow-x-auto no-scrollbar">
              {zone.racks.map((rack) => (
                <div key={rack.rack} className="flex items-center gap-2">
                  <span className="tabular w-14 shrink-0 text-[11px] font-medium text-faint">
                    Rack {rack.rack}
                  </span>
                  <div className="flex gap-1">
                    {rack.positions.map((position) => {
                      const deposit = position.depositId
                        ? state.deposits.find(
                            (item) => item.id === position.depositId,
                          )
                        : undefined;
                      const isSelected = position.key === activeKey;
                      const isIncident = deposit?.status === "incident";
                      return (
                        <button
                          key={position.key}
                          type="button"
                          onClick={() =>
                            setSelectedKey(isSelected ? null : position.key)
                          }
                          title={`Zone ${position.zone} · Rack ${position.rack} · Position ${position.position}${
                            deposit ? ` — ${deposit.id}` : " — libre"
                          }`}
                          aria-label={`Zone ${position.zone}, rack ${position.rack}, position ${position.position}, ${deposit ? "occupée" : "libre"}`}
                          aria-pressed={isSelected}
                          className={cn(
                            "size-5 shrink-0 rounded-[5px] border transition-all duration-150",
                            "hover:z-10 hover:scale-125",
                            isSelected
                              ? "scale-125 border-navy bg-navy ring-2 ring-navy/25"
                              : isIncident
                                ? "border-danger bg-danger hover:brightness-110"
                                : deposit
                                  ? "border-accent bg-accent hover:brightness-110"
                                  : "border-line-strong bg-surface hover:border-accent hover:bg-accent-soft",
                          )}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedPosition && (
        <div className="animate-fade-up rounded-xl border border-line bg-surface p-4 shadow-xs">
          {selectedDeposit ? (
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="tabular text-[15px] font-semibold text-ink">
                    {selectedDeposit.id}
                  </span>
                  <StatusBadge status={selectedDeposit.status} />
                </div>
                <p className="mt-1 text-[13px] text-muted">
                  {selectedCustomer?.name ?? "Client"} · déposé à{" "}
                  {formatTime(selectedDeposit.depositedAt)}
                </p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {selectedDeposit.items.map((item) => (
                    <li
                      key={item.label}
                      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-subtle px-2.5 py-1 text-[12px] text-ink"
                    >
                      <ItemIcon kind={item.kind} size={13} className="text-faint" />
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href={`/deposits/${selectedDeposit.id}`}
                className="press inline-flex items-center gap-1.5 rounded-[10px] border border-line-strong px-3 py-2 text-[13px] font-medium text-ink hover:bg-subtle"
              >
                Ouvrir la fiche
                <ArrowUpRight size={15} />
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-lg bg-positive-soft text-positive">
                <MapPin size={16} />
              </span>
              <div>
                <p className="text-[13px] font-semibold text-ink">
                  Position libre
                </p>
                <p className="text-[12.5px] text-muted">
                  Zone {selectedPosition.zone} · Rack {selectedPosition.rack} ·
                  Position {selectedPosition.position}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Version compacte, non interactive, pour le tableau de bord. */
export function CloakroomMini({ className }: { className?: string }) {
  const { state, venue } = useVestia();
  const grid = useMemo(
    () => buildGrid(venue, state.deposits),
    [venue, state.deposits],
  );

  return (
    <div className={cn("space-y-2.5", className)}>
      {grid.map((zone) => (
        <div key={zone.id} className="flex items-center gap-3">
          <span className="w-6 shrink-0 text-[12px] font-semibold text-ink">
            {zone.id}
          </span>
          <div className="flex flex-1 flex-wrap gap-[3px]">
            {zone.racks.flatMap((rack) =>
              rack.positions.map((position) => (
                <span
                  key={position.key}
                  className={cn(
                    "size-2 rounded-[2px]",
                    position.depositId ? "bg-accent" : "bg-line",
                  )}
                  aria-hidden
                />
              )),
            )}
          </div>
          <span className="tabular w-12 shrink-0 text-right text-[12px] text-muted">
            {zone.used}/{zone.capacity}
          </span>
        </div>
      ))}
    </div>
  );
}
