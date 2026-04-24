import { createFileRoute, Link } from "@tanstack/react-router";
import { Globe2, Sparkles } from "lucide-react";
import heroField from "@/assets/hero-field.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KisanKhata — AI Credit Score for Indian Farmers" },
      {
        name: "description",
        content:
          "KisanKhata turns satellite, weather and mandi data into a verified KisanScore so farmers get fair, fast formal credit.",
      },
      { property: "og:title", content: "KisanKhata — Farmer Credit Identity" },
      {
        property: "og:description",
        content:
          "Get your KisanScore in 10 minutes using your Aadhaar and farm details. No bank visit needed.",
      },
    ],
  }),
  component: SplashPage,
});

function SplashPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Background image */}
      <img
        src={heroField}
        alt="Lush wheat field at sunrise"
        className="absolute inset-0 h-full w-full object-cover"
        width={1024}
        height={1280}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-primary-deep/40 via-primary-deep/55 to-primary-deep/95" />

      <div className="relative z-10 flex flex-col items-center text-center px-8 pb-16 pt-24 max-w-[420px] w-full min-h-screen">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="h-16 w-16 rounded-3xl bg-white/15 backdrop-blur-md grid place-items-center border border-white/20 shadow-float">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h1 className="mt-6 text-5xl font-extrabold text-white tracking-tight text-shadow-hero">
            KisanKhata
          </h1>
          <p
            lang="hi"
            className="font-hi mt-2 text-lg text-white/90 text-shadow-hero"
          >
            किसानखाता
          </p>
          <p className="mt-8 text-white/95 text-lg leading-relaxed max-w-xs text-shadow-hero">
            Turn your farm into financial trust.
          </p>
          <p
            lang="hi"
            className="font-hi mt-2 text-white/80 text-base max-w-xs text-shadow-hero"
          >
            अपनी खेती को आर्थिक पहचान बनाइए।
          </p>
        </div>

        <div className="w-full space-y-3">
          <Link
            to="/onboarding"
            className="
              w-full flex items-center justify-center gap-2 rounded-full
              bg-ink text-ink-foreground py-4 px-6 font-semibold
              shadow-float hover:scale-[0.98] active:scale-95 transition
            "
          >
            Get my KisanScore
            <span lang="hi" className="font-hi text-sm opacity-80">
              · शुरू करें
            </span>
          </Link>

          <p className="text-center text-xs text-white/70 mt-2">
            Made with care · Team Utkarsh
          </p>
        </div>
      </div>
    </div>
  );
}
