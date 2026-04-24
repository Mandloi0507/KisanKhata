import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, AlertTriangle, ArrowRight, TrendingUp, Sparkles } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { BottomNav } from "@/components/BottomNav";
import { ScoreGauge } from "@/components/ScoreGauge";
import { farmer, score, loanOffer, subScores, formatINR } from "@/lib/mock-data";
import farmerAvatar from "@/assets/farmer-avatar.jpg";
import wheat from "@/assets/wheat-close.jpg";
import soybean from "@/assets/soybean.jpg";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — KisanKhata" },
      {
        name: "description",
        content: "Your KisanScore, sub-scores, and pre-approved loan offer at a glance.",
      },
    ],
  }),
  component: () => (
    <PhoneShell>
      <Dashboard />
    </PhoneShell>
  ),
});

function Dashboard() {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    // Fetch real data from backend and update exported objects
    import("@/lib/mock-data").then(({ fetchLiveDashboard }) => {
      fetchLiveDashboard().then((ok) => {
        if (ok) forceUpdate(n => n + 1); // Re-render with live data
      });
    });
  }, []);

  return (
    <div className="min-h-full flex flex-col bg-surface-soft pb-2">
      {/* Top bar */}
      <header className="px-5 pt-7 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={farmerAvatar}
            alt={farmer.name}
            width={44}
            height={44}
            className="h-11 w-11 rounded-full object-cover ring-2 ring-primary/20"
          />
          <div>
            <div className="text-xs text-muted-foreground">
              Hi, <span lang="hi" className="font-hi">नमस्ते</span> 👋
            </div>
            <div className="font-semibold leading-tight">{farmer.name}</div>
          </div>
        </div>
        <Link
          to="/notifications"
          className="relative h-11 w-11 grid place-items-center rounded-full bg-white border border-border"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-danger" />
        </Link>
      </header>

      {/* Score hero */}
      <section className="px-5">
        <div className="relative rounded-3xl bg-gradient-hero p-6 text-white shadow-score overflow-hidden">
          <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest text-white/70">
                {farmer.season}
              </div>
              <div lang="hi" className="font-hi text-[11px] text-white/60">
                {farmer.seasonHi}
              </div>
            </div>
            <span className="flex items-center gap-1 bg-white/15 backdrop-blur-md px-2.5 py-1 rounded-full text-xs">
              <TrendingUp className="h-3 w-3" /> +{score.delta} this season
            </span>
          </div>
          <div className="flex justify-center mt-3">
            <ScoreGauge size={210} />
          </div>
          <p className="text-center text-sm text-white/85 mt-2">
            Updated {farmer.scoreUpdated}
          </p>
          <Link
            to="/explanation"
            className="mt-4 w-full flex items-center justify-center gap-2 rounded-full bg-white/15 backdrop-blur-md border border-white/25 py-3 text-sm font-medium hover:bg-white/25 transition"
          >
            <Sparkles className="h-4 w-4" /> Why this score?
            <span lang="hi" className="font-hi text-xs opacity-80">· क्यों?</span>
          </Link>
        </div>
      </section>

      {/* Loan offer */}
      <section className="px-5 mt-5">
        <div className="rounded-3xl bg-ink text-ink-foreground p-5 shadow-float relative overflow-hidden">
          <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-primary/30 blur-3xl" />
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest text-white/60">
                Pre-approved offer
              </div>
              <div lang="hi" className="font-hi text-[11px] text-white/50">
                पूर्व-स्वीकृत प्रस्ताव
              </div>
            </div>
            <span className="text-[10px] font-semibold bg-success/30 text-white px-2 py-1 rounded-full border border-success/40">
              READY
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tabular-nums">
              {formatINR(loanOffer.amountMax)}
            </span>
            <span className="text-sm text-white/60">
              up to · {loanOffer.rate}% p.a.
            </span>
          </div>
          <p className="mt-1 text-sm text-white/70">{loanOffer.bank}</p>
          <Link
            to="/loan"
            className="mt-4 w-full flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground py-3 font-semibold hover:scale-[0.99] active:scale-95 transition"
          >
            Apply Now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Sub-scores grid */}
      <section className="px-5 mt-6">
        <div className="flex items-end justify-between mb-3">
          <div>
            <h2 className="font-bold text-foreground">Score breakdown</h2>
            <p lang="hi" className="font-hi text-xs text-muted-foreground">
              स्कोर का विवरण
            </p>
          </div>
          <Link to="/explanation" className="text-sm font-semibold text-primary">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {subScores.slice(0, 4).map((s) => (
            <div
              key={s.key}
              className="rounded-2xl bg-white border border-border p-4 shadow-soft"
            >
              <div className="text-[11px] font-semibold text-muted-foreground">
                {s.label}
              </div>
              <div lang="hi" className="font-hi text-[10px] text-muted-foreground/80">
                {s.labelHi}
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-extrabold tabular-nums text-foreground">
                  {s.value}
                </span>
                <span className="text-xs text-muted-foreground">/{s.max}</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${(s.value / s.max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Crop strip */}
      <section className="px-5 mt-6">
        <div className="flex items-end justify-between mb-3">
          <div>
            <h2 className="font-bold text-foreground">Your crops</h2>
            <p lang="hi" className="font-hi text-xs text-muted-foreground">
              आपकी फसलें
            </p>
          </div>
          <span className="text-xs text-muted-foreground">{farmer.landAcres} acres</span>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5 pb-2">
          {[
            { name: farmer.primaryCrop, hi: farmer.primaryCropHi, img: wheat, ndvi: "0.71" },
            { name: farmer.secondaryCrop, hi: farmer.secondaryCropHi, img: soybean, ndvi: "0.64" },
          ].map((c) => (
            <div
              key={c.name}
              className="relative shrink-0 w-56 h-40 rounded-3xl overflow-hidden shadow-card"
            >
              <img
                src={c.img}
                alt={c.name}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
              <div className="absolute top-3 right-3 text-[10px] font-semibold bg-white/90 text-primary-deep px-2 py-1 rounded-full">
                NDVI {c.ndvi}
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                <div className="text-base font-bold">{c.name}</div>
                <div lang="hi" className="font-hi text-xs opacity-80">
                  {c.hi}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Distress / tips banner */}
      <section className="px-5 mt-6">
        <div className="rounded-2xl border border-warning/40 bg-warning/10 p-4 flex gap-3">
          <span className="h-9 w-9 rounded-xl grid place-items-center bg-warning/20 text-warning shrink-0">
            <AlertTriangle className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <div className="text-sm font-semibold text-foreground">
              Rainfall 18% below normal this month
            </div>
            <p lang="hi" className="font-hi text-xs text-muted-foreground mt-0.5">
              बारिश सामान्य से 18% कम — फसल सिंचाई पर ध्यान दें।
            </p>
          </div>
        </div>
      </section>

      <div className="flex-1" />
      <BottomNav />
    </div>
  );
}
