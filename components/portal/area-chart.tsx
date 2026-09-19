"use client";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { DtSeriesPoint } from "@/lib/dynatrace/types";

interface AreaChartProps {
  points: DtSeriesPoint[];
  /** Render width in CSS units; height scales to maintain ratio. */
  height?: number;
  /** Color tint — green/red/cyan based on health. */
  tone?: "good" | "warn" | "neutral";
  /** Y-axis suffix for ticks ("%", "ms", ""). */
  unit?: string;
  className?: string;
}

const TONES = {
  good:    { stroke: "#34d399", fill: "rgba(52, 211, 153, 0.18)" },   // emerald-400
  warn:    { stroke: "#fbbf24", fill: "rgba(251, 191, 36, 0.18)" },   // amber-400
  neutral: { stroke: "#06b6d4", fill: "rgba(6, 182, 212, 0.18)" },    // brand cyan
} as const;

export function AreaChart({ points, height = 180, tone = "neutral", unit = "", className }: AreaChartProps) {
  const { pathLine, pathArea, yTicks, minDisplay, maxDisplay } = useMemo(() => {
    if (!points || points.length === 0) {
      return { pathLine: "", pathArea: "", yTicks: [] as number[], minDisplay: "", maxDisplay: "" };
    }
    const vs = points.map((p) => p.v);
    const min = Math.min(...vs);
    const max = Math.max(...vs);
    const range = Math.max(max - min, 1);
    // Pad bounds by 8% so the line doesn't touch top/bottom
    const padded = range * 0.08;
    const yMin = min - padded;
    const yMax = max + padded;
    const yRange = yMax - yMin;

    // Map (i, v) → (x, y) in viewBox 100 × 100
    const xs = points.map((_, i) => (i / (points.length - 1)) * 100);
    const ys = points.map((p) => 100 - ((p.v - yMin) / yRange) * 100);

    let line = "";
    let area = "";
    for (let i = 0; i < points.length; i++) {
      const cmd = i === 0 ? "M" : "L";
      line += `${cmd}${xs[i].toFixed(2)},${ys[i].toFixed(2)} `;
    }
    area = line + `L100,100 L0,100 Z`;

    // Pick 3 y-ticks: min, mid, max of the actual data range
    const ticks = [max, (max + min) / 2, min];
    const fmt = (v: number) =>
      unit === "%" ? `${v.toFixed(0)}${unit}` :
      unit === "ms" ? `${Math.round(v)} ms` :
      unit === ""    ? v.toFixed(1) :
      `${v.toFixed(1)} ${unit}`;

    return {
      pathLine: line.trim(),
      pathArea: area,
      yTicks: ticks,
      minDisplay: fmt(min),
      maxDisplay: fmt(max),
    };
  }, [points, unit]);

  const t = TONES[tone];

  if (points.length === 0) {
    return <div className={cn("w-full", className)} style={{ height }} />;
  }

  return (
    <div className={cn("relative w-full", className)} style={{ height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
        {/* Grid lines at 25/50/75% */}
        {[25, 50, 75].map((y) => (
          <line key={y} x1="0" y1={y} x2="100" y2={y}
            stroke="currentColor" strokeOpacity="0.06" strokeWidth="0.4"
            className="text-white" vectorEffect="non-scaling-stroke" />
        ))}
        <path d={pathArea} fill={t.fill} />
        <path d={pathLine} fill="none" stroke={t.stroke} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
      </svg>
      {/* Y-axis labels (top-left and bottom-left) */}
      <div className="absolute top-1 left-1 font-mono text-[10px] text-slate-500">{maxDisplay}</div>
      <div className="absolute bottom-1 left-1 font-mono text-[10px] text-slate-500">{minDisplay}</div>
      {/* Suppress yTicks rendering (kept in memo for future tooltip work) */}
      <span className="sr-only">{yTicks.length} ticks</span>
    </div>
  );
}
