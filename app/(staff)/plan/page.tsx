"use client";

import { ArrowLeft, DoorOpen, Layers, Warehouse } from "lucide-react";
import { useMemo } from "react";

import { CloakroomMap } from "@/components/domain/cloakroom-map";
import { KpiCard } from "@/components/domain/kpi-card";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/states";
import { DEMO_TICKET_ID } from "@/lib/demo-data";
import { useVestia } from "@/lib/store";
import { summarize, zoneLoad } from "@/lib/stats";

export default function PlanPage() {
  const { state, venue } = useVestia();

  const summary = useMemo(
    () => summarize(state.deposits, state.incidents, venue),
    [state.deposits, state.incidents, venue],
  );
  const zones = useMemo(
    () => zoneLoad(venue, state.deposits),
    [venue, state.deposits],
  );

  const highlight = state.deposits.some(
    (deposit) => deposit.id === DEMO_TICKET_ID && deposit.status !== "returned",
  )
    ? DEMO_TICKET_ID
    : undefined;

  return (
    <>
      <PageHeader
        title="Plan du vestiaire"
        subtitle={`${venue.name} · ${summary.occupiedCount} positions occupées sur ${summary.capacity}`}
        actions={
          <ButtonLink href="/dashboard" variant="ghost">
            <ArrowLeft size={16} />
            Tableau de bord
          </ButtonLink>
        }
      />

      <section className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard
          label="Occupation"
          value={Math.round(summary.occupiedRatio * 100)}
          unit="%"
          icon={Warehouse}
          tone={summary.occupiedRatio > 0.85 ? "warn" : "accent"}
          hint={`${summary.occupiedCount} positions prises`}
          ratio={summary.occupiedRatio}
          delay={0}
        />
        <KpiCard
          label="Places libres"
          value={summary.freeSlots}
          icon={DoorOpen}
          tone="positive"
          hint="disponibles immédiatement"
          ratio={summary.capacity ? summary.freeSlots / summary.capacity : 0}
          delay={60}
        />
        <KpiCard
          label="Zones"
          value={venue.zones.length}
          icon={Layers}
          tone="neutral"
          hint={venue.zones.map((zone) => zone.id).join(" · ")}
          ratio={1}
          delay={120}
        />
        <KpiCard
          label="Zone la plus chargée"
          value={
            zones.reduce(
              (best, zone) =>
                zone.used / zone.capacity > best.used / best.capacity
                  ? zone
                  : best,
              zones[0] ?? { zone: "—", used: 0, capacity: 1, name: "" },
            ).zone
          }
          icon={Layers}
          tone="warn"
          hint="à surveiller en fin de soirée"
          ratio={0.9}
          delay={180}
        />
      </section>

      <Card>
        <CardHeader
          title="Positions"
          subtitle="Cliquez sur une position pour voir le dépôt associé."
        />
        <CloakroomMap highlight={highlight} />
      </Card>
    </>
  );
}
