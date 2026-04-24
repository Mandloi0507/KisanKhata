/**
 * KisanKhata Backend API client for Bank Dashboard.
 * Replaces all mock-data accessors with real fetch() calls.
 */

const API_BASE = "http://localhost:8002/api/v1";

// ─── Token management ───

function getToken(): string | null {
  try {
    const session = localStorage.getItem("kk_banker_jwt");
    return session ? JSON.parse(session).access_token : null;
  } catch { return null; }
}

function getRefreshToken(): string | null {
  try {
    const session = localStorage.getItem("kk_banker_jwt");
    return session ? JSON.parse(session).refresh_token : null;
  } catch { return null; }
}

export function saveTokens(data: { access_token: string; refresh_token: string }) {
  localStorage.setItem("kk_banker_jwt", JSON.stringify(data));
}

export function clearTokens() {
  localStorage.removeItem("kk_banker_jwt");
}

// ─── Base fetch with auth ───

async function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  // Try refresh on 401
  if (res.status === 401) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        const old = JSON.parse(localStorage.getItem("kk_banker_jwt") || "{}");
        saveTokens({ ...old, access_token: data.access_token });
        // Retry original request
        headers["Authorization"] = `Bearer ${data.access_token}`;
        return fetch(`${API_BASE}${path}`, { ...options, headers });
      }
    }
    clearTokens();
    window.location.href = "/auth";
  }

  return res;
}

// ─── Auth API ───

export async function loginAPI(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail?.message || "Login failed");
  }
  return res.json();
}

export async function registerAPI(name: string, email: string, password: string, branch: string) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ full_name: name, email, password, bank_code: "NGB001", branch }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail?.message || "Registration failed");
  }
  return res.json();
}

export async function logoutAPI() {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    }).catch(() => {});
  }
  clearTokens();
}

// ─── Applications API ───

export async function fetchApplications(params?: {
  page?: number; limit?: number; status?: string;
  score_category?: string; district?: string; distress_only?: boolean;
}) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", params.page.toString());
  if (params?.limit) searchParams.set("limit", params.limit.toString());
  if (params?.status) searchParams.set("status", params.status.toLowerCase());
  if (params?.score_category) searchParams.set("score_category", params.score_category);
  if (params?.district) searchParams.set("district", params.district);
  if (params?.distress_only) searchParams.set("distress_only", "true");

  const qs = searchParams.toString();
  const res = await authFetch(`/bank/applications${qs ? "?" + qs : ""}`);
  if (!res.ok) throw new Error("Failed to fetch applications");
  return res.json();
}

export async function fetchApplication(id: string) {
  const res = await authFetch(`/bank/applications/${id}`);
  if (!res.ok) throw new Error("Failed to fetch application");
  return res.json();
}

export async function submitDecision(applicationId: string, decision: {
  decision: "approved" | "rejected";
  approved_amount_inr?: number;
  approved_rate_percent?: number;
  comment: string;
}) {
  const res = await authFetch(`/bank/applications/${applicationId}/decide`, {
    method: "POST",
    body: JSON.stringify(decision),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail?.message || "Decision failed");
  }
  return res.json();
}

// ─── Analytics API ───

export async function fetchAnalytics() {
  const res = await authFetch("/bank/analytics");
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return res.json();
}

// ─── Distress API ───

export async function fetchDistressAlerts(status = "active") {
  const res = await authFetch(`/bank/distress/?status=${status}`);
  if (!res.ok) throw new Error("Failed to fetch distress alerts");
  return res.json();
}

export async function acknowledgeDistress(id: string, actionNote: string) {
  const res = await authFetch(`/bank/distress/${id}/acknowledge`, {
    method: "POST",
    body: JSON.stringify({ action_note: actionNote, new_status: "in_progress" }),
  });
  if (!res.ok) throw new Error("Failed to acknowledge distress");
  return res.json();
}

export async function resolveDistress(id: string, note: string, isFalsePositive = false) {
  const res = await authFetch(`/bank/distress/${id}/resolve`, {
    method: "POST",
    body: JSON.stringify({ resolution_note: note, is_false_positive: isFalsePositive }),
  });
  if (!res.ok) throw new Error("Failed to resolve distress");
  return res.json();
}

// ─── Export ───

export async function exportCSV() {
  const res = await authFetch("/bank/applications/export");
  if (!res.ok) throw new Error("Export failed");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "KisanKhata_Applications.csv";
  a.click();
  URL.revokeObjectURL(url);
}
