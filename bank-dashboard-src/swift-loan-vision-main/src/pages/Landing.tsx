import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Sparkles, ShieldCheck, Satellite, TrendingUp, Users2, FileBarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import heroHills from "@/assets/hero-hills.jpg";
import { ScoreGauge } from "@/components/ScoreGauge";
import { ScoreBadge } from "@/components/ScoreBadge";

const FEATURES = [
  { icon: Satellite, title: "Satellite-Verified Crop Health", desc: "NDVI from NASA POWER & Sentinel feeds, normalised per district." },
  { icon: TrendingUp, title: "Mandi Revenue Intelligence", desc: "AGMARKNET prices × yield × land area = realistic income estimate." },
  { icon: ShieldCheck, title: "Multi-Bank Ledger Check", desc: "Detect duplicate loan applications across partner banks instantly." },
  { icon: Sparkles, title: "Explainable AI Reports", desc: "SHAP-based factor breakdowns in plain language — every score, every time." },
  { icon: Users2, title: "Distress Early Warning", desc: "Drought + score-drop + no insurance triggers proactive alerts." },
  { icon: FileBarChart, title: "Portfolio Analytics", desc: "Approval rates, district risk maps and exportable regulatory reports." },
];

const STATS = [
  { v: "10,000+", l: "Farmer Suicides / Year" },
  { v: "₹0", l: "Existing Credit Footprint" },
  { v: "36–60%", l: "Moneylender Interest Rates" },
  { v: "<24 hrs", l: "KisanKhata Decisions" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="absolute inset-x-0 top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm font-medium text-foreground/80 md:flex">
            <a href="#features" className="hover:text-primary-700">Features</a>
            <a href="#how" className="hover:text-primary-700">How it Works</a>
            <a href="#impact" className="hover:text-primary-700">Impact</a>
            <a href="#" className="hover:text-primary-700">Banks</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button asChild size="sm" className="rounded-full bg-primary-500 px-5 text-primary-foreground shadow-green hover:bg-primary-600">
              <Link to="/auth">Sign in</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero pb-0 pt-32 md:pt-40">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Farmer Credit Intelligence
          </div>
          <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-primary-900 md:text-6xl">
            Transforming Agricultural Data <br className="hidden md:block" />
            into <span className="text-primary-500">Financial Trust.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
            KisanKhata converts satellite imagery, weather, and mandi data into a verified credit score — so banks can lend confidently, and farmers can escape predatory debt.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="outline" className="rounded-full border-primary-200 bg-card px-7 text-primary-700 hover:bg-primary-50">
              <a href="#features">See how it works <ArrowRight className="ml-2 h-4 w-4" /></a>
            </Button>
          </div>
        </div>

        {/* Hills illustration */}
        <div className="relative mt-16">
          <img src={heroHills} alt="Lush green agricultural hills representing KisanKhata's ground-truth data sources"
               width={1920} height={960}
               className="h-[280px] w-full object-cover md:h-[420px]" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

          {/* Floating score card */}
          <div className="absolute left-1/2 top-1/2 hidden w-[680px] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 rounded-3xl border bg-card/95 p-6 shadow-elev-lg backdrop-blur md:block">
            <div className="flex items-center gap-6">
              <ScoreGauge score={812} size={160} thickness={12} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Live KisanScore</div>
                  <ScoreBadge band="Excellent" />
                </div>
                <div className="mt-1 text-xl font-bold text-foreground">Ramesh Kumar · Vidisha, MP</div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Strong NDVI crop health, stable rainfall and verified PM-KISAN enrolment. Eligible for ₹1L–₹2L Kisan Credit Card at 7% p.a.
                </p>
                <div className="mt-3 flex gap-4 text-xs">
                  <div><span className="font-mono font-bold text-success">+32</span> <span className="text-muted-foreground">Crop Health</span></div>
                  <div><span className="font-mono font-bold text-success">+21</span> <span className="text-muted-foreground">Mandi Trend</span></div>
                  <div><span className="font-mono font-bold text-success">+14</span> <span className="text-muted-foreground">Rainfall</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section id="impact" className="border-y bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-border md:grid-cols-4">
          {STATS.map(s => (
            <div key={s.l} className="bg-card px-6 py-8 text-center">
              <div className="font-mono text-3xl font-extrabold text-primary-700 md:text-4xl">{s.v}</div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Built for <span className="text-primary-500">bankers</span> and the farmers they serve
            </h2>
            <p className="mt-4 text-muted-foreground">
              Every loan decision backed by satellite truth, mandi data, and explainable AI — not guesswork.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(f => (
              <div key={f.title} className="rounded-2xl border bg-card p-6 transition hover:border-primary-200 hover:shadow-elev-md">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-50 text-primary-600">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-primary-50/50 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">From farm data to <span className="text-primary-500">funded loan</span> in 24 hours</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { step: "01", title: "Farmer registers", desc: "Aadhaar, district, crop, land area — guided in Hindi, under 10 minutes." },
              { step: "02", title: "Score is generated", desc: "NDVI, rainfall, mandi prices, and scheme data fuse into a 0–1000 KisanScore with SHAP factors." },
              { step: "03", title: "Banker decides", desc: "Officer reviews single-page risk profile with XAI report, ledger check and recommendation." },
            ].map(s => (
              <div key={s.step} className="relative rounded-2xl border bg-card p-7 shadow-elev-sm">
                <div className="font-mono text-sm font-bold text-primary-500">{s.step}</div>
                <h3 className="mt-3 text-xl font-bold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                <CheckCircle2 className="absolute right-5 top-5 h-5 w-5 text-primary-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="overflow-hidden rounded-3xl bg-gradient-primary p-10 text-center shadow-score md:p-14">
            <h2 className="text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl">
              Open the banker dashboard
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-primary-100">
              Explore live applications, KisanScore breakdowns, distress alerts and portfolio analytics.
            </p>
            <Button asChild size="lg" className="mt-7 rounded-full bg-card px-8 text-primary-700 hover:bg-card/90">
              <Link to="/auth">Sign in to continue <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t bg-card py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <Logo />
          <div className="text-xs text-muted-foreground">© 2026 KisanKhata · Team Utkarsh · Built for the farmers of India.</div>
        </div>
      </footer>
    </div>
  );
}
