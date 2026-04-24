import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, ChevronLeft, Sprout, MapPin, Wheat, Ruler } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Get your KisanScore — KisanKhata" },
      {
        name: "description",
        content:
          "Register with Aadhaar, district and farm details. Takes under 5 minutes.",
      },
    ],
  }),
  component: OnboardingPage,
});

const states = ["Madhya Pradesh", "Maharashtra", "Uttar Pradesh", "Punjab", "Bihar", "Karnataka"];
const districts: Record<string, string[]> = {
  "Madhya Pradesh": ["Vidisha", "Bhopal", "Sehore", "Raisen", "Hoshangabad"],
  Maharashtra: ["Nashik", "Pune", "Aurangabad", "Nagpur"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Meerut"],
  Punjab: ["Ludhiana", "Amritsar", "Patiala"],
  Bihar: ["Patna", "Gaya", "Muzaffarpur"],
  Karnataka: ["Bengaluru Rural", "Mysuru", "Belagavi"],
};
const crops = [
  { en: "Wheat", hi: "गेहूँ" },
  { en: "Rice", hi: "चावल" },
  { en: "Soybean", hi: "सोयाबीन" },
  { en: "Cotton", hi: "कपास" },
  { en: "Sugarcane", hi: "गन्ना" },
  { en: "Maize", hi: "मक्का" },
  { en: "Pulses", hi: "दलहन" },
  { en: "Mustard", hi: "सरसों" },
];

const steps = [
  { icon: Sprout, en: "Aadhaar", hi: "आधार" },
  { icon: MapPin, en: "District", hi: "ज़िला" },
  { icon: Wheat, en: "Crops", hi: "फसल" },
  { icon: Ruler, en: "Land", hi: "ज़मीन" },
  { icon: Check, en: "Confirm", hi: "पुष्टि" },
];

function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [aadhaar, setAadhaar] = useState("");
  const [name, setName] = useState("Ramesh Kumar");
  const [state, setState] = useState("Madhya Pradesh");
  const [district, setDistrict] = useState("Vidisha");
  const [primary, setPrimary] = useState("Wheat");
  const [secondary, setSecondary] = useState("Soybean");
  const [acres, setAcres] = useState(2.5);

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const aadhaarMasked =
    aadhaar.length >= 12
      ? "XXXX-XXXX-" + aadhaar.slice(-4)
      : aadhaar.replace(/(\d{4})(?=\d)/g, "$1-");

  const canNext =
    (step === 0 && aadhaar.replace(/\D/g, "").length === 12 && name.trim().length > 1) ||
    (step === 1 && state && district) ||
    (step === 2 && primary) ||
    (step === 3 && acres > 0) ||
    step === 4;

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const { registerFarmer, setCurrentFarmerId } = await import("@/lib/api");
      const result = await registerFarmer({
        full_name: name,
        aadhaar_number: aadhaar.replace(/\D/g, ""),
        mobile_number: "9876543210", // Default for demo
        state,
        district,
        primary_crop: primary,
        secondary_crop: secondary || undefined,
        land_area_acres: acres,
      });
      // Save farmer ID for subsequent API calls
      setCurrentFarmerId(result.farmer_id);
      navigate({ to: "/score-loading" });
    } catch (e: any) {
      setError(e.message || "Registration failed. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-soft">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <button
          onClick={prev}
          disabled={step === 0}
          className="h-10 w-10 grid place-items-center rounded-full bg-white border border-border disabled:opacity-40 hover:bg-muted"
          aria-label="Back"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-xs font-medium text-muted-foreground">
          Step {step + 1} of {steps.length}
        </div>
        <div className="w-10" />
      </div>

      {/* Step pills */}
      <div className="px-5">
        <div className="flex items-center gap-1.5">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                i <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3">
          {(() => {
            const Icon = steps[step].icon;
            return (
              <span className="h-12 w-12 rounded-2xl bg-primary text-primary-foreground grid place-items-center shadow-green">
                <Icon className="h-5 w-5" />
              </span>
            );
          })()}
          <div>
            <h2 className="text-2xl font-bold text-foreground leading-tight">
              {steps[step].en}
            </h2>
            <p lang="hi" className="font-hi text-sm text-muted-foreground">
              {steps[step].hi}
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 px-5 mt-6 pb-32">
        {step === 0 && (
          <div className="space-y-4">
            <FieldLabel en="Full name" hi="पूरा नाम" />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-14 px-4 rounded-2xl bg-white border border-border text-base focus:border-primary focus:outline-none"
              placeholder="Ramesh Kumar"
            />
            <FieldLabel en="Aadhaar number" hi="आधार संख्या" />
            <input
              value={aadhaar}
              onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, "").slice(0, 12))}
              inputMode="numeric"
              className="w-full h-14 px-4 rounded-2xl bg-white border border-border text-base tracking-widest focus:border-primary focus:outline-none"
              placeholder="1234 5678 9012"
            />
            {aadhaar.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Will be stored as <span className="font-mono">{aadhaarMasked}</span>
              </p>
            )}
            <InfoCard
              text="Your Aadhaar is masked and never shared with banks without consent."
              hi="आपका आधार सुरक्षित रखा जाता है।"
            />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <FieldLabel en="State" hi="राज्य" />
            <div className="grid grid-cols-2 gap-2">
              {states.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setState(s);
                    setDistrict(districts[s][0]);
                  }}
                  className={`px-4 py-3 rounded-2xl text-sm font-medium text-left border transition ${
                    state === s
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-white border-border text-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <FieldLabel en="District" hi="ज़िला" />
            <div className="flex flex-wrap gap-2">
              {districts[state]?.map((d) => (
                <button
                  key={d}
                  onClick={() => setDistrict(d)}
                  className={`px-4 py-2.5 rounded-full text-sm border transition ${
                    district === d
                      ? "bg-ink text-ink-foreground border-ink"
                      : "bg-white border-border text-foreground"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <FieldLabel en="Primary crop" hi="मुख्य फसल" />
            <CropGrid value={primary} onChange={setPrimary} />
            <FieldLabel en="Secondary crop (optional)" hi="दूसरी फसल" />
            <CropGrid value={secondary} onChange={setSecondary} />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <FieldLabel en="Land area (acres)" hi="ज़मीन (एकड़)" />
            <div className="rounded-3xl bg-white p-6 border border-border shadow-soft">
              <div className="text-center">
                <span className="text-6xl font-extrabold text-primary tabular-nums">
                  {acres.toFixed(1)}
                </span>
                <span className="ml-2 text-lg text-muted-foreground">acres</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={20}
                step={0.5}
                value={acres}
                onChange={(e) => setAcres(parseFloat(e.target.value))}
                className="mt-6 w-full accent-primary"
              />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>0.5</span>
                <span>10</span>
                <span>20+</span>
              </div>
            </div>
            <InfoCard
              text="We use your land area with mandi prices and crop yield to estimate your seasonal income."
              hi="आपकी ज़मीन से मौसमी आय का अनुमान लगाया जाएगा।"
            />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            <Summary label="Name" hi="नाम" value={name} />
            <Summary label="Aadhaar" hi="आधार" value={aadhaarMasked} />
            <Summary label="District" hi="ज़िला" value={`${district}, ${state}`} />
            <Summary label="Primary crop" hi="मुख्य फसल" value={primary} />
            {secondary && <Summary label="Secondary crop" hi="दूसरी फसल" value={secondary} />}
            <Summary label="Land" hi="ज़मीन" value={`${acres.toFixed(1)} acres`} />
            <InfoCard
              text="Your KisanScore will be computed using NDVI satellite, NASA rainfall and AGMARKNET prices."
              hi="आपका स्कोर सरकारी डेटा से बनेगा।"
            />
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[420px] mx-auto bg-gradient-to-t from-background via-background to-transparent pt-6 pb-6 px-5">
        {error && (
          <div className="mb-3 rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">{error}</div>
        )}
        <button
          disabled={!canNext || submitting}
          onClick={step === steps.length - 1 ? submit : next}
          className="w-full h-14 rounded-full bg-ink text-ink-foreground font-semibold disabled:opacity-40 shadow-float hover:scale-[0.99] active:scale-95 transition flex items-center justify-center gap-2"
        >
          {submitting ? "Registering..." : step === steps.length - 1 ? "Generate my KisanScore" : "Continue"}
          {!submitting && (
            <span lang="hi" className="font-hi text-sm opacity-80">
              {step === steps.length - 1 ? "· स्कोर बनाएँ" : "· आगे"}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

function FieldLabel({ en, hi }: { en: string; hi: string }) {
  return (
    <label className="flex items-baseline gap-2">
      <span className="text-sm font-semibold text-foreground">{en}</span>
      <span lang="hi" className="font-hi text-xs text-muted-foreground">
        {hi}
      </span>
    </label>
  );
}

function CropGrid({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {crops.map((c) => (
        <button
          key={c.en}
          onClick={() => onChange(c.en)}
          className={`px-4 py-3 rounded-2xl border text-left transition ${
            value === c.en
              ? "bg-primary-soft border-primary text-primary-deep"
              : "bg-white border-border"
          }`}
        >
          <div className="text-sm font-semibold">{c.en}</div>
          <div lang="hi" className="font-hi text-xs opacity-70">
            {c.hi}
          </div>
        </button>
      ))}
    </div>
  );
}

function Summary({ label, hi, value }: { label: string; hi: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white border border-border px-4 py-3">
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div lang="hi" className="font-hi text-[10px] text-muted-foreground/80">
          {hi}
        </div>
      </div>
      <div className="font-semibold text-foreground text-right">{value}</div>
    </div>
  );
}

function InfoCard({ text, hi }: { text: string; hi: string }) {
  return (
    <div className="rounded-2xl bg-primary-soft border border-primary/20 p-4">
      <p className="text-sm text-primary-deep">{text}</p>
      <p lang="hi" className="font-hi text-xs text-primary-deep/70 mt-1">
        {hi}
      </p>
    </div>
  );
}
