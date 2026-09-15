"use client";

import { Boxes, ChartColumn, Percent, Timer, TrendingUp } from "lucide-react";
import { useMemo } from "react";

import {
  DurationChart,
  FlowChart,
  OccupancyChart,
} from "@/components/domain/analytics-charts";
import { ItemIcon } from "@/components/domain/item-icon";
import { KpiCard } from "@/components/domain/kpi-card";
import { Card, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/states";
import {
  DEMO_NOW,
  capitalizeFirst,
  formatDateLong,
  formatDuration,
} from "@/lib/format";
import { useVestia } from "@/lib/store";
import {
  depositsByHalfHour,
  itemBreakdown,
  keepDurationBuckets,
  occupancyCurve,
  summarize,
} from "@/lib/stats";

export default function AnalyticsPage() {
  const { state, venue } = useVestia();

  const summary = useMemo(
    () => summarize(state.deposits, state.incidents, venue),
    [state.deposits, state.incidents, venue],
  );
  const flow = useMemo(
    () => depositsByHalfHour(state.deposits),
    [state.deposits],
  );
  const occupancy = useMemo(
    () => occupancyCurve(state.deposits),
    [state.deposits],
  );
  const durations = useMemo(
    () => keepDurationBuckets(state.deposits),
    [state.deposits],
  );
  const items = useMemo(() => itemBreakdown(state.deposits), [state.deposits]);

  const peak = flow.reduce(
    (best, point) => (point.depots > best.depots ? point : best),
    flow[0] ?? { label: "—", depots: 0, restitutions: 0 },
  );
  const maxItems = items.reduce((max, item) => Math.max(max, item.value), 0);
  const totalItems = items.reduce((total, item) => total + item.value, 0);

  return (
    <>
      <PageHeader
        title="Analytics"
        subtitle={`${capitalizeFirst(formatDateLong(DEMO_NOW))} · soirée en cours`}
      />

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard
          label="Dépôts sur la soirée"
          value={summary.total}
          icon={ChartColumn}
          tone="accent"
          hint="depuis l'ouverture"
          trend={{ value: "+12 %", positive: true }}
          ratio={summary.total / 120}
          delay={0}
        />
        <KpiCard
          label="Pic d'affluence"
          value={peak.label}
          icon={TrendingUp}
          tone="warn"
          hint={`${peak.depots} dépôts sur 30 min`}
          ratio={0.8}
          delay={60}
        />
        <KpiCard
          label="Temps moyen de retrait"
          value={formatDuration(summary.avgKeepMinutes)}
          icon={Timer}
          tone="neutral"
          hint="dépôt → restitution"
          trend={{ value: "-8 min", positive: true }}
          ratio={Math.min(1, summary.avgKeepMinutes / 240)}
          delay={120}
        />
        <KpiCard
          label="Taux de restitution"
          value={Math.round(summary.returnRate * 100)}
          unit="%"
          icon={Percent}
          tone="positive"
          hint={`${summary.active} encore au vestiaire`}
          ratio={summary.returnRate}
          delay={180}
        />
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader
            title="Dépôts et restitutions"
            subtitle="Par tranche de 30 minutes"
          />
          <FlowChart data={flow} />
        </Card>

        <Card>
          <CardHeader
            title="Occupation du vestiaire"
            subtitle={`Places occupées sur ${summary.capacity} — pic en fin de soirée`}
          />
          <OccupancyChart data={occupancy} />
        </Card>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader
            title="Objets déposés"
            subtitle={`${totalItems} objets confiés au vestiaire`}
          />
          <ul className="space-y-3">
            {items.map((item, index) => (
              <li key={item.kind}>
                <div className="mb-1.5 flex items-center gap-2">
                  <ItemIcon kind={item.kind} size={15} className="text-faint" />
                  <span className="text-[13px] font-medium text-ink">
                    {item.name}
                  </span>
                  <span className="tabular ml-auto text-[13px] font-semibold text-ink">
                    {item.value}
                  </span>
                  <span className="tabular w-12 text-right text-[12px] text-muted">
                    {totalItems === 0
                      ? "0 %"
                      : `${Math.round((item.value / totalItems) * 100)} %`}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-subtle">
                  <div
                    className="h-full rounded-full bg-accent transition-[width] duration-700 ease-out"
                    style={{
                      width: `${maxItems === 0 ? 0 : (item.value / maxItems) * 100}%`,
                      transitionDelay: `${index * 60}ms`,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader
            title="Durée de garde"
            subtitle="Répartition des dépôts déjà restitués"
          />
          <DurationChart data={durations} />
        </Card>
      </section>

      <Card className="mt-4">
        <CardHeader
          title="Lecture de la soirée"
          subtitle="Ce que ces chiffres disent de l'exploitation"
        />
        <ul className="grid gap-3 sm:grid-cols-3">
          {[
            {
              icon: TrendingUp,
              title: `Pic à ${peak.label}`,
              detail: `${peak.depots} dépôts en 30 minutes. Prévoir deux postes de dépôt sur ce créneau.`,
            },
            {
              icon: Boxes,
              title: `${summary.freeSlots} places libres`,
              detail: `Occupation à ${Math.round(summary.occupiedRatio * 100)} % — la capacité tient jusqu'à la fermeture.`,
            },
            {
              icon: Timer,
              title: formatDuration(summary.avgKeepMinutes),
              detail:
                "Durée moyenne entre le dépôt et la restitution, incidents exclus.",
            },
          ].map((insight) => (
            <li
              key={insight.title}
              className="rounded-xl border border-line bg-subtle p-4"
            >
              <span className="grid size-9 place-items-center rounded-lg bg-surface text-accent shadow-xs">
                <insight.icon size={16} />
              </span>
              <p className="mt-3 text-[14px] font-semibold text-ink">
                {insight.title}
              </p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
                {insight.detail}
              </p>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
