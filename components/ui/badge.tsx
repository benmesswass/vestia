import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import type { DepositStatus, IncidentStatus } from "@/lib/types";

export type BadgeTone =
  | "neutral"
  | "accent"
  | "positive"
  | "warn"
  | "danger"
  | "navy";

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-subtle text-muted border-line",
  accent: "bg-accent-soft text-accent border-accent-line",
  positive: "bg-positive-soft text-positive border-positive-line",
  warn: "bg-warn-soft text-warn border-warn-line",
  danger: "bg-danger-soft text-danger border-danger-line",
  navy: "bg-navy text-white border-navy",
};

export function Badge({
  tone = "neutral",
  children,
  className,
  dot = false,
}: {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5",
        "text-[11px] font-semibold tracking-wide uppercase",
        TONES[tone],
        className,
      )}
    >
      {dot && (
        <span className="size-1.5 rounded-full bg-current" aria-hidden />
      )}
      {children}
    </span>
  );
}

const DEPOSIT_STATUS: Record<DepositStatus, { label: string; tone: BadgeTone }> =
  {
    active: { label: "Actif", tone: "accent" },
    returned: { label: "Restitué", tone: "positive" },
    incident: { label: "Incident", tone: "danger" },
  };

export function StatusBadge({
  status,
  className,
}: {
  status: DepositStatus;
  className?: string;
}) {
  const config = DEPOSIT_STATUS[status];
  return (
    <Badge tone={config.tone} className={className} dot>
      {config.label}
    </Badge>
  );
}

const INCIDENT_STATUS: Record<
  IncidentStatus,
  { label: string; tone: BadgeTone }
> = {
  open: { label: "Ouvert", tone: "danger" },
  in_progress: { label: "En cours", tone: "warn" },
  resolved: { label: "Résolu", tone: "positive" },
};

export function IncidentStatusBadge({ status }: { status: IncidentStatus }) {
  const config = INCIDENT_STATUS[status];
  return (
    <Badge tone={config.tone} dot>
      {config.label}
    </Badge>
  );
}

export const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  open: "Ouvert",
  in_progress: "En cours",
  resolved: "Résolu",
};

export const DEPOSIT_STATUS_LABELS: Record<DepositStatus, string> = {
  active: "Actif",
  returned: "Restitué",
  incident: "Incident",
};
