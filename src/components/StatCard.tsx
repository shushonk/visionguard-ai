import React from "react";
import { cn } from "../lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
  color?: "blue" | "emerald" | "red" | "orange" | "purple";
}

const colorMaps = {
  blue: {
    bg: "bg-blue-500/10",
    text: "text-blue-500",
    border: "border-blue-500/20",
    glow: "group-hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
    border: "border-emerald-500/20",
    glow: "group-hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]",
  },
  red: {
    bg: "bg-red-500/10",
    text: "text-red-500",
    border: "border-red-500/20",
    glow: "group-hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]",
  },
  orange: {
    bg: "bg-orange-500/10",
    text: "text-orange-500",
    border: "border-orange-500/20",
    glow: "group-hover:shadow-[0_0_20px_rgba(249,115,22,0.15)]",
  },
  purple: {
    bg: "bg-purple-500/10",
    text: "text-purple-500",
    border: "border-purple-500/20",
    glow: "group-hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]",
  },
};

export function StatCard({ title, value, icon: Icon, trend, trendUp, color = "blue" }: StatCardProps) {
  const styles = colorMaps[color];

  return (
    <div className={cn(
      "group relative overflow-hidden bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-xl p-5 transition-all duration-300",
      "hover:-translate-y-1 hover:border-slate-700",
      styles.glow
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-2.5 rounded-lg border", styles.bg, styles.border, styles.text)}>
          <Icon size={20} />
        </div>
        {trend && (
          <div className={cn(
            "text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1",
            trendUp ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10"
          )}>
            {trendUp ? "↑" : "↓"} {trend}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">{title}</h3>
        <p className="text-2xl font-bold text-slate-100 font-mono tracking-tight">{value}</p>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
}
