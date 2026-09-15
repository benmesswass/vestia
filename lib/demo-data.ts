import { DEMO_DATE, DEMO_NOW, toNaiveIso } from "@/lib/format";
import type {
  Customer,
  Deposit,
  DepositItem,
  Incident,
  StaffUser,
  StorageLocation,
  AppSettings,
  TimelineEvent,
  Venue,
} from "@/lib/types";

/* -------------------------------------------------------------------------
 * Jeu de données de démonstration.
 *
 * Entièrement déterministe (générateur congruentiel à graine fixe) : le
 * serveur et le navigateur produisent exactement les mêmes données, donc
 * aucun écart d'hydratation. Une soirée complète de samedi, de l'ouverture
 * (19 h 30) à l'instant présent de la démo (23 h 12).
 * ---------------------------------------------------------------------- */

/** Le dépôt scénarisé, présenté au client pendant la démo. */
export const DEMO_TICKET_ID = "V-4821";

export const VENUE: Venue = {
  name: "Le Sonar",
  type: "Club · Salle de concert",
  city: "Paris 11e",
  capacity: 132,
  zones: [
    { id: "A", name: "Entrée principale", racks: [10, 11, 12, 13], positionsPerRack: 12 },
    { id: "B", name: "Mezzanine", racks: [20, 21, 22, 23, 24], positionsPerRack: 12 },
    { id: "C", name: "Backstage / VIP", racks: [30, 31], positionsPerRack: 12 },
  ],
};

export const STAFF: StaffUser = {
  name: "Maya Lefebvre",
  role: "Responsable vestiaire",
  initials: "ML",
};

export const DEFAULT_SETTINGS: AppSettings = {
  venueName: VENUE.name,
  autoAssignLocation: true,
  requirePhone: false,
  smsEnabled: true,
  whatsappEnabled: true,
  walletEnabled: true,
  closingReminder: true,
  ticketPrefix: "V",
};

const STAFF_POOL = ["Maya", "Leïla", "Karim", "Julie", "Antoine"];

const FIRST_NAMES = [
  "Camille", "Lucas", "Sarah", "Yanis", "Léa", "Hugo", "Inès", "Nathan",
  "Chloé", "Mehdi", "Manon", "Théo", "Jade", "Adam", "Louise", "Rayan",
  "Emma", "Noah", "Alice", "Gabriel", "Zoé", "Enzo", "Anaïs", "Malik",
  "Julia", "Sofiane", "Clara", "Victor", "Nina", "Élias", "Maëlys", "Ibrahim",
  "Romane", "Arthur", "Lina", "Paul",
];

const LAST_NAMES = [
  "Bernard", "Dubois", "Moreau", "Laurent", "Simon", "Michel", "Garcia",
  "Roux", "Fontaine", "Chevalier", "Benali", "Robin", "Girard", "Lemoine",
  "Perrot", "Da Silva", "Nguyen", "Marchand", "Renard", "Barbier", "Gauthier",
  "Leroy", "Fournier", "Colin", "Aubert", "Traoré", "Meunier", "Blanchard",
];

const ITEM_POOL: DepositItem[] = [
  { kind: "coat", label: "Manteau noir" },
  { kind: "coat", label: "Manteau camel" },
  { kind: "coat", label: "Trench beige" },
  { kind: "coat", label: "Doudoune bleue" },
  { kind: "jacket", label: "Veste en cuir" },
  { kind: "jacket", label: "Veste en jean" },
  { kind: "jacket", label: "Blazer gris" },
  { kind: "bag", label: "Sac à main noir" },
  { kind: "bag", label: "Sac à dos" },
  { kind: "bag", label: "Tote bag" },
  { kind: "helmet", label: "Casque moto" },
  { kind: "umbrella", label: "Parapluie" },
  { kind: "other", label: "Écharpe" },
  { kind: "other", label: "Sac de sport" },
];

/** Générateur pseudo-aléatoire déterministe (LCG « Numerical Recipes »). */
function createRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

const OPENING = `${DEMO_DATE}T19:30:00`;
const OPENING_MS = new Date(OPENING).getTime();
const DEMO_NOW_MS = new Date(DEMO_NOW).getTime();

/** Décale l'ouverture de `minutes` et renvoie un ISO local naïf. */
function atMinute(minutes: number): string {
  return toNaiveIso(new Date(OPENING_MS + Math.round(minutes) * 60_000));
}

const FIRST_TICKET = 4732;
const TOTAL_DEPOSITS = 96;
/** Index du ticket scénarisé dans la séquence (⇒ identifiant V-4821). */
const DEMO_INDEX = Number(DEMO_TICKET_ID.slice(2)) - FIRST_TICKET;
/** 19 h 30 + 193 min = 22 h 43, l'heure du dépôt de Thomas Martin. */
const DEMO_MINUTE = 193;

