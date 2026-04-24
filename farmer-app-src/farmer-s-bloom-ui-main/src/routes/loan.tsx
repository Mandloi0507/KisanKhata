import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, ChevronRight, Shield, Calendar, Wallet } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { ScreenHeader } from "@/components/ScreenHeader";
import { loanOffer, formatINR, score } from "@/lib/mock-data";

export const Route = createFileRoute("/loan")({
  head: () => ({
    meta: [
      { title: "Apply for loan — KisanKhata" },
      {
        name: "description",
        content: "Pre-approved Kisan Credit at a fair rate, decision within 24 hours.",
      },
    ],
  }),
  component: () => (
    <PhoneShell>
      <LoanPage />
    </PhoneShell>
  ),
});

function LoanPage() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState(loanOffer.amountMax);
  const [tenure, setTenure] = useState(12);
  const [submitted, setSubmitted] = useState(false);

  const monthlyRate = loanOffer.rate / 100 / 12;
  const emi = Math.round(
    (amount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
      (Math.pow(1 + monthlyRate, tenure) - 1)
  );

  if (submitted) {
    return (
      <div className="min-h-full flex flex-col bg-surface-soft">
        <ScreenHeader title="Application sent" titleHi="आवेदन भेजा गया" back="/dashboard" />
        <div className="flex-1 px-6 flex flex-col items-center justify-center text-center">
          <div className="h-20 w-20 rounded-full bg-success/15 grid place-items-center text-success">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="mt-6 text-2xl font-bold">You're all set, Ramesh</h2>
          <p lang="hi" className="font-hi text-sm text-muted-foreground mt-1">
            आपका आवेदन सफलतापूर्वक भेज दिया गया है।
          </p>
          <p className="mt-4 text-sm text-muted-foreground max-w-xs">
            {loanOffer.bank} will review your KisanScore profile and respond
            within {loanOffer.decisionWindow}. We'll text you on{" "}
            <b>+91 98765 43210</b>.
          </p>
          <div className="mt-8 w-full max-w-xs grid grid-cols-3 gap-2 text-center">
            <Stat label="Amount" value={formatINR(amount)} />
            <Stat label="Rate" value={`${loanOffer.rate}%`} />
            <Stat label="EMI" value={formatINR(emi)} />
          </div>
          <button
            onClick={() => navigate({ to: "/dashboard" })}
            className="mt-10 w-full max-w-xs h-13 py-4 rounded-full bg-ink text-ink-foreground font-semibold"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col bg-surface-soft pb-32">
      <ScreenHeader title="Loan offer" titleHi="ऋण प्रस्ताव" back="/dashboard" />

      <div className="px-5 space-y-5">
        {/* Bank card */}
        <div className="rounded-3xl bg-gradient-hero p-5 text-white shadow-score relative overflow-hidden">
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="text-xs uppercase tracking-widest text-white/70">
            Lender
          </div>
          <div className="font-bold text-lg">{loanOffer.bank}</div>
          <p lang="hi" className="font-hi text-xs text-white/70">
            {loanOffer.bankHi}
          </p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold tabular-nums">
              {formatINR(amount)}
            </span>
            <span className="text-sm text-white/70">@ {loanOffer.rate}% p.a.</span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
            <Pill icon={<Calendar className="h-3 w-3" />} label={`${tenure} mo`} />
            <Pill icon={<Wallet className="h-3 w-3" />} label={`EMI ${formatINR(emi)}`} />
            <Pill icon={<Shield className="h-3 w-3" />} label={`Score ${score.value}`} />
          </div>
        </div>

        {/* Amount slider */}
        <div className="rounded-3xl bg-white border border-border p-5">
          <SliderField
            label="Loan amount"
            hi="ऋण राशि"
            value={amount}
            min={loanOffer.amountMin}
            max={loanOffer.amountMax}
            step={5000}
            format={(v) => formatINR(v)}
            onChange={setAmount}
          />
          <div className="my-5 h-px bg-border" />
          <SliderField
            label="Tenure"
            hi="अवधि"
            value={tenure}
            min={6}
            max={36}
            step={3}
            format={(v) => `${v} months`}
            onChange={setTenure}
          />
        </div>

        {/* Trust */}
        <div className="rounded-2xl bg-primary-soft border border-primary/20 p-4">
          <div className="flex items-center gap-2 text-primary-deep">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-semibold">
              Decision in {loanOffer.decisionWindow}
            </span>
          </div>
          <p className="text-xs text-primary-deep/80 mt-1">
            Your KisanScore profile and SHAP report are shared with the bank.
            Your Aadhaar stays masked.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-2">
          {[
            { en: "Application sent to bank", hi: "बैंक को आवेदन" },
            { en: "Officer reviews KisanScore", hi: "अधिकारी समीक्षा" },
            { en: "Funds disbursed to your account", hi: "खाते में भुगतान" },
          ].map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-2xl bg-white border border-border px-4 py-3"
            >
              <span className="h-8 w-8 rounded-full bg-primary-soft text-primary-deep grid place-items-center text-sm font-bold">
                {i + 1}
              </span>
              <div className="flex-1">
                <div className="text-sm font-semibold">{s.en}</div>
                <div lang="hi" className="font-hi text-xs text-muted-foreground">
                  {s.hi}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-[420px] mx-auto bg-gradient-to-t from-background via-background to-transparent pt-6 pb-6 px-5">
        <button
          onClick={() => setSubmitted(true)}
          className="w-full h-14 rounded-full bg-ink text-ink-foreground font-semibold shadow-float hover:scale-[0.99] active:scale-95 transition flex items-center justify-center gap-2"
        >
          Confirm & apply
          <span lang="hi" className="font-hi text-sm opacity-80">
            · पुष्टि करें
          </span>
        </button>
      </div>
    </div>
  );
}

function SliderField({
  label,
  hi,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  hi: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">{label}</div>
          <div lang="hi" className="font-hi text-[10px] text-muted-foreground">
            {hi}
          </div>
        </div>
        <span className="font-bold tabular-nums text-primary-deep">
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full mt-3 accent-primary"
      />
      <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

function Pill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center justify-center gap-1 bg-white/15 backdrop-blur-md py-1.5 rounded-full">
      {icon} {label}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white border border-border py-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="font-bold text-sm tabular-nums">{value}</div>
    </div>
  );
}
