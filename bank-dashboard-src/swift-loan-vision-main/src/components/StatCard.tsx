import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "flat";
  icon?: LucideIcon;
  accent?: "green" | "teal" | "earth" | "muted";
  className?: string;
}

const ACCENT: Record<NonNullable<Props["accent"]>, string> = {
  green: "bg-primary/10 text-primary-700",
  teal:  "bg-teal-500/10 text-teal-600",
  earth: "bg-earth-300/15 text-earth-500",
  muted: "bg-muted text-muted-foreground",
};

export function StatCard({ label, value, delta, trend = "flat", icon: Icon, accent = "green", className }: Props) {
  const trendColor = trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground";
  return (
    <div className={cn("rounded-2xl border bg-card p-5 shadow-elev-sm transition hover:shadow-elev-md", className)}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="mt-2 font-mono text-3xl font-bold tracking-tight text-foreground">{value}</div>
          {delta && <div className={cn("mt-1 text-xs font-medium", trendColor)}>{delta}</div>}
        </div>
        {Icon && (
          <div className={cn("grid h-10 w-10 place-items-center rounded-xl", ACCENT[accent])}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}
