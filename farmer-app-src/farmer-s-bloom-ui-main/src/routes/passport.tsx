import { createFileRoute } from "@tanstack/react-router";
import { Download, Share2, Sparkles } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { ScreenHeader } from "@/components/ScreenHeader";
import { BottomNav } from "@/components/BottomNav";
import { farmer, score, loanOffer, formatINR } from "@/lib/mock-data";
import farmerAvatar from "@/assets/farmer-avatar.jpg";

export const Route = createFileRoute("/passport")({
  head: () => ({
    meta: [
      { title: "Credit Passport — KisanKhata" },
      {
        name: "description",
        content:
          "A portable, QR-linked credit passport you can show to any partner bank.",
      },
    ],
  }),
  component: () => (
    <PhoneShell>
      <Passport />
    </PhoneShell>
  ),
});

function Passport() {
  return (
    <div className="min-h-full flex flex-col bg-surface-soft">
      <ScreenHeader
        title="Credit Passport"
        titleHi="क्रेडिट पासपोर्ट"
        back="/dashboard"
        right={
          <button
            aria-label="Share"
            className="h-10 w-10 grid place-items-center rounded-full bg-white border border-border"
          >
            <Share2 className="h-4 w-4" />
          </button>
        }
      />

      <div className="px-5 space-y-4 pb-6 flex-1">
        {/* Passport card */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-hero text-white shadow-score">
          <div className="absolute inset-0 opacity-10"
               style={{
                 backgroundImage:
                   "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                 backgroundSize: "16px 16px",
               }}
          />
          <div className="relative p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="font-bold tracking-wide">KisanKhata</span>
              </div>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
                v1 · 2026
              </span>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <img
                src={farmerAvatar}
                alt={farmer.name}
                className="h-16 w-16 rounded-2xl object-cover ring-2 ring-white/30"
              />
              <div>
                <div className="font-bold text-lg leading-tight">
                  {farmer.name}
                </div>
                <div lang="hi" className="font-hi text-sm text-white/85">
                  {farmer.nameHi}
                </div>
                <div className="text-xs text-white/70 font-mono mt-1">
                  {farmer.id}
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <PassportStat label="Score" value={String(score.value)} />
              <PassportStat label="Band" value={score.band} />
              <PassportStat label="Acres" value={String(farmer.landAcres)} />
            </div>

            <div className="mt-5 flex items-center gap-4">
              {/* Mock QR */}
              <div className="h-24 w-24 rounded-2xl bg-white p-2">
                <div
                  className="h-full w-full"
                  style={{
                    backgroundImage:
                      "repeating-conic-gradient(var(--color-ink) 0% 25%, transparent 0% 50%)",
                    backgroundSize: "8px 8px",
                  }}
                />
              </div>
              <div className="flex-1 text-xs text-white/85 leading-relaxed">
                Scan at any partner bank to verify this passport. Aadhaar
                stays masked.
                <p lang="hi" className="font-hi mt-1 text-white/70">
                  किसी भी बैंक में स्कैन करें।
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="rounded-2xl bg-white border border-border divide-y divide-border">
          <Row label="District" hi="ज़िला" value={farmer.district} />
          <Row label="Aadhaar" hi="आधार" value={farmer.aadhaarMasked} />
          <Row label="Primary crop" hi="मुख्य फसल" value={farmer.primaryCrop} />
          <Row label="Season" hi="मौसम" value={farmer.season} />
          <Row
            label="Pre-approved up to"
            hi="स्वीकृत"
            value={`${formatINR(loanOffer.amountMax)} @ ${loanOffer.rate}%`}
          />
        </div>

        <div className="flex gap-3">
          <button className="flex-1 h-13 py-3.5 rounded-full bg-ink text-ink-foreground font-semibold flex items-center justify-center gap-2">
            <Download className="h-4 w-4" /> PDF
          </button>
          <button className="flex-1 h-13 py-3.5 rounded-full bg-white border border-border font-semibold flex items-center justify-center gap-2">
            <Share2 className="h-4 w-4" /> Share
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

function PassportStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/15 backdrop-blur-md py-2">
      <div className="text-[10px] uppercase tracking-wider text-white/70">
        {label}
      </div>
      <div className="font-bold tabular-nums">{value}</div>
    </div>
  );
}

function Row({ label, hi, value }: { label: string; hi: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div lang="hi" className="font-hi text-[10px] text-muted-foreground/80">
          {hi}
        </div>
      </div>
      <div className="font-semibold text-foreground text-sm text-right">
        {value}
      </div>
    </div>
  );
}
