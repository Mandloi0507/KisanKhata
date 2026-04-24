import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TrendingUp, ArrowUpRight, Calendar, CreditCard, CheckCircle2 } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { ScreenHeader } from "@/components/ScreenHeader";
import { BottomNav } from "@/components/BottomNav";
import { history, loanHistory, loanSummary, formatINR } from "@/lib/mock-data";
import type { LoanRecord } from "@/lib/mock-data";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [{ title: "History — KisanKhata" }],
  }),
  component: () => (
    <PhoneShell>
      <HistoryPage />
    </PhoneShell>
  ),
});

function HistoryPage() {
  const [tab, setTab] = useState<"score" | "loans">("score");

  return (
    <div className="min-h-full flex flex-col bg-surface-soft">
      <ScreenHeader title="History" titleHi="इतिहास" back="/dashboard" />

      {/* Tab switcher */}
      <div className="px-5 mb-4">
        <div className="flex rounded-full bg-muted/60 p-1 border border-border">
          <button
            onClick={() => setTab("score")}
            className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all ${
              tab === "score"
                ? "bg-white text-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Score
          </button>
          <button
            onClick={() => setTab("loans")}
            className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all ${
              tab === "loans"
                ? "bg-ink text-ink-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Loans
          </button>
        </div>
      </div>

      {tab === "score" ? <ScoreTab /> : <LoansTab />}

      <BottomNav />
    </div>
  );
}

/* ────────────────────────── Score Tab ────────────────────────── */

function ScoreTab() {
  const w = 340;
  const h = 180;
  const pad = 20;
  const max = Math.max(...history.map((h) => h.value)) + 60;
  const min = Math.min(...history.map((h) => h.value)) - 60;
  const xStep = (w - pad * 2) / (history.length - 1);
  const points = history.map((d, i) => ({
    x: pad + i * xStep,
    y: pad + (1 - (d.value - min) / (max - min)) * (h - pad * 2),
  }));
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${path} L ${points[points.length - 1].x} ${h - pad} L ${pad} ${h - pad} Z`;

  const first = history[0].value;
  const last = history[history.length - 1].value;
  const delta = last - first;

  return (
    <div className="px-5 space-y-5 pb-4 flex-1">
      {/* Summary card */}
      <div className="rounded-3xl bg-white border border-border p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Last 5 seasons</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-extrabold tabular-nums text-foreground">
                {last}
              </span>
              <span className="text-sm text-muted-foreground">/ 1000</span>
            </div>
          </div>
          <span className="flex items-center gap-1 bg-success/10 text-success font-semibold text-sm px-3 py-1.5 rounded-full">
            <TrendingUp className="h-4 w-4" />+{delta}
          </span>
        </div>

        <svg viewBox={`0 0 ${w} ${h}`} className="mt-4 w-full">
          <defs>
            <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#grad)" />
          <path
            d={path}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="6" fill="white" stroke="var(--color-primary)" strokeWidth="3" />
              <text
                x={p.x}
                y={p.y - 14}
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                fill="var(--color-foreground)"
              >
                {history[i].value}
              </text>
            </g>
          ))}
        </svg>

        <div className="flex justify-between text-[10px] text-muted-foreground mt-1 px-2">
          {history.map((d) => (
            <span key={d.season} className="text-center w-12 leading-tight">
              {d.season.replace(" ", "\n")}
            </span>
          ))}
        </div>
      </div>

      {/* Season list */}
      <div className="space-y-2">
        {[...history].reverse().map((h, i) => {
          const prev = history[history.length - i - 2];
          const change = prev ? h.value - prev.value : 0;
          return (
            <div
              key={h.season}
              className="flex items-center justify-between rounded-2xl bg-white border border-border px-4 py-3"
            >
              <div>
                <div className="font-semibold">{h.season}</div>
                <div className="text-xs text-muted-foreground">KisanScore</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl font-extrabold tabular-nums">{h.value}</span>
                {change !== 0 && (
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      change > 0
                        ? "bg-success/10 text-success"
                        : "bg-danger/10 text-danger"
                    }`}
                  >
                    <ArrowUpRight
                      className={`h-3 w-3 ${change < 0 ? "rotate-90" : ""}`}
                    />
                    {change > 0 ? "+" : ""}
                    {change}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ────────────────────────── Loans Tab ────────────────────────── */

function LoansTab() {
  return (
    <div className="px-5 space-y-4 pb-4 flex-1">
      {/* Outstanding summary card - dark green gradient */}
      <div
        className="rounded-3xl p-5 text-white"
        style={{
          background: "linear-gradient(145deg, oklch(0.20 0.04 145) 0%, oklch(0.30 0.10 145) 40%, oklch(0.38 0.12 145) 100%)",
        }}
      >
        <div className="text-[11px] font-semibold tracking-widest uppercase text-white/70">
          Outstanding
        </div>
        <div className="mt-1 text-4xl font-extrabold tabular-nums text-amber-400">
          {formatINR(loanSummary.outstanding)}
        </div>

        <div className="flex gap-3 mt-5">
          <div className="flex-1 rounded-2xl bg-white/10 backdrop-blur-sm px-4 py-3">
            <div className="text-[10px] font-semibold tracking-widest uppercase text-white/60">
              Total Borrowed
            </div>
            <div className="mt-1 text-lg font-bold tabular-nums">
              {formatINR(loanSummary.totalBorrowed)}
            </div>
          </div>
          <div className="flex-1 rounded-2xl bg-white/10 backdrop-blur-sm px-4 py-3">
            <div className="text-[10px] font-semibold tracking-widest uppercase text-white/60">
              Total Repaid
            </div>
            <div className="mt-1 text-lg font-bold tabular-nums">
              {formatINR(loanSummary.totalRepaid)}
            </div>
          </div>
        </div>
      </div>

      {/* Loan cards */}
      {loanHistory.map((loan) => (
        <LoanCard key={loan.id} loan={loan} />
      ))}
    </div>
  );
}

function LoanCard({ loan }: { loan: LoanRecord }) {
  const repaidPercent = Math.round((loan.repaidAmount / loan.principalAmount) * 100);
  const isActive = loan.status === "active";

  return (
    <div className="rounded-3xl bg-white border border-border p-5 shadow-soft">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground leading-tight">{loan.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{loan.bank}</p>
        </div>
        <span
          className={`text-[11px] font-bold tracking-wider uppercase px-3 py-1 rounded-full border ${
            isActive
              ? "bg-success/10 text-success border-success/30"
              : "bg-muted text-muted-foreground border-border"
          }`}
        >
          {isActive ? "Active" : "Closed"}
        </span>
      </div>

      {/* Amount row */}
      <div className="flex items-end justify-between mt-4">
        <div>
          <div className="text-2xl font-extrabold tabular-nums text-foreground">
            {formatINR(loan.principalAmount)}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            @ {loan.interestRate}% · {loan.tenureMonths} mo
          </div>
        </div>
        <div className="text-right">
          <div className={`text-lg font-bold tabular-nums ${isActive ? "text-success" : "text-success"}`}>
            {formatINR(loan.repaidAmount)}
          </div>
          <div className="text-xs text-muted-foreground">
            repaid ({repaidPercent}%)
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${repaidPercent}%`,
            background: isActive
              ? "linear-gradient(90deg, oklch(0.55 0.17 145), oklch(0.65 0.18 145))"
              : "oklch(0.55 0.17 145)",
          }}
        />
      </div>

      {/* Footer dates */}
      <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          Started {loan.startDate}
        </span>
        {isActive && loan.nextEmiDate ? (
          <span className="flex items-center gap-1.5">
            <CreditCard className="h-3.5 w-3.5" />
            EMI {formatINR(loan.emiAmount)} · {loan.nextEmiDate}
          </span>
        ) : loan.closedDate ? (
          <span className="flex items-center gap-1.5 text-success">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Closed {loan.closedDate}
          </span>
        ) : null}
      </div>

      {/* Payments link for active loans */}
      {isActive && (
        <div className="mt-3">
          <span className="text-xs font-semibold text-primary cursor-pointer hover:underline">
            {loan.paymentsMade} payments → view
          </span>
        </div>
      )}
    </div>
  );
}
