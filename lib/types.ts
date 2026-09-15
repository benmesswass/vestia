/**
 * Modèle de domaine VESTIA.
 *
 * Les horodatages sont stockés en ISO local « naïf » (`2026-09-12T22:43:00`),
 * sans fuseau : c'est ce qui garantit un rendu identique côté serveur et côté
 * client (pas de décalage d'hydratation) — voir `lib/format.ts`.
 */

export type DepositStatus = "active" | "returned" | "incident";

export type ItemKind =
  | "coat"
  | "bag"
  | "jacket"
  | "helmet"
  | "umbrella"
  | "other";

export interface DepositItem {
  kind: ItemKind;
  /** Libellé affiché au client, ex. « Manteau noir ». */
  label: string;
}

export interface StorageLocation {
  /** Zone du vestiaire, ex. « B ». */
  zone: string;
  rack: number;
  position: number;
}

export type TimelineKind =
  | "created"
  | "assigned"
  | "sent"
  | "viewed"
  | "returned"
  | "incident"
  | "note";

export interface TimelineEvent {
  at: string;
  kind: TimelineKind;
  label: string;
  detail?: string;
}

export type TicketChannel = "qr" | "sms" | "whatsapp" | "email" | "wallet";

export interface Deposit {
  id: string;
  customerId: string;
  items: DepositItem[];
  location: StorageLocation;
  depositedAt: string;
  returnedAt?: string;
  status: DepositStatus;
  staff: string;
  channels: TicketChannel[];
  timeline: TimelineEvent[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  since: string;
  vip: boolean;
}

export type IncidentType =
  | "lost_ticket"
  | "item_issue"
  | "wrong_location"
  | "other";

export type IncidentStatus = "open" | "in_progress" | "resolved";

export interface Incident {
  id: string;
  type: IncidentType;
  status: IncidentStatus;
  title: string;
  description: string;
  depositId?: string;
  customerId?: string;
  createdAt: string;
  resolvedAt?: string;
  assignee: string;
}

export interface Zone {
  id: string;
  name: string;
  racks: number[];
  positionsPerRack: number;
}

export interface Venue {
  name: string;
  type: string;
  city: string;
  capacity: number;
  zones: Zone[];
}

export interface StaffUser {
  name: string;
  role: string;
  initials: string;
}

export interface AppSettings {
  venueName: string;
  autoAssignLocation: boolean;
  requirePhone: boolean;
  smsEnabled: boolean;
  whatsappEnabled: boolean;
  walletEnabled: boolean;
  closingReminder: boolean;
  ticketPrefix: string;
}
