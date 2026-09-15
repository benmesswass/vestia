"use client";

import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

import { cn } from "@/lib/cn";

export type KpiTone = "accent" | "positive" | "warn" | "danger" | "neutral";

const ICON_TONES: Record<KpiTone, string> = {
  accent: "bg-accent-soft text-accent",
  positive: "bg-positive-soft text-positive",
  warn: "bg-warn-soft text-warn",
  danger: "bg-danger-soft text-danger",
  neutral: "bg-subtle text-muted",
};

const BAR_TONES: Record<KpiTone, string> = {
  accent: "bg-accent",
  positive: "bg-positive",
  warn: "bg-warn",
  danger: "bg-danger",
  neutral: "bg-line-strong",
};

export function KpiCard({
  label,
  value,
  unit,
  hint,
  icon: Icon,
  tone = "neutral",
  trend,
  /** Remplissage de la barre, entre 0 et 1. */
  ratio,
  delay = 0,
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  hint?: string;
  icon: LucideIcon;
  tone?: KpiTone;
  trend?: { value: string; positive: boolean };
  ratio?: number;
  delay?: number;
}) {
  // La barre s'anime après le montage : le HTML serveur et client restent
  // identiques, et la statistique « arrive » visuellement.
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const timer = window.setTimeout(
      () => setWidth(Math.min(1, Math.max(0, ratio ?? 0))),
      60 + delay,
    );
    return () => window.clearTimeout(timer);
  }, [ratio, delay]);

  return (
    <div
      className="stagger rounded-card border border-line bg-surface p-4 shadow-xs transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-md"
      style={{ "--d": `${delay}ms` } as CSSProperties}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[12.5px] font-medium text-muted">{label}</p>
        <span
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-lg",
            ICON_TONES[tone],
          )}
        >
          <Icon size={15} strokeWidth={2.2} aria-hidden />
        </span>
      </div>

      <p className="mt-2.5 flex items-baseline gap-1">
        <span className="tabular text-[26px] leading-none font-semibold tracking-[-0.03em] text-ink">
          {value}
        </span>
        {unit && (
          <span className="text-[13px] font-medium text-faint">{unit}</span>
        )}
      </p>

      <div className="mt-2.5 flex items-center gap-2">
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-[12px] font-medium",
              trend.positive ? "text-positive" : "text-danger",
            )}
          >
            {trend.positive ? (
              <TrendingUp size={13} aria-hidden />
            ) : (
              <TrendingDown size={13} aria-hidden />
            )}
            {trend.value}
          </span>
        )}
        {hint && <span className="truncate text-[12px] text-faint">{hint}</span>}
      </div>

      {ratio !== undefined && (
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-subtle">
          <div
            className={cn("h-full rounded-full transition-[width] duration-700 ease-out", BAR_TONES[tone])}
            style={{ width: `${width * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}
