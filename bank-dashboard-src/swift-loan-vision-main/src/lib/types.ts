// Domain types — shaped to match future API responses

export type ScoreBand = "Poor" | "Fair" | "Good" | "Excellent";
export type ApplicationStatus = "Pending" | "Approved" | "Rejected" | "In Review";
export type DistressStatus = "Active" | "Acknowledged" | "Resolved";

export interface SubScore {
  key: "crop_health" | "rainfall_risk" | "income_potential" | "scheme_enrolment";
  label: string;
  value: number;       // 0-200
  max: number;
  trend?: "up" | "down" | "flat";
}

export interface XAIFactor {
  label: string;
  contribution: number; // -100..+100
  direction: "positive" | "negative";
  detail?: string;
}

export interface LedgerCheck {
  status: "clear" | "duplicate";
  bankName?: string;
  checkedAt: string;
}

export interface LoanRecommendation {
  amountMin: number;
  amountMax: number;
  rate: number; // % p.a.
  tenureMonths: number;
}

export interface Farmer {
  id: string;
  name: string;
  aadhaarMasked: string;       // XXXXXXXX1234
  district: string;
  state: string;
  primaryCrop: string;
  secondaryCrop?: string;
  landAcres: number;
  phone: string;
}

export interface Application {
  id: string;
  farmer: Farmer;
  submittedAt: string;
  score: number;               // 0-1000
  band: ScoreBand;
  subScores: SubScore[];
  xai: XAIFactor[];
  summary: string;             // Claude-generated
  recommendation: LoanRecommendation;
  requestedAmount: number;
  ledger: LedgerCheck;
  distress: DistressStatus | null;
  status: ApplicationStatus;
  scoreHistory: { season: string; score: number }[];
}

export interface PortfolioMetrics {
  totalApplications: number;
  approvalRate: number;        // 0-1
  avgApprovedScore: number;
  activeDistress: number;
  monthlyTrend: { month: string; applications: number; approvals: number }[];
  byDistrict: { district: string; count: number }[];
  byBand: { band: ScoreBand; count: number }[];
}
