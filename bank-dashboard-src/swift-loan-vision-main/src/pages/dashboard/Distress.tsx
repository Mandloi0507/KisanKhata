import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ShieldAlert, Droplets, FileWarning, ArrowRight } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { ScoreBadge } from "@/components/ScoreBadge";
import { getDistressApplications } from "@/lib/mock-data";
import type { Application } from "@/lib/types";

export default function Distress() {
  const [apps, setApps] = useState<Application[]>([]);
  useEffect(() => { getDistressApplications().then(setApps); }, []);

  return (
    <>
      <DashboardHeader title="Distress Alerts" subtitle={`${apps.length} farmers flagged at risk`} />
      <main className="flex-1 space-y-5 p-4 md:p-6">
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 text-destructive" />
            <div>
              <div className="font-bold text-destructive">{apps.length} active distress alerts</div>
              <p className="text-sm text-muted-foreground">Triggered when drought warning + score drop ≥100 + no active insurance occur together. Acknowledge within 48 hours.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {apps.map(a => {
            const lastSeason = a.scoreHistory[a.scoreHistory.length - 2]?.score ?? a.score + 100;
            const drop = lastSeason - a.score;
            return (
              <div key={a.id} className="overflow-hidden rounded-2xl border bg-card shadow-elev-sm">
                <div className="border-l-4 border-destructive p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <span className="text-xs font-bold uppercase tracking-wide text-destructive">Distress Active</span>
                      </div>
                      <h3 className="mt-1 text-lg font-bold text-foreground">{a.farmer.name}</h3>
                      <div className="font-mono text-xs text-muted-foreground">{a.farmer.id} · {a.farmer.district}, {a.farmer.state}</div>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <Trigger icon={Droplets} text="Drought warning in district" />
                        <Trigger icon={FileWarning} text={`Score dropped ${drop} pts since last season`} />
                        <Trigger icon={ShieldAlert} text="No active crop insurance" />
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <ScoreBadge band={a.band} score={a.score} />
                      <Button asChild size="sm" className="rounded-full bg-primary-500 hover:bg-primary-600">
                        <Link to={`/dashboard/applications/${a.id}`}>Review profile <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}

function Trigger({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-destructive">
      <Icon className="h-3 w-3" />
      <span className="font-medium">{text}</span>
    </div>
  );
}
