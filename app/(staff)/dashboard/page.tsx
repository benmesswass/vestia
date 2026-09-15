"use client";

import {
  ArrowUpRight,
  Boxes,
  Check,
  CircleCheck,
  PackagePlus,
  ScanLine,
  Timer,
  TriangleAlert,
  Warehouse,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";

import { CloakroomMini } from "@/components/domain/cloakroom-map";
import { ItemIcon } from "@/components/domain/item-icon";
import { KpiCard } from "@/components/domain/kpi-card";
import { ReturnDepositModal } from "@/components/domain/return-modal";
import { IncidentStatusBadge, StatusBadge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState, PageHeader } from "@/components/ui/states";
import { cn } from "@/lib/cn";
import {
  DEMO_NOW,
  capitalizeFirst,
  formatDateLong,
  formatDuration,
  formatLocationShort,
  formatRelative,
  formatTime,
} from "@/lib/format";
import { STAFF } from "@/lib/demo-data";
import { useVestia } from "@/lib/store";
import { recentActivity, summarize, zoneLoad } from "@/lib/stats";
import type { Deposit } from "@/lib/types";

export default function DashboardPage() {
  const { state, venue } = useVestia();
  const [returning, setReturning] = useState<Deposit | null>(null);

  const summary = useMemo(
    () => summarize(state.deposits, state.incidents, venue),
    [state.deposits, state.incidents, venue],
  );

  const activity = useMemo(
    () => recentActivity(state.deposits, state.customers, state.incidents, 7),
    [state.deposits, state.customers, state.incidents],
  );

  const zones = useMemo(
    () => zoneLoad(venue, state.deposits),
    [venue, state.deposits],
  );

  const latest = useMemo(
    () =>
      state.deposits
        .filter((deposit) => deposit.status !== "returned")
        .sort((a, b) => (a.depositedAt < b.depositedAt ? 1 : -1))
        .slice(0, 8),
    [state.deposits],
  );

  const openIncidents = state.incidents.filter(
    (incident) => incident.status !== "resolved",
  );

  const nameById = useMemo(
    () => new Map(state.customers.map((customer) => [customer.id, customer.name])),
    [state.customers],
  );

  return (
    <>
      <PageHeader
        title={`Bonsoir ${STAFF.name.split(" ")[0]}`}
        subtitle={capitalizeFirst(formatDateLong(DEMO_NOW))}
        actions={
          <>
            <ButtonLink href="/scan" variant="secondary">
              <ScanLine size={16} />
              Scanner
            </ButtonLink>
            <ButtonLink href="/deposits/new">
              <PackagePlus size={16} />
              Nouveau dépôt
            </ButtonLink>
          </>
        }
      />

      <section
        aria-label="Indicateurs de la soirée"
        className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6"
      >
        <KpiCard
          label="Dépôts ce soir"
          value={summary.total}
          icon={PackagePlus}
          tone="accent"
          hint="depuis 19 h 30"
          trend={{ value: "+12 %", positive: true }}
          ratio={summary.total / 120}
          delay={0}
        />
        <KpiCard
          label="En cours"
          value={summary.active}
          icon={Boxes}
          tone="accent"
          hint="au vestiaire"
          ratio={summary.capacity ? summary.active / summary.capacity : 0}
          delay={60}
        />
        <KpiCard
          label="Restitués"
          value={summary.returned}
          icon={CircleCheck}
          tone="positive"
          hint="sans incident"
          ratio={summary.returnRate}
          delay={120}
        />
        <KpiCard
          label="Incidents"
          value={summary.openIncidents}
          icon={TriangleAlert}
          tone={summary.openIncidents > 0 ? "danger" : "positive"}
          hint={summary.openIncidents > 0 ? "à traiter" : "rien à signaler"}
          ratio={summary.openIncidents / 5}
          delay={180}
        />
        <KpiCard
          label="Temps moyen de retrait"
          value={formatDuration(summary.avgKeepMinutes)}
          icon={Timer}
          tone="neutral"
          hint="dépôt → restitution"
          trend={{ value: "-8 min", positive: true }}
          ratio={Math.min(1, summary.avgKeepMinutes / 240)}
          delay={240}
        />
        <KpiCard
          label="Occupation"
          value={Math.round(summary.occupiedRatio * 100)}
          unit="%"
          icon={Warehouse}
          tone={summary.occupiedRatio > 0.85 ? "warn" : "accent"}
          hint={`${summary.freeSlots} places libres`}
          ratio={summary.occupiedRatio}
          delay={300}
        />
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2" padded={false}>
          <div className="p-5 pb-0">
            <CardHeader
              title="Dépôts en cours"
              subtitle="Les plus récents, en haut"
              action={
                <Link
                  href="/deposits"
                  className="inline-flex items-center gap-1 text-[13px] font-medium text-accent hover:underline"
                >
                  Tout voir
                  <ArrowUpRight size={14} />
                </Link>
              }
            />
          </div>

          {latest.length === 0 ? (
            <div className="p-5 pt-0">
              <EmptyState
                icon={<Boxes size={20} />}
                title="Vestiaire vide"
                description="Aucun dépôt en cours pour le moment."
                action={
                  <ButtonLink href="/deposits/new" size="sm">
                    Créer un dépôt
                  </ButtonLink>
                }
              />
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {latest.map((deposit, index) => (
                <li
                  key={deposit.id}
                  className="stagger flex items-center gap-3 px-5 py-3 transition-colors duration-150 hover:bg-subtle"
                  style={{ "--d": `${index * 30}ms` } as CSSProperties}
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-line bg-subtle text-faint">
                    <ItemIcon kind={deposit.items[0]?.kind ?? "other"} size={16} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2">
                      <Link
                        href={`/deposits/${deposit.id}`}
                        className="tabular text-[13.5px] font-semibold text-accent hover:underline"
                      >
                        {deposit.id}
                      </Link>
                      <span className="truncate text-[13px] text-ink">
                        {nameById.get(deposit.customerId) ?? "Client"}
                      </span>
                    </div>
                    <p className="truncate text-[12px] text-muted">
                      {deposit.items.map((item) => item.label).join(" · ")}
                    </p>
                  </div>

                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="tabular text-[12.5px] font-medium text-ink">
                      {formatLocationShort(deposit.location)}
                    </p>
                    <p className="tabular text-[11.5px] text-faint">
                      {formatTime(deposit.depositedAt)}
                    </p>
                  </div>

                  <StatusBadge status={deposit.status} className="shrink-0" />

                  <Button
                    size="sm"
                    variant="secondary"
                    className="hidden shrink-0 lg:inline-flex"
                    onClick={() => setReturning(deposit)}
                  >
                    Restituer
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader
            title="État du vestiaire"
            subtitle={`${summary.occupiedCount} places occupées sur ${summary.capacity}`}
            action={
              <Link
                href="/plan"
                className="inline-flex items-center gap-1 text-[13px] font-medium text-accent hover:underline"
              >
                Plan
                <ArrowUpRight size={14} />
              </Link>
            }
          />

          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="tabular text-[34px] leading-none font-semibold tracking-[-0.03em] text-ink">
                {Math.round(summary.occupiedRatio * 100)}
                <span className="text-[18px] text-faint">%</span>
              </p>
              <p className="mt-1 text-[12.5px] text-muted">
                {summary.freeSlots} places encore libres
              </p>
            </div>
            <span
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11.5px] font-semibold",
                summary.occupiedRatio > 0.85
                  ? "border-warn-line bg-warn-soft text-warn"
                  : "border-positive-line bg-positive-soft text-positive",
              )}
            >
              {summary.occupiedRatio > 0.85 ? "Tension" : "Fluide"}
            </span>
          </div>

          <div className="mt-4 space-y-2.5">
            {zones.map((zone) => (
              <div key={zone.zone}>
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-[12.5px] font-medium text-ink">
                    Zone {zone.zone}
                    <span className="ml-1.5 text-[11.5px] font-normal text-faint">
                      {zone.name}
                    </span>
                  </p>
                  <span className="tabular text-[12px] text-muted">
                    {zone.used}/{zone.capacity}
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-subtle">
                  <div
                    className="h-full rounded-full bg-accent transition-[width] duration-700 ease-out"
                    style={{
                      width: `${zone.capacity ? (zone.used / zone.capacity) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-line pt-4">
            <p className="mb-2.5 text-[11px] font-semibold tracking-wide text-faint uppercase">
              Répartition des positions
            </p>
            <CloakroomMini />
          </div>
        </Card>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Activité récente"
            subtitle="Dépôts, restitutions et incidents"
          />
          <ul className="space-y-0">
            {activity.map((entry, index) => (
              <li
                key={entry.id}
                className="stagger flex items-start gap-3 border-b border-line py-2.5 last:border-0 last:pb-0"
                style={{ "--d": `${index * 40}ms` } as CSSProperties}
              >
                <span
                  className={cn(
                    "mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border",
                    entry.kind === "return"
                      ? "border-positive-line bg-positive-soft text-positive"
                      : entry.kind === "incident"
                        ? "border-danger-line bg-danger-soft text-danger"
                        : "border-accent-line bg-accent-soft text-accent",
                  )}
                >
                  {entry.kind === "return" ? (
                    <Check size={13} strokeWidth={2.6} />
                  ) : entry.kind === "incident" ? (
                    <TriangleAlert size={13} />
                  ) : (
                    <PackagePlus size={13} />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-ink">
                    {entry.depositId ? (
                      <Link
                        href={`/deposits/${entry.depositId}`}
                        className="hover:text-accent hover:underline"
                      >
                        {entry.title}
                      </Link>
                    ) : (
                      entry.title
                    )}
                  </p>
                  <p className="truncate text-[12px] text-muted">{entry.detail}</p>
                </div>
                <span className="shrink-0 text-[11.5px] text-faint">
                  {formatRelative(entry.at, DEMO_NOW)}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader
            title="Incidents ouverts"
            subtitle={
              openIncidents.length === 0
                ? "Aucun incident en cours"
                : `${openIncidents.length} à traiter`
            }
            action={
              <Link
                href="/incidents"
                className="inline-flex items-center gap-1 text-[13px] font-medium text-accent hover:underline"
              >
                Voir
                <ArrowUpRight size={14} />
              </Link>
            }
          />

          {openIncidents.length === 0 ? (
            <EmptyState
              icon={<CircleCheck size={20} />}
              title="Tout est sous contrôle"
              description="Aucun incident ouvert sur cette soirée."
            />
          ) : (
            <ul className="space-y-2.5">
              {openIncidents.slice(0, 4).map((incident) => (
                <li
                  key={incident.id}
                  className="rounded-xl border border-line bg-subtle p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[13px] font-medium text-ink">
                      {incident.title}
                    </p>
                    <IncidentStatusBadge status={incident.status} />
                  </div>
                  <p className="mt-1 text-[12px] text-muted">
                    {incident.id}
                    {incident.depositId ? ` · ${incident.depositId}` : ""} ·{" "}
                    {formatTime(incident.createdAt)} · {incident.assignee}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      <ReturnDepositModal
        deposit={returning}
        open={returning !== null}
        onClose={() => setReturning(null)}
      />
    </>
  );
}
