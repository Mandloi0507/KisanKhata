import { score as scoreData } from "@/lib/mock-data";

interface Props {
  value?: number;
  max?: number;
  size?: number;
  band?: string;
  bandHi?: string;
  showLabel?: boolean;
  animate?: boolean;
}

/**
 * ScoreGauge — circular KisanScore meter using SVG stroke-dasharray.
 * Color comes from --color-score-* tokens via the band prop.
 */
export function ScoreGauge({
  value = scoreData.value,
  max = scoreData.max,
  size = 220,
  band = scoreData.band,
  bandHi = scoreData.bandHi,
  showLabel = true,
  animate = true,
}: Props) {
  const stroke = 16;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const pct = Math.min(value / max, 1);
  const dash = circ * pct;

  const color =
    value >= 751
      ? "var(--color-score-excellent)"
      : value >= 601
        ? "var(--color-score-good)"
        : value >= 401
          ? "var(--color-score-fair)"
          : "var(--color-score-poor)";

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--color-muted)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{
            transition: animate ? "stroke-dasharray 1.4s cubic-bezier(.22,.9,.3,1)" : undefined,
            filter: `drop-shadow(0 0 12px ${color})`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          KisanScore
        </span>
        <span className="text-5xl font-extrabold tabular-nums text-foreground">
          {value}
        </span>
        <span className="text-xs text-muted-foreground">/ {max}</span>
        {showLabel && (
          <span
            className="mt-2 px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: `color-mix(in oklab, ${color} 18%, white)`, color }}
          >
            {band} · <span lang="hi" className="font-hi">{bandHi}</span>
          </span>
        )}
      </div>
    </div>
  );
}
