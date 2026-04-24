/**
 * Farmer data layer — now partially live from backend.
 * Static text labels remain hardcoded (they don't come from API),
 * while score/loan/sub-score data comes from the real dashboard endpoint.
 *
 * Pages that directly import { farmer, score, ... } from here
 * will still get the static defaults until fetchLiveDashboard() is called.
 */

import { fetchDashboard, getCurrentFarmerId } from "./api";

// Bilingual labels — English primary, Hindi secondary
export type BiText = { en: string; hi: string };
export const t = (text: BiText) => text;

// ─── Static farmer profile (updated after registration/login) ───

export let farmer = {
  id: getCurrentFarmerId() || "KK-2026-00001",
  name: "Ramesh Kumar",
  nameHi: "रमेश कुमार",
  village: "Ganj Basoda",
  district: "Vidisha, Madhya Pradesh",
  districtHi: "विदिशा, मध्य प्रदेश",
  aadhaarMasked: "XXXX-XXXX-4821",
  phone: "+91 98765 43210",
  landAcres: 2.5,
  primaryCrop: "Wheat",
  primaryCropHi: "गेहूँ",
  secondaryCrop: "Soybean",
  secondaryCropHi: "सोयाबीन",
  season: "Rabi 2026",
  seasonHi: "रबी 2026",
  scoreUpdated: "Apr 22, 2026",
};

export let score = {
  value: 742,
  max: 1000,
  band: "Good" as const,
  bandHi: "अच्छा",
  bandToken: "score-good",
  delta: 38,
  lastValue: 704,
};

export let subScores = [
  { key: "crop", label: "Crop Health (NDVI)", labelHi: "फसल स्वास्थ्य", value: 168, max: 200, impact: "+82", note: "Wheat NDVI 0.71 — above district avg.", noteHi: "गेहूँ की सेहत ज़िले के औसत से बेहतर।", source: "NASA POWER · Apr 18, 2026" },
  { key: "rain", label: "Rainfall Risk", labelHi: "वर्षा जोखिम", value: 142, max: 200, impact: "+54", note: "Seasonal rainfall within normal band.", noteHi: "मौसमी वर्षा सामान्य सीमा में।", source: "OpenWeatherMap · Apr 21, 2026" },
  { key: "income", label: "Income Potential (Mandi)", labelHi: "आय क्षमता", value: 156, max: 200, impact: "+61", note: "Wheat ₹2,275/qtl × est. 22 qtl/acre.", noteHi: "अनुमानित मौसमी आय ₹1,25,000।", source: "AGMARKNET · Apr 20, 2026" },
  { key: "land", label: "Land & Tenure", labelHi: "ज़मीन व अधिकार", value: 128, max: 200, impact: "+22", note: "2.5 acres, single owner, clear title.", noteHi: "2.5 एकड़, स्पष्ट अधिकार।", source: "Land Records · 2025" },
  { key: "scheme", label: "Scheme & Insurance", labelHi: "योजना व बीमा", value: 148, max: 200, impact: "+38", note: "PM-Kisan active, PMFBY enrolled.", noteHi: "पीएम-किसान सक्रिय, फसल बीमा।", source: "PM-Kisan portal" },
];

export let loanOffer = {
  amountMin: 80_000,
  amountMax: 1_50_000,
  rate: 8.5,
  tenureMonths: 12,
  emiEstimate: 13_080,
  bank: "Nashik Grameen Bank",
  bankHi: "नाशिक ग्रामीण बैंक",
  decisionWindow: "24 hours",
};

export let history = [
  { season: "Kharif 2024", value: 612 },
  { season: "Rabi 2024", value: 648 },
  { season: "Kharif 2025", value: 681 },
  { season: "Rabi 2025", value: 704 },
  { season: "Rabi 2026", value: 742 },
];

// ─── Loan history for the History → Loans tab ───

export interface LoanRecord {
  id: string;
  title: string;
  titleHi: string;
  bank: string;
  status: "active" | "closed";
  principalAmount: number;
  repaidAmount: number;
  interestRate: number;
  tenureMonths: number;
  emiAmount: number;
  startDate: string;
  nextEmiDate?: string;
  closedDate?: string;
  paymentsMade: number;
  totalPayments: number;
}

