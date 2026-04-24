import type { ScoreBand } from "./types";

export function bandFor(score: number): ScoreBand {
  if (score >= 751) return "Excellent";
  if (score >= 601) return "Good";
  if (score >= 401) return "Fair";
  return "Poor";
}

export function bandColorVar(band: ScoreBand): string {
  switch (band) {
    case "Excellent": return "hsl(var(--score-excellent))";
    case "Good": return "hsl(var(--score-good))";
    case "Fair": return "hsl(var(--score-fair))";
    case "Poor": return "hsl(var(--score-poor))";
  }
}

export function bandTextClass(band: ScoreBand): string {
  switch (band) {
    case "Excellent": return "text-score-excellent";
    case "Good": return "text-score-good";
    case "Fair": return "text-score-fair";
    case "Poor": return "text-score-poor";
  }
}

export function bandBgClass(band: ScoreBand): string {
  switch (band) {
    case "Excellent": return "bg-score-excellent/10 text-score-excellent border-score-excellent/30";
    case "Good": return "bg-score-good/10 text-score-good border-score-good/30";
    case "Fair": return "bg-score-fair/10 text-score-fair border-score-fair/30";
    case "Poor": return "bg-score-poor/10 text-score-poor border-score-poor/30";
  }
}

export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export const formatINRCompact = (n: number) => {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  if (n >= 1e3) return `₹${(n / 1e3).toFixed(1)}K`;
  return `₹${n}`;
};
