import { useEffect, useRef, useState } from "react";
import { bandColorVar, bandFor } from "@/lib/score";
import { cn } from "@/lib/utils";

interface Props {
  score: number;
  size?: number;
  thickness?: number;
  showLabel?: boolean;
  className?: string;
}

export function ScoreGauge({ score, size = 220, thickness = 16, showLabel = true, className }: Props) {
  const band = bandFor(score);
  const color = bandColorVar(band);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  // 3/4 arc
  const arcFraction = 0.75;
  const arcLength = circumference * arcFraction;
  const progress = Math.min(score / 1000, 1);

  const [animated, setAnimated] = useState(0);
  const rafRef = useRef<number>();
  useEffect(() => {
    const start = performance.now();
    const duration = 900;
    const animate = (t: number) => {
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setAnimated(progress * eased);
      if (p < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [progress]);

  const offset = arcLength * (1 - animated);

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size * 0.78 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(135deg)" }}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="hsl(var(--muted))" strokeWidth={thickness} strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={thickness} strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={offset}
          style={{ transition: "stroke 300ms" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
        <div className="font-mono text-5xl font-extrabold tracking-tight" style={{ color }}>
          {Math.round(score)}
        </div>
        <div className="text-xs font-medium text-muted-foreground">out of 1000</div>
        {showLabel && (
          <div className="mt-2 rounded-full px-3 py-0.5 text-xs font-semibold" style={{ backgroundColor: `${color}1A`, color }}>
            {band}
          </div>
        )}
      </div>
    </div>
  );
}
