import type { Deposit, StorageLocation, Venue } from "@/lib/types";

/** Une position individuelle du plan du vestiaire. */
export interface GridPosition {
  key: string;
  zone: string;
  rack: number;
  position: number;
  depositId?: string;
}

export interface GridRack {
  rack: number;
  positions: GridPosition[];
  used: number;
}

export interface GridZone {
  id: string;
  name: string;
  racks: GridRack[];
  capacity: number;
  used: number;
}

export function locationKey(location: StorageLocation): string {
  return `${location.zone}-${location.rack}-${location.position}`;
}

/** Un dépôt occupe physiquement une position tant qu'il n'est pas restitué. */
export function isOccupying(deposit: Deposit): boolean {
  return deposit.status !== "returned";
}

/** Construit le plan complet du vestiaire à partir des dépôts en cours. */
export function buildGrid(venue: Venue, deposits: Deposit[]): GridZone[] {
  const byLocation = new Map<string, string>();
  for (const deposit of deposits) {
    if (isOccupying(deposit)) {
      byLocation.set(locationKey(deposit.location), deposit.id);
    }
  }

  return venue.zones.map((zone) => {
    let zoneUsed = 0;
    const racks = zone.racks.map((rack) => {
      let used = 0;
      const positions: GridPosition[] = [];
      for (let position = 1; position <= zone.positionsPerRack; position += 1) {
        const key = `${zone.id}-${rack}-${position}`;
        const depositId = byLocation.get(key);
        if (depositId) used += 1;
        positions.push({ key, zone: zone.id, rack, position, depositId });
      }
      zoneUsed += used;
      return { rack, positions, used };
    });

    return {
      id: zone.id,
      name: zone.name,
      racks,
      capacity: zone.racks.length * zone.positionsPerRack,
      used: zoneUsed,
    };
  });
}

/**
 * Attribution automatique : première position libre en partant de l'entrée.
 * Renvoie `null` si le vestiaire est complet.
 */
export function nextFreeLocation(
  venue: Venue,
  deposits: Deposit[],
): StorageLocation | null {
  const taken = new Set(
    deposits.filter(isOccupying).map((deposit) => locationKey(deposit.location)),
  );

  for (const zone of venue.zones) {
    for (const rack of zone.racks) {
      for (let position = 1; position <= zone.positionsPerRack; position += 1) {
        const key = `${zone.id}-${rack}-${position}`;
        if (!taken.has(key)) {
          return { zone: zone.id, rack, position };
        }
      }
    }
  }
  return null;
}

export interface OccupancySummary {
  used: number;
  capacity: number;
  ratio: number;
  free: number;
}

export function occupancy(venue: Venue, deposits: Deposit[]): OccupancySummary {
  const used = deposits.filter(isOccupying).length;
  const capacity = venue.zones.reduce(
    (total, zone) => total + zone.racks.length * zone.positionsPerRack,
    0,
  );
  return {
    used,
    capacity,
    ratio: capacity === 0 ? 0 : used / capacity,
    free: Math.max(0, capacity - used),
  };
}