const DEMO_LOCATION: StorageLocation = { zone: "B", rack: 24, position: 8 };

/** Emplacements réservés, jamais attribués automatiquement. */
const RESERVED = `${DEMO_LOCATION.zone}-${DEMO_LOCATION.rack}-${DEMO_LOCATION.position}`;

function allSlots(): StorageLocation[] {
  const slots: StorageLocation[] = [];
  for (const zone of VENUE.zones) {
    for (const rack of zone.racks) {
      for (let position = 1; position <= zone.positionsPerRack; position += 1) {
        if (`${zone.id}-${rack}-${position}` === RESERVED) continue;
        slots.push({ zone: zone.id, rack, position });
      }
    }
  }
  return slots;
}

/** Heure de dépôt du n-ième ticket de la soirée. */
function depositMinute(index: number, jitter: number): number {
  if (index <= DEMO_INDEX) {
    const base = (index * DEMO_MINUTE) / DEMO_INDEX;
    return index === DEMO_INDEX ? DEMO_MINUTE : base + jitter;
  }
  return DEMO_MINUTE + (index - DEMO_INDEX) * 3.2 + jitter;
}

function buildTimeline(
  depositedAt: string,
  channels: string[],
  returnedAt: string | undefined,
  staff: string,
): TimelineEvent[] {
  const events: TimelineEvent[] = [
    {
      at: depositedAt,
      kind: "created",
      label: "Dépôt créé",
      detail: `Enregistré par ${staff}`,
    },
    {
      at: depositedAt,
      kind: "assigned",
      label: "Emplacement attribué",
      detail: "Attribution automatique",
    },
  ];

  const sentAt = toNaiveIso(new Date(new Date(depositedAt).getTime() + 60_000));
  events.push({
    at: sentAt,
    kind: "sent",
    label: "Ticket envoyé",
    detail: channels.includes("sms") ? "SMS + QR code" : "QR code",
  });

  if (returnedAt) {
    events.push({
      at: returnedAt,
      kind: "returned",
      label: "Affaires restituées",
      detail: `Scan validé par ${staff}`,
    });
  }

  return events;
}

interface GeneratedData {
  deposits: Deposit[];
  customers: Customer[];
}

