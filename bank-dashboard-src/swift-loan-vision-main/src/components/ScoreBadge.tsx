import { Badge } from "@/components/ui/badge";
import { bandBgClass } from "@/lib/score";
import type { ScoreBand } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ScoreBadge({ band, score, className }: { band: ScoreBand; score?: number; className?: string }) {
  return (
    <Badge variant="outline" className={cn("gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-xs font-semibold", bandBgClass(band), className)}>
      {score !== undefined && <span>{score}</span>}
      <span className="font-sans">{band}</span>
    </Badge>
  );
}
