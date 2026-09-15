/**
 * Formatage des dates, durées et libellés.
 *
 * Règle d'or : aucune API sensible au fuseau horaire n'est utilisée au rendu.
 * Les horodatages sont des chaînes ISO locales « naïves » découpées à la main,
 * ce qui garantit exactement le même HTML côté serveur et côté navigateur.
 */

/** Jour de référence de la démo : un samedi. */
export const DEMO_DATE = "2026-09-12";

/** Heure de référence de la démo : samedi soir, en plein rush. */
export const DEMO_NOW = `${DEMO_DATE}T23:12:00`;

const MONTHS_SHORT = [
  "janv.",
  "févr.",
  "mars",
  "avr.",
  "mai",
  "juin",
  "juil.",
  "août",
  "sept.",
  "oct.",
  "nov.",
  "déc.",
];

const MONTHS_LONG = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

const WEEKDAYS = [
  "dimanche",
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
];

/** Horloge de démo : figée au boot, puis avance à la vitesse réelle. */
const REAL_BOOT = Date.now();
const DEMO_BOOT = new Date(DEMO_NOW).getTime();

/** Instant courant dans le référentiel de la démo (ISO local naïf). */
export function demoNow(): string {
  return toNaiveIso(new Date(DEMO_BOOT + (Date.now() - REAL_BOOT)));
}

/** Convertit une `Date` en ISO local naïf (`2026-09-12T22:43:00`). */
export function toNaiveIso(date: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}` +
    `T${p(date.getHours())}:${p(date.getMinutes())}:${p(date.getSeconds())}`
  );
}

/** `22:43` */
export function formatTime(iso: string): string {
  return iso.slice(11, 16);
}

/** `14 sept.` */
export function formatDayMonth(iso: string): string {
  const month = Number(iso.slice(5, 7)) - 1;
  return `${Number(iso.slice(8, 10))} ${MONTHS_SHORT[month] ?? ""}`;
}

/** `samedi 14 septembre 2026` */
export function formatDateLong(iso: string): string {
  const date = new Date(iso);
  const month = Number(iso.slice(5, 7)) - 1;
  return (
    `${WEEKDAYS[date.getDay()]} ${Number(iso.slice(8, 10))} ` +
    `${MONTHS_LONG[month] ?? ""} ${iso.slice(0, 4)}`
  );
}

/** `14 sept. · 22:43` */
export function formatDateTime(iso: string): string {
  return `${formatDayMonth(iso)} · ${formatTime(iso)}`;
}

export function minutesBetween(fromIso: string, toIso: string): number {
  return Math.round(
    (new Date(toIso).getTime() - new Date(fromIso).getTime()) / 60000,
  );
}

/** `48 min`, `1 h 24`, `2 j` */
export function formatDuration(minutes: number): string {
  const safe = Math.max(0, Math.round(minutes));
  if (safe < 60) return `${safe} min`;
  const hours = Math.floor(safe / 60);
  const rest = safe % 60;
  if (hours < 24) {
    return rest === 0 ? `${hours} h` : `${hours} h ${String(rest).padStart(2, "0")}`;
  }
  return `${Math.floor(hours / 24)} j`;
}

/** `il y a 29 min` */
export function formatRelative(iso: string, reference: string): string {
  const minutes = minutesBetween(iso, reference);
  if (minutes < 1) return "à l'instant";
  return `il y a ${formatDuration(minutes)}`;
}

/** `Zone B · Rack 24 · Position 8` */
export function formatLocation(location: {
  zone: string;
  rack: number;
  position: number;
}): string {
  return `Zone ${location.zone} · Rack ${location.rack} · Position ${location.position}`;
}

/** `B24-08` — format court pour les tableaux. */
export function formatLocationShort(location: {
  zone: string;
  rack: number;
  position: number;
}): string {
  return `${location.zone}${location.rack}-${String(location.position).padStart(2, "0")}`;
}

/** Met la première lettre en majuscule, sans toucher au reste de la phrase. */
export function capitalizeFirst(value: string): string {
  return value.length === 0 ? value : value[0].toUpperCase() + value.slice(1);
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** `06 12 34 56 78` */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length !== 10) return phone;
  return digits.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
}
