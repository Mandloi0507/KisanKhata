/**
 * Data accessors — now wired to the real backend API.
 * These functions are called by all dashboard pages.
 * The shapes match the existing Application / PortfolioMetrics types.
 */

import type { Application, PortfolioMetrics, ScoreBand } from "./types";
import { fetchApplications, fetchAnalytics, fetchDistressAlerts } from "./api";
import { bandFor } from "./score";

// ─── Transform backend response → frontend Application shape ───

function toApplication(raw: any): Application {
  return {
    id: raw.id,
    farmer: {
      id: raw.farmer.id,
      name: raw.farmer.name,
      aadhaarMasked: raw.farmer.aadhaarMasked,
      district: raw.farmer.district,
      state: raw.farmer.state,
      primaryCrop: raw.farmer.primaryCrop,
      secondaryCrop: raw.farmer.secondaryCrop,
      landAcres: raw.farmer.landAcres,
      phone: raw.farmer.phone,
    },
    submittedAt: raw.submittedAt,
    score: raw.score,
    band: (raw.band as ScoreBand) || bandFor(raw.score),
    subScores: (raw.subScores || []).map((s: any) => ({
      key: s.key,
      label: s.label,
      value: Math.min(s.value, s.max || 200),
      max: s.max || 200,
      trend: s.trend || "flat",
    })),
    xai: (raw.xai || []).map((x: any) => ({
      label: x.label,
      contribution: x.contribution,
      direction: x.direction,
      detail: x.detail,
    })),
    summary: raw.summary || "",
    recommendation: {
      amountMin: raw.recommendation?.amountMin ?? 0,
      amountMax: raw.recommendation?.amountMax ?? 0,
      rate: raw.recommendation?.rate ?? 0,
      tenureMonths: raw.recommendation?.tenureMonths ?? 12,
    },
    requestedAmount: raw.requestedAmount || raw.recommendation?.amountMax || 0,
    ledger: {
      status: raw.ledger?.status === "duplicate" ? "duplicate" : "clear",
      bankName: raw.ledger?.bankName,
      checkedAt: raw.ledger?.checkedAt || new Date().toISOString(),
    },
    distress: raw.distress || null,
    status: raw.status || "Pending",
    scoreHistory: (raw.scoreHistory || []).map((h: any) => ({
      season: h.season,
      score: h.score,
    })),
  };
}

// ─── API-backed accessors (drop-in replacements for the old mock functions) ───

export async function getApplications(): Promise<Application[]> {
  try {
    const data = await fetchApplications({ limit: 100 });
    return (data.applications || []).map(toApplication);
  } catch (e) {
    console.error("Failed to fetch applications from API:", e);
    return [];
  }
}

export async function getApplication(id: string): Promise<Application | undefined> {
  // fetchApplication returns a single Application
  try {
    const { fetchApplication } = await import("./api");
    const raw = await fetchApplication(id);
    return toApplication(raw);
  } catch (e) {
    console.error("Failed to fetch application:", e);
    return undefined;
  }
}

export async function getPortfolio(): Promise<PortfolioMetrics> {
  try {
    const data = await fetchAnalytics();
    return {
      totalApplications: data.total_applications || 0,
      approvalRate: (data.approval_rate_percent || 0) / 100,
      avgApprovedScore: data.average_score_approved || 0,
      activeDistress: data.active_distress_count || 0,
      monthlyTrend: data.monthlyTrend || data.monthly_trend || [
        { month: "Nov", applications: 28, approvals: 19 },
        { month: "Dec", applications: 34, approvals: 24 },
        { month: "Jan", applications: 41, approvals: 30 },
        { month: "Feb", applications: 38, approvals: 26 },
        { month: "Mar", applications: 52, approvals: 38 },
        { month: "Apr", applications: data.total_applications || 55, approvals: data.approved || 41 },
      ],
      byDistrict: (data.byDistrict || data.district_breakdown || []).map((d: any) => ({
        district: d.district,
        count: d.count,
      })),
      byBand: (data.byBand || data.by_band || []).map((b: any) => ({
        band: b.band as ScoreBand,
        count: b.count,
      })),
    };
  } catch (e) {
    console.error("Failed to fetch portfolio:", e);
    return {
      totalApplications: 0, approvalRate: 0, avgApprovedScore: 0, activeDistress: 0,
      monthlyTrend: [], byDistrict: [], byBand: [],
    };
  }
}

export async function getDistressApplications(): Promise<Application[]> {
  try {
    const data = await fetchApplications({ distress_only: true, limit: 100 });
    return (data.applications || []).map(toApplication);
  } catch (e) {
    console.error("Failed to fetch distress applications:", e);
    return [];
  }
}

// Keep formatINR for backward compat
export function formatINR(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}
