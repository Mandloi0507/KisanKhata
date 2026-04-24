/**
 * KisanKhata Backend API client for Farmer App.
 */

const API_BASE = "http://localhost:8002/api/v1";

// ─── Farmer Registration ───

export interface RegisterPayload {
  full_name: string;
  aadhaar_number: string;
  mobile_number: string;
  state: string;
  district: string;
  primary_crop: string;
  secondary_crop?: string;
  land_area_acres: number;
  preferred_language?: string;
}

export async function registerFarmer(data: RegisterPayload) {
  const res = await fetch(`${API_BASE}/farmers/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail?.message || "Registration failed");
  }
  return res.json() as Promise<{
    farmer_id: string;
    message: string;
    score_status: string;
    estimated_wait_seconds: number;
  }>;
}

// ─── Score Status Polling ───

export async function pollScoreStatus(farmerId: string) {
  const res = await fetch(`${API_BASE}/scores/${farmerId}/status`);
  if (!res.ok) throw new Error("Failed to poll score");
  return res.json() as Promise<{
    status: string;
    score?: number;
    score_category?: string;
  }>;
}

// ─── Dashboard ───

export async function fetchDashboard(farmerId: string) {
  const res = await fetch(`${API_BASE}/farmers/${farmerId}/dashboard`);
  if (!res.ok) throw new Error("Dashboard fetch failed");
  return res.json();
}

// ─── Score History ───

export async function fetchScoreHistory(farmerId: string) {
  const res = await fetch(`${API_BASE}/farmers/${farmerId}/score-history`);
  if (!res.ok) throw new Error("Score history fetch failed");
  return res.json();
}

// ─── XAI Report ───

export async function fetchXAIReport(farmerId: string) {
  const res = await fetch(`${API_BASE}/farmers/${farmerId}/xai-report`);
  if (!res.ok) throw new Error("XAI report fetch failed");
  return res.json();
}

// ─── Benchmark ───

export async function fetchBenchmark(farmerId: string) {
  const res = await fetch(`${API_BASE}/farmers/${farmerId}/benchmark`);
  if (!res.ok) throw new Error("Benchmark fetch failed");
  return res.json();
}

// ─── Current farmer session ───

const FARMER_SESSION_KEY = "kk_farmer_id";

export function getCurrentFarmerId(): string | null {
  return localStorage.getItem(FARMER_SESSION_KEY);
}

export function setCurrentFarmerId(id: string) {
  localStorage.setItem(FARMER_SESSION_KEY, id);
}
