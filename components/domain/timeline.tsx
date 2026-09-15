import {
  Check,
  Eye,
  MapPin,
  PackagePlus,
  Send,
  StickyNote,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties } from "react";

import { cn } from "@/lib/cn";
import { formatTime } from "@/lib/format";
import type { TimelineEvent, TimelineKind } from "@/lib/types";

const ICONS: Record<TimelineKind, LucideIcon> = {
  created: PackagePlus,
  assigned: MapPin,
  sent: Send,
  viewed: Eye,
  returned: Check,
  incident: TriangleAlert,
  note: StickyNote,
};

const TONES: Record<TimelineKind, string> = {
  created: "bg-accent-soft text-accent border-accent-line",
  assigned: "bg-subtle text-muted border-line",
  sent: "bg-subtle text-muted border-line",
  viewed: "bg-subtle text-muted border-line",
  returned: "bg-positive-soft text-positive border-positive-line",
  incident: "bg-danger-soft text-danger border-danger-line",
  note: "bg-subtle text-muted border-line",
};

export function Timeline({ events }: { events: TimelineEvent[] }) {
  const ordered = [...events].sort((a, b) => (a.at < b.at ? -1 : 1));

  return (
    <ol className="relative space-y-0">
      {ordered.map((event, index) => {
        const Icon = ICONS[event.kind] ?? StickyNote;
        const isLast = index === ordered.length - 1;
        return (
          <li
            key={`${event.at}-${event.label}-${index}`}
            className="stagger relative flex gap-3 pb-5 last:pb-0"
            style={{ "--d": `${index * 60}ms` } as CSSProperties}
          >
            {!isLast && (
              <span
                className="absolute top-8 left-[15px] h-[calc(100%-1rem)] w-px bg-line"
                aria-hidden
              />
            )}
            <span
              className={cn(
                "relative z-10 grid size-8 shrink-0 place-items-center rounded-full border",
                TONES[event.kind],
              )}
            >
              <Icon size={14} strokeWidth={2.2} aria-hidden />
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <p className="text-[13.5px] font-medium text-ink">
                  {event.label}
                </p>
                <span className="tabular text-[12px] text-faint">
                  {formatTime(event.at)}
                </span>
              </div>
              {event.detail && (
                <p className="mt-0.5 text-[12.5px] leading-snug text-muted">
                  {event.detail}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
