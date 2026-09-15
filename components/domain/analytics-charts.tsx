"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Skeleton } from "@/components/ui/states";
import type { DurationBucket, HourPoint, OccupancyPoint } from "@/lib/stats";
import { useHydrated } from "@/lib/use-hydrated";

/* Palette validée pour la vision des couleurs : ΔE 32,7 (deutan) entre les
 * deux séries, au-dessus du seuil de 8 exigé pour une paire adjacente. */
const ACCENT = "#1f5aff";
const POSITIVE = "#17a34a";
const GRID = "#e5e8ee";
const AXIS_TEXT = "#8d99ad";

const AXIS_TICK = { fontSize: 11, fill: AXIS_TEXT };

interface TooltipEntry {
  name?: string;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
}

function ChartTooltip({
  active,
  payload,
  label,
  suffix = "",
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
  suffix?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 shadow-md">
      <p className="tabular text-[11.5px] font-semibold text-ink">{label}</p>
      <ul className="mt-1 space-y-0.5">
        {payload.map((entry) => (
          <li
            key={String(entry.dataKey)}
            className="flex items-center gap-2 text-[12px] text-muted"
          >
            <span
              className="size-2 shrink-0 rounded-[2px]"
              style={{ background: entry.color }}
              aria-hidden
            />
            <span>{entry.name}</span>
            <span className="tabular ml-auto font-semibold text-ink">
              {entry.value}
              {suffix}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FlowChart({ data }: { data: HourPoint[] }) {
  // Les graphiques mesurent leur conteneur : ils ne sont rendus qu'après
  // l'hydratation, ce qui évite tout écart entre serveur et navigateur.
  const mounted = useHydrated();
  if (!mounted) return <Skeleton className="h-[260px] w-full" />;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -20 }} barGap={2}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={{ stroke: GRID }}
          tick={AXIS_TICK}
        />
        <YAxis tickLine={false} axisLine={false} tick={AXIS_TICK} width={44} />
        <Tooltip
          cursor={{ fill: "rgba(31,90,255,0.06)" }}
          content={<ChartTooltip />}
        />
        <Legend
          verticalAlign="top"
          align="right"
          height={28}
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, color: AXIS_TEXT }}
        />
        <Bar
          dataKey="depots"
          name="Dépôts"
          fill={ACCENT}
          radius={[4, 4, 0, 0]}
          maxBarSize={18}
        />
        <Bar
          dataKey="restitutions"
          name="Restitutions"
          fill={POSITIVE}
          radius={[4, 4, 0, 0]}
          maxBarSize={18}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function OccupancyChart({ data }: { data: OccupancyPoint[] }) {
  const mounted = useHydrated();
  if (!mounted) return <Skeleton className="h-[240px] w-full" />;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="occupancyFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ACCENT} stopOpacity={0.22} />
            <stop offset="100%" stopColor={ACCENT} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={{ stroke: GRID }}
          tick={AXIS_TICK}
        />
        <YAxis tickLine={false} axisLine={false} tick={AXIS_TICK} width={44} />
        <Tooltip
          cursor={{ stroke: ACCENT, strokeWidth: 1, strokeDasharray: "3 3" }}
          content={<ChartTooltip />}
        />
        <Area
          type="monotone"
          dataKey="occupation"
          name="Places occupées"
          stroke={ACCENT}
          strokeWidth={2}
          fill="url(#occupancyFill)"
          activeDot={{ r: 4, strokeWidth: 2, stroke: "#ffffff" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function DurationChart({ data }: { data: DurationBucket[] }) {
  const mounted = useHydrated();
  if (!mounted) return <Skeleton className="h-[220px] w-full" />;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -20 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={{ stroke: GRID }}
          tick={AXIS_TICK}
        />
        <YAxis tickLine={false} axisLine={false} tick={AXIS_TICK} width={44} />
        <Tooltip
          cursor={{ fill: "rgba(31,90,255,0.06)" }}
          content={<ChartTooltip />}
        />
        <Bar
          dataKey="value"
          name="Dépôts"
          fill={ACCENT}
          radius={[4, 4, 0, 0]}
          maxBarSize={44}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
