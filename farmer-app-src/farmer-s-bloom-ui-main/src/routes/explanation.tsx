import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, TrendingUp, TrendingDown, Download, Share2 } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { ScreenHeader } from "@/components/ScreenHeader";
import { subScores, score, farmer } from "@/lib/mock-data";

export const Route = createFileRoute("/explanation")({
  head: () => ({
    meta: [
      { title: "Why this score? — KisanKhata" },
      {
        name: "description",
        content: "Plain-language explanation of your KisanScore using SHAP-based factors.",
      },
    ],
  }),
  component: () => (
    <PhoneShell>
      <Explanation />
    </PhoneShell>
  ),
});

function Explanation() {
  return (
    <div className="min-h-full flex flex-col bg-surface-soft pb-8">
      <ScreenHeader
        title="Why this score?"
        titleHi="आपका स्कोर क्यों?"
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

      <div className="px-5 space-y-5">
        {/* AI summary card */}
        <div className="rounded-3xl bg-ink text-ink-foreground p-5 shadow-float relative overflow-hidden">
          <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-primary/30 blur-3xl" />
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-xl grid place-items-center bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <div className="text-sm font-semibold">AI Summary</div>
              <div lang="hi" className="font-hi text-[10px] opacity-70">
                आसान भाषा में
              </div>
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-white/90">
            Your KisanScore is <b>{score.value} ({score.band})</b> because your wheat
            crop is healthier than the district average and the recent rainfall has
            stayed within the normal band. The mandi price for wheat is firm at
            ₹2,275/qtl, lifting your estimated income.
          </p>
          <p
            lang="hi"
            className="font-hi mt-2 text-sm leading-relaxed text-white/80"
          >
            आपकी गेहूँ की फसल ज़िले के औसत से बेहतर है और बारिश सामान्य रही है,
            जिससे आपका स्कोर अच्छा बना है।
          </p>
        </div>

        {/* Headline */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-foreground">Top contributors</h2>
            <p lang="hi" className="font-hi text-xs text-muted-foreground">
              मुख्य कारण
            </p>
          </div>
          <span className="text-xs text-muted-foreground">{farmer.season}</span>
        </div>

        {/* SHAP-style factor list */}
        <div className="space-y-3">
          {subScores.map((s) => {
            const positive = s.impact.startsWith("+");
            const pct = (s.value / s.max) * 100;
            return (
              <div
                key={s.key}
                className="rounded-2xl bg-white border border-border p-4 shadow-soft"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">{s.label}</div>
                    <div lang="hi" className="font-hi text-[11px] text-muted-foreground">
                      {s.labelHi}
                    </div>
                  </div>
                  <span
                    className={`flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-full ${
                      positive
                        ? "bg-success/10 text-success"
                        : "bg-danger/10 text-danger"
                    }`}
                  >
                    {positive ? (
                      <TrendingUp className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" />
                    )}
                    {s.impact}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold tabular-nums text-foreground">
                    {s.value}/{s.max}
                  </span>
                </div>
                <p className="mt-3 text-sm text-foreground">{s.note}</p>
                <p lang="hi" className="font-hi text-xs text-muted-foreground mt-1">
                  {s.noteHi}
                </p>
                <div className="mt-3 text-[10px] text-muted-foreground/80 border-t border-border pt-2">
                  Source: {s.source}
                </div>
              </div>
            );
          })}
        </div>

        <button className="mt-2 w-full h-13 py-4 rounded-full bg-ink text-ink-foreground font-semibold flex items-center justify-center gap-2 shadow-float hover:scale-[0.99] active:scale-95 transition">
          <Download className="h-4 w-4" /> Download report (PDF)
        </button>
      </div>
    </div>
  );
}