export const loanHistory: LoanRecord[] = [
  {
    id: "L001",
    title: "Rabi crop input loan",
    titleHi: "रबी फसल इनपुट ऋण",
    bank: "Madhya Bharat Gramin Bank",
    status: "active",
    principalAmount: 150000,
    repaidAmount: 65400,
    interestRate: 8.5,
    tenureMonths: 12,
    emiAmount: 13080,
    startDate: "Nov 12, 2025",
    nextEmiDate: "May 12, 2026",
    paymentsMade: 5,
    totalPayments: 12,
  },
  {
    id: "L002",
    title: "Tractor purchase",
    titleHi: "ट्रैक्टर खरीद",
    bank: "State Bank of India",
    status: "closed",
    principalAmount: 80000,
    repaidAmount: 80000,
    interestRate: 9.2,
    tenureMonths: 18,
    emiAmount: 4890,
    startDate: "Apr 04, 2024",
    closedDate: "Sep 22, 2025",
    paymentsMade: 18,
    totalPayments: 18,
  },
  {
    id: "L003",
    title: "Drip irrigation kit",
    titleHi: "ड्रिप सिंचाई किट",
    bank: "NABARD Cooperative",
    status: "closed",
    principalAmount: 45000,
    repaidAmount: 45000,
    interestRate: 7,
    tenureMonths: 12,
    emiAmount: 3900,
    startDate: "Feb 18, 2023",
    closedDate: "Feb 02, 2024",
    paymentsMade: 12,
    totalPayments: 12,
  },
];

export const loanSummary = {
  totalBorrowed: 275000,
  totalRepaid: 190400,
  outstanding: 84600,
};

export const notifications = [
  { id: "n1", title: "Score updated for Rabi 2026", titleHi: "रबी 2026 के लिए स्कोर अपडेट हुआ", body: "Your KisanScore went up by 38 points to 742.", bodyHi: "आपका किसानस्कोर 38 अंक बढ़कर 742 हो गया।", time: "2h ago", type: "success" as const },
  { id: "n2", title: "New loan offer ready", titleHi: "नया ऋण प्रस्ताव तैयार", body: "Nashik Grameen Bank pre-approved ₹1.5L @ 8.5%.", bodyHi: "बैंक से ₹1.5 लाख का प्रस्ताव।", time: "Yesterday", type: "info" as const },
  { id: "n3", title: "Mandi price alert: Wheat", titleHi: "मंडी भाव अलर्ट: गेहूँ", body: "Wheat at Vidisha mandi up 4% to ₹2,275/qtl.", bodyHi: "विदिशा मंडी में गेहूँ का भाव 4% बढ़ा।", time: "2 days ago", type: "info" as const },
  { id: "n4", title: "Weather watch: low rainfall", titleHi: "मौसम चेतावनी: कम बारिश", body: "District rainfall 18% below normal this month.", bodyHi: "इस महीने ज़िले में बारिश सामान्य से 18% कम।", time: "3 days ago", type: "warning" as const },
];

export function formatINR(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

// ─── Live data fetcher — updates all the exported objects in-place ───

const BAND_MAP: Record<string, { hi: string; token: string }> = {
  Excellent: { hi: "उत्कृष्ट", token: "score-excellent" },
  Good: { hi: "अच्छा", token: "score-good" },
  Fair: { hi: "ठीक", token: "score-fair" },
  Poor: { hi: "कमज़ोर", token: "score-poor" },
};

export async function fetchLiveDashboard(farmerId?: string): Promise<boolean> {
  const id = farmerId || getCurrentFarmerId() || farmer.id;
  try {
    const data = await fetchDashboard(id);
    if (!data || data.score_status === "processing") return false;

    // Update farmer profile
    farmer = {
      ...farmer,
      id: data.farmer_id,
      name: data.full_name,
      district: `${data.district}, ${data.state}`,
      primaryCrop: data.primary_crop,
      secondaryCrop: data.secondary_crop || farmer.secondaryCrop,
      landAcres: data.land_area_acres,
      aadhaarMasked: data.aadhaar_masked,
      season: data.latest_score?.crop_season?.replace("_", " ") || farmer.season,
      scoreUpdated: data.latest_score?.generated_at
        ? new Date(data.latest_score.generated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : farmer.scoreUpdated,
    };

    // Update score
    if (data.latest_score) {
      const ls = data.latest_score;
      const bandInfo = BAND_MAP[ls.score_category] || BAND_MAP["Fair"];
      score = {
        value: ls.score,
        max: 1000,
        band: ls.score_category as any,
        bandHi: bandInfo.hi,
        bandToken: bandInfo.token,
        delta: 0,
        lastValue: ls.score,
      };

      // Update sub-scores
      if (ls.sub_scores?.length) {
        subScores = ls.sub_scores.map((s: any) => ({
          key: s.key,
          label: s.label,
          labelHi: s.label_hi || "",
          value: s.value,
          max: s.max || 200,
          impact: s.impact || `+${s.value - 100}`,
          note: s.note || "",
          noteHi: s.note_hi || "",
          source: s.source || "",
        }));
      }
    }

    // Update loan offer
    if (data.loan_offer) {
      loanOffer = {
        ...loanOffer,
        amountMin: data.loan_offer.amount_min_inr,
        amountMax: data.loan_offer.amount_max_inr,
        rate: data.loan_offer.rate_percent,
      };
    }

    return true;
  } catch (e) {
    console.error("Failed to fetch live dashboard:", e);
    return false;
  }
}
