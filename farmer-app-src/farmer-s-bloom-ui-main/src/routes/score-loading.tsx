import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Satellite, Cloud, Sprout, IndianRupee, ShieldCheck } from "lucide-react";
import { pollScoreStatus, getCurrentFarmerId } from "@/lib/api";

export const Route = createFileRoute("/score-loading")({
  head: () => ({
    meta: [{ title: "Generating your KisanScore — KisanKhata" }],
  }),
  component: ScoreLoadingPage,
});

const checks = [
  { icon: Satellite, en: "Satellite crop health (NDVI)", hi: "सैटेलाइट से फसल स्वास्थ्य" },
  { icon: Cloud, en: "Rainfall & weather risk", hi: "वर्षा व मौसम जोखिम" },
  { icon: IndianRupee, en: "Mandi prices & income", hi: "मंडी भाव व आय" },
  { icon: Sprout, en: "Land & crop tenure", hi: "ज़मीन व फसल" },
  { icon: ShieldCheck, en: "Schemes & insurance", hi: "योजनाएँ व बीमा" },
];

function ScoreLoadingPage() {
  const navigate = useNavigate();
  const [done, setDone] = useState(0);
  const [scoreReady, setScoreReady] = useState(false);

  // Animate checkmarks progressively
  useEffect(() => {
    if (done < checks.length) {
      const t = setTimeout(() => setDone((d) => d + 1), 700);
      return () => clearTimeout(t);
    }
  }, [done]);

  // Poll backend for score completion
  useEffect(() => {
    const farmerId = getCurrentFarmerId();
    if (!farmerId) {
      // No farmer ID — just navigate with animation
      if (done >= checks.length) {
        const t = setTimeout(() => navigate({ to: "/dashboard" }), 600);
        return () => clearTimeout(t);
      }
      return;
    }

    let cancelled = false;
    const poll = async () => {
      while (!cancelled) {
        try {
          const result = await pollScoreStatus(farmerId);
          if (result.status === "complete") {
            setScoreReady(true);
            // Finish animation quickly
            setDone(checks.length);
            setTimeout(() => {
              if (!cancelled) navigate({ to: "/dashboard" });
            }, 800);
            return;
          }
          if (result.status === "error") {
            // Still navigate — dashboard will show whatever data is available
            setDone(checks.length);
            setTimeout(() => {
              if (!cancelled) navigate({ to: "/dashboard" });
            }, 600);
            return;
          }
        } catch {
          // Ignore polling errors
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
    };

    // Start polling after a brief delay
    const t = setTimeout(poll, 1500);
    return () => { cancelled = true; clearTimeout(t); };
  }, [navigate]);

  // Fallback: if after 15 seconds still not done, just navigate
  useEffect(() => {
    const t = setTimeout(() => navigate({ to: "/dashboard" }), 15000);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col items-center px-6 py-10 text-white">
      <div className="mt-8 text-center">
        <div className="mx-auto h-20 w-20 rounded-full border-4 border-white/30 border-t-white animate-spin" />
        <h1 className="mt-8 text-2xl font-bold text-shadow-hero">
          {scoreReady ? "Score Ready!" : "Building your KisanScore"}
        </h1>
        <p lang="hi" className="font-hi mt-1 text-white/80">
          {scoreReady ? "स्कोर तैयार है!" : "आपका किसानस्कोर बन रहा है"}
        </p>
      </div>

      <div className="mt-10 w-full max-w-sm space-y-3">
        {checks.map((c, i) => {
          const Icon = c.icon;
          const active = i < done;
          return (
            <div
              key={i}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 border transition-all ${
                active
                  ? "bg-white/20 border-white/30"
                  : "bg-white/5 border-white/10 opacity-60"
              }`}
            >
              <span
                className={`h-9 w-9 rounded-xl grid place-items-center ${
                  active ? "bg-white text-primary" : "bg-white/10"
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <div className="text-sm font-semibold">{c.en}</div>
                <div lang="hi" className="font-hi text-[11px] text-white/70">
                  {c.hi}
                </div>
              </div>
              {active && (
                <span className="text-xs font-semibold bg-white text-primary px-2 py-0.5 rounded-full">
                  Done
                </span>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-auto text-xs text-white/60 pb-2">
        Powered by NASA POWER · AGMARKNET · OpenWeatherMap
      </p>
    </div>
  );
}
