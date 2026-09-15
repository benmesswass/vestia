import { occupancy } from "@/lib/cloakroom";
import { DEMO_DATE, minutesBetween } from "@/lib/format";
import type { Customer, Deposit, Incident, ItemKind, Venue } from "@/lib/types";

export const ITEM_LABELS: Record<ItemKind, string> = {
  coat: "Manteaux",
  bag: "Sacs",
  jacket: "Vestes",
  helmet: "Casques",
  umbrella: "Parapluies",
  other: "Autres",
};

export interface Summary {
  total: number;
  active: number;
  returned: number;
  openIncidents: number;
  returnRate: number;
  avgKeepMinutes: number;
  occupiedRatio: number;
  occupiedCount: number;
  capacity: number;
  freeSlots: number;
}

export function summarize(
  deposits: Deposit[],
  incidents: Incident[],
  venue: Venue,
): Summary {
  const returnedDeposits = deposits.filter(
    (deposit) => deposit.status === "returned" && deposit.returnedAt,
  );
  const totalKeep = returnedDeposits.reduce(
    (total, deposit) =>
      total + minutesBetween(deposit.depositedAt, deposit.returnedAt as string),
    0,
  );
  const slots = occupancy(venue, deposits);

  return {
    total: deposits.length,
    active: deposits.filter((deposit) => deposit.status === "active").length,
    returned: returnedDeposits.length,
    openIncidents: incidents.filter(
      (incident) => incident.status !== "resolved",
    ).length,
    returnRate: deposits.length === 0 ? 0 : returnedDeposits.length / deposits.length,
    avgKeepMinutes:
      returnedDeposits.length === 0
        ? 0
        : Math.round(totalKeep / returnedDeposits.length),
    occupiedRatio: slots.ratio,
    occupiedCount: slots.used,
    capacity: slots.capacity,
    freeSlots: slots.free,
  };
}

/** Bornes de la soirée, par tranches de 30 minutes. */
const BUCKETS = [
  "19:30", "20:00", "20:30", "21:00", "21:30",
  "22:00", "22:30", "23:00",
];

function bucketOf(iso: string): string | null {
  const hour = Number(iso.slice(11, 13));
  const minute = Number(iso.slice(14, 16));
  if (hour < 19 || (hour === 19 && minute < 30)) return null;
  const half = minute < 30 ? "00" : "30";
  const label = `${String(hour).padStart(2, "0")}:${half}`;
  return BUCKETS.includes(label) ? label : BUCKETS[BUCKETS.length - 1];
}

export interface HourPoint {
  label: string;
  depots: number;
  restitutions: number;
}

export function depositsByHalfHour(deposits: Deposit[]): HourPoint[] {
  const points = new Map<string, HourPoint>(
    BUCKETS.map((label) => [label, { label, depots: 0, restitutions: 0 }]),
  );

  for (const deposit of deposits) {
    const bucket = bucketOf(deposit.depositedAt);
    if (bucket) {
      const point = points.get(bucket);
      if (point) point.depots += 1;
    }
    if (deposit.returnedAt) {
      const returnBucket = bucketOf(deposit.returnedAt);
      if (returnBucket) {
        const point = points.get(returnBucket);
        if (point) point.restitutions += 1;
      }
    }
  }

  return BUCKETS.map((label) => points.get(label) as HourPoint);
}

export interface OccupancyPoint {
  label: string;
  occupation: number;
}

/** Courbe d'occupation du vestiaire au fil de la soirée. */
export function occupancyCurve(deposits: Deposit[]): OccupancyPoint[] {
  return BUCKETS.map((label) => {
    const instant = `${DEMO_DATE}T${label}:00`;
    const instantMs = new Date(instant).getTime();
    const occupation = deposits.filter((deposit) => {
      const depositedMs = new Date(deposit.depositedAt).getTime();
      if (depositedMs > instantMs) return false;
      if (!deposit.returnedAt) return true;
      return new Date(deposit.returnedAt).getTime() > instantMs;
    }).length;
    return { label, occupation };
  });
}

export interface BreakdownPoint {
  name: string;
  value: number;
  kind: ItemKind;
}