function generate(): GeneratedData {
  const random = createRandom(20260914);
  const slots = allSlots();
  const customers: Customer[] = [];
  const customerByIndex = new Map<number, Customer>();

  /** Crée (ou réutilise) un client déterministe. */
  const customerAt = (seedIndex: number): Customer => {
    const existing = customerByIndex.get(seedIndex);
    if (existing) return existing;
    const first = FIRST_NAMES[seedIndex % FIRST_NAMES.length];
    const last = LAST_NAMES[(seedIndex * 7 + 3) % LAST_NAMES.length];
    const digits = String(10_000_000 + ((seedIndex * 918_273) % 89_999_999));
    const customer: Customer = {
      id: `C-${String(100 + seedIndex)}`,
      name: `${first} ${last}`,
      phone: `0${6 + (seedIndex % 2)}${digits.slice(0, 8)}`,
      since: atMinute(-(seedIndex % 9) * 10_080),
      vip: seedIndex % 11 === 0,
    };
    customerByIndex.set(seedIndex, customer);
    customers.push(customer);
    return customer;
  };

  const thomas: Customer = {
    id: "C-001",
    name: "Thomas Martin",
    phone: "0612345678",
    email: "thomas.martin@email.fr",
    since: "2026-02-07T21:10:00",
    vip: true,
  };
  customers.push(thomas);

  // Occupation courante des emplacements : un emplacement libéré est réutilisé.
  const freeSlots = [...slots];
  const occupied = new Map<string, number>();
  const deposits: Deposit[] = [];

  for (let index = 0; index < TOTAL_DEPOSITS; index += 1) {
    const id = `V-${FIRST_TICKET + index}`;
    const jitter = (random() - 0.5) * 3;
    const minute = depositMinute(index, jitter);
    const depositedAt = atMinute(minute);
    const staff = STAFF_POOL[Math.floor(random() * STAFF_POOL.length)];

    // Libère les emplacements des dépôts déjà restitués à cet instant.
    for (const [key, freedAtMinute] of occupied) {
      if (freedAtMinute <= minute) {
        occupied.delete(key);
        const [zone, rack, position] = key.split("-");
        freeSlots.push({
          zone,
          rack: Number(rack),
          position: Number(position),
        });
      }
    }

    const isDemo = index === DEMO_INDEX;
    const customer = isDemo ? thomas : customerAt(index % 44);

    // Restitution : surtout les dépôts du début de soirée.
    const returnRoll = random();
    const stayMinutes = 55 + Math.floor(random() * 115);
    const returnMinute = minute + stayMinutes;
    const returned =
      !isDemo &&
      returnRoll < 0.46 &&
      OPENING_MS + returnMinute * 60_000 < DEMO_NOW_MS;
    const returnedAt = returned ? atMinute(returnMinute) : undefined;

    let location: StorageLocation;
    if (isDemo) {
      location = DEMO_LOCATION;
    } else {
      const pick = Math.floor(random() * freeSlots.length);
      location = freeSlots.splice(pick, 1)[0] ?? {
        zone: "A",
        rack: 10,
        position: 1,
      };
    }
    if (returned) {
      occupied.set(
        `${location.zone}-${location.rack}-${location.position}`,
        returnMinute,
      );
    }

    const itemCount = isDemo ? 2 : 1 + (random() < 0.34 ? 1 : 0);
    const items: DepositItem[] = [];
    if (isDemo) {
      items.push(
        { kind: "coat", label: "Manteau noir" },
        { kind: "bag", label: "Sac noir" },
      );
    } else {
      for (let i = 0; i < itemCount; i += 1) {
        const item = ITEM_POOL[Math.floor(random() * ITEM_POOL.length)];
        if (!items.some((existing) => existing.label === item.label)) {
          items.push(item);
        }
      }
    }

    const channels: Deposit["channels"] = isDemo
      ? ["qr", "sms"]
      : random() < 0.55
        ? ["qr", "sms"]
        : ["qr"];

    deposits.push({
      id,
      customerId: customer.id,
      items,
      location,
      depositedAt,
      returnedAt,
      status: returned ? "returned" : "active",
      staff: isDemo ? "Maya" : staff,
      channels,
      timeline: buildTimeline(depositedAt, channels, returnedAt, staff),
    });
  }

  // Le dépôt scénarisé reçoit une chronologie soignée (visible en démo).
  const demo = deposits.find((deposit) => deposit.id === DEMO_TICKET_ID);
  if (demo) {
    demo.timeline = [
      { at: `${DEMO_DATE}T22:43:00`, kind: "created", label: "Dépôt créé", detail: "Enregistré par Maya" },
      { at: `${DEMO_DATE}T22:43:00`, kind: "assigned", label: "Emplacement attribué", detail: "Zone B · Rack 24 · Position 8" },
      { at: `${DEMO_DATE}T22:44:00`, kind: "sent", label: "Ticket envoyé", detail: "SMS au 06 12 34 56 78" },
      { at: `${DEMO_DATE}T22:46:00`, kind: "viewed", label: "Ticket consulté", detail: "Ouvert sur mobile par le client" },
    ];
  }

  // Un dépôt rattaché à un incident ouvert (ticket perdu).
  const flagged = deposits.find((deposit) => deposit.id === "V-4756");
  if (flagged) {
    flagged.status = "incident";
    flagged.returnedAt = undefined;
    flagged.timeline.push({
      at: `${DEMO_DATE}T22:58:00`,
      kind: "incident",
      label: "Incident ouvert",
      detail: "Ticket perdu — vérification d'identité en cours",
    });
  }

  return { deposits, customers };
}

const generated = generate();

export const DEMO_DEPOSITS: Deposit[] = generated.deposits;
export const DEMO_CUSTOMERS: Customer[] = generated.customers;

export const DEMO_INCIDENTS: Incident[] = [
  {
    id: "INC-032",
    type: "lost_ticket",
    status: "open",
    title: "Ticket perdu — client sans QR code",
    description:
      "Le client ne retrouve ni le SMS ni le QR code. Dépôt identifié par le nom et la description des affaires, vérification d'identité à faire avant restitution.",
    depositId: "V-4756",
    createdAt: `${DEMO_DATE}T22:58:00`,
    assignee: "Maya",
  },
  {
    id: "INC-031",
    type: "wrong_location",
    status: "in_progress",
    title: "Emplacement incorrect en Zone B",
    description:
      "Le manteau n'était pas sur la position annoncée. Retrouvé deux positions plus loin, inventaire du rack 22 en cours.",
    depositId: "V-4790",
    createdAt: `${DEMO_DATE}T22:31:00`,
    assignee: "Karim",
  },
  {
    id: "INC-030",
    type: "item_issue",
    status: "resolved",
    title: "Écharpe oubliée dans une manche",
    description:
      "Objet trouvé signalé lors d'un contrôle de rack. Rattaché au dépôt, sera remis au client avec ses affaires.",
    depositId: "V-4761",
    createdAt: `${DEMO_DATE}T21:12:00`,
    resolvedAt: `${DEMO_DATE}T21:40:00`,
    assignee: "Julie",
  },
  {
    id: "INC-029",
    type: "other",
    status: "resolved",
    title: "File d'attente à l'ouverture",
    description:
      "Affluence importante entre 20 h 00 et 20 h 20. Second poste de dépôt ouvert en Zone A.",
    createdAt: `${DEMO_DATE}T20:26:00`,
    resolvedAt: `${DEMO_DATE}T20:39:00`,
    assignee: "Antoine",
  },
];