export function itemBreakdown(deposits: Deposit[]): BreakdownPoint[] {
  const counts = new Map<ItemKind, number>();
  for (const deposit of deposits) {
    for (const item of deposit.items) {
      counts.set(item.kind, (counts.get(item.kind) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([kind, value]) => ({ kind, name: ITEM_LABELS[kind], value }))
    .sort((a, b) => b.value - a.value);
}

export interface DurationBucket {
  label: string;
  value: number;
}

/** Répartition des durées de garde, utile pour dimensionner les équipes. */
export function keepDurationBuckets(deposits: Deposit[]): DurationBucket[] {
  const buckets: DurationBucket[] = [
    { label: "< 1 h", value: 0 },
    { label: "1–2 h", value: 0 },
    { label: "2–3 h", value: 0 },
    { label: "> 3 h", value: 0 },
  ];

  for (const deposit of deposits) {
    if (!deposit.returnedAt) continue;
    const minutes = minutesBetween(deposit.depositedAt, deposit.returnedAt);
    if (minutes < 60) buckets[0].value += 1;
    else if (minutes < 120) buckets[1].value += 1;
    else if (minutes < 180) buckets[2].value += 1;
    else buckets[3].value += 1;
  }

  return buckets;
}

export interface ZoneLoad {
  zone: string;
  name: string;
  used: number;
  capacity: number;
}

export function zoneLoad(venue: Venue, deposits: Deposit[]): ZoneLoad[] {
  return venue.zones.map((zone) => ({
    zone: zone.id,
    name: zone.name,
    capacity: zone.racks.length * zone.positionsPerRack,
    used: deposits.filter(
      (deposit) =>
        deposit.status !== "returned" && deposit.location.zone === zone.id,
    ).length,
  }));
}

export type ActivityKind = "deposit" | "return" | "incident";

export interface ActivityEntry {
  id: string;
  at: string;
  kind: ActivityKind;
  title: string;
  detail: string;
  depositId?: string;
}

/** Flux d'activité fusionné (dépôts, restitutions, incidents), le plus récent d'abord. */
export function recentActivity(
  deposits: Deposit[],
  customers: Customer[],
  incidents: Incident[],
  limit = 8,
): ActivityEntry[] {
  const nameById = new Map(customers.map((customer) => [customer.id, customer.name]));
  const entries: ActivityEntry[] = [];

  for (const deposit of deposits) {
    const customerName = nameById.get(deposit.customerId) ?? "Client";
    entries.push({
      id: `${deposit.id}-in`,
      at: deposit.depositedAt,
      kind: "deposit",
      title: `${deposit.id} · dépôt créé`,
      detail: `${customerName} — ${deposit.items.length} objet${deposit.items.length > 1 ? "s" : ""}`,
      depositId: deposit.id,
    });
    if (deposit.returnedAt) {
      entries.push({
        id: `${deposit.id}-out`,
        at: deposit.returnedAt,
        kind: "return",
        title: `${deposit.id} · restitué`,
        detail: `${customerName} — scan validé`,
        depositId: deposit.id,
      });
    }
  }

  for (const incident of incidents) {
    entries.push({
      id: incident.id,
      at: incident.createdAt,
      kind: "incident",
      title: `${incident.id} · incident`,
      detail: incident.title,
      depositId: incident.depositId,
    });
  }

  return entries
    .sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0))
    .slice(0, limit);
}

export interface CustomerStats {
  customer: Customer;
  depositCount: number;
  lastDepositAt?: string;
  hasActive: boolean;
}

export function customerStats(
  customers: Customer[],
  deposits: Deposit[],
): CustomerStats[] {
  return customers
    .map((customer) => {
      const own = deposits.filter(
        (deposit) => deposit.customerId === customer.id,
      );
      const last = own.reduce<string | undefined>(
        (latest, deposit) =>
          !latest || deposit.depositedAt > latest ? deposit.depositedAt : latest,
        undefined,
      );
      return {
        customer,
        depositCount: own.length,
        lastDepositAt: last,
        hasActive: own.some((deposit) => deposit.status !== "returned"),
      };
    })
    .sort((a, b) => (a.lastDepositAt ?? "") < (b.lastDepositAt ?? "") ? 1 : -1);
}
