import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, Download, Phone, MapPin, Sprout, Ruler, Sparkles, ShieldCheck, ShieldAlert, Calendar, TrendingUp, TrendingDown, RotateCcw } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ScoreGauge } from "@/components/ScoreGauge";
import { ScoreBadge } from "@/components/ScoreBadge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getApplication } from "@/lib/mock-data";
import type { Application } from "@/lib/types";
import { formatINR, formatINRCompact } from "@/lib/score";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

type DecisionAction = "Approved" | "Rejected";
interface DecisionState { action: DecisionAction; comment: string; at: string; by: string; }

export default function ApplicationDetail() {
  const { id } = useParams();
  const { banker } = useAuth();
  const [app, setApp] = useState<Application | null>(null);
  const [comment, setComment] = useState("");
  const [pending, setPending] = useState<DecisionAction | null>(null);
  const [decision, setDecision] = useState<DecisionState | null>(null);

  useEffect(() => { if (id) getApplication(id).then(a => setApp(a ?? null)); }, [id]);

  if (!app) return <div className="p-10 text-muted-foreground">Loading…</div>;

  const submit = async (action: DecisionAction) => {
    if (comment.trim().length < 10) { toast.error("Please add a comment (min 10 characters)"); return; }
    try {
      const { submitDecision } = await import("@/lib/api");
      await submitDecision(app.id, {
        decision: action.toLowerCase() as "approved" | "rejected",
        approved_amount_inr: action === "Approved" ? app.recommendation.amountMax : undefined,
        approved_rate_percent: action === "Approved" ? app.recommendation.rate : undefined,
        comment: comment.trim(),
      });
      const d: DecisionState = {
        action,
        comment: comment.trim(),
        at: new Date().toLocaleString(),
        by: banker?.name || "Banker",
      };
      setDecision(d);
      setPending(null);
      setComment("");
      toast.success(`Application ${action.toLowerCase()} for ${app.farmer.name}`);
    } catch (e: any) {
      toast.error(e.message || "Decision failed");
    }
  };

  const reset = () => { setDecision(null); setPending(null); setComment(""); };

  return (
    <>
      <DashboardHeader title="Application Review" subtitle={`${app.farmer.name} · ${app.id}`} />

      <main className="flex-1 space-y-6 p-4 md:p-6">
        <Button asChild variant="ghost" size="sm" className="h-8 -ml-2 text-muted-foreground hover:text-foreground">
          <Link to="/dashboard/applications"><ArrowLeft className="mr-1 h-4 w-4" /> Back to applications</Link>
        </Button>

        {app.distress === "Active" && (
          <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
            <ShieldAlert className="mt-0.5 h-5 w-5 text-destructive" />
            <div>
              <div className="font-semibold text-destructive">Distress Alert Active</div>
              <p className="text-sm text-muted-foreground">Drought warning + score drop ≥100 points + no active crop insurance. Schedule a field visit before any disbursement.</p>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Score card */}
          <div className="rounded-2xl border bg-card p-6 shadow-score lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">KisanScore</div>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground"><Calendar className="h-3 w-3" />Updated {new Date(app.submittedAt).toLocaleDateString()}</div>
              </div>
              <ScoreBadge band={app.band} />
            </div>
            <div className="my-4 flex justify-center">
              <ScoreGauge score={app.score} size={180} />
            </div>
            <div className="rounded-xl bg-primary-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-primary-700">Loan Recommendation</div>
              <div className="mt-1 font-mono text-2xl font-bold text-primary-900">{formatINRCompact(app.recommendation.amountMin)} – {formatINRCompact(app.recommendation.amountMax)}</div>
              <div className="text-xs text-muted-foreground">@ {app.recommendation.rate}% p.a. · {app.recommendation.tenureMonths} months tenure</div>
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-xl border p-3 text-xs">
              {app.ledger.status === "clear" ? (
                <><ShieldCheck className="h-4 w-4 text-success" /><span className="text-foreground">No existing loans found</span></>
              ) : (
                <><ShieldAlert className="h-4 w-4 text-destructive" /><span className="text-destructive font-medium">Active loan at {app.ledger.bankName}</span></>
              )}
            </div>
          </div>

          {/* Farmer profile + sub-scores */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border bg-card p-6 shadow-elev-sm">
              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14 border-2 border-primary-200">
                  <AvatarFallback className="bg-primary-100 text-base font-bold text-primary-700">{app.farmer.name.split(" ").map(s=>s[0]).join("")}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-foreground">{app.farmer.name}</h2>
                  <div className="mt-0.5 font-mono text-xs text-muted-foreground">{app.farmer.id} · Aadhaar {app.farmer.aadhaarMasked}</div>
                  <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm md:grid-cols-4">
                    <Field icon={MapPin} label="District" value={`${app.farmer.district}, ${app.farmer.state}`} />
                    <Field icon={Sprout} label="Crop" value={app.farmer.primaryCrop + (app.farmer.secondaryCrop ? ` + ${app.farmer.secondaryCrop}` : "")} />
                    <Field icon={Ruler} label="Land" value={`${app.farmer.landAcres} acres`} />
                    <Field icon={Phone} label="Phone" value={app.farmer.phone} />
                  </div>
                </div>
                <Button variant="outline" size="sm" className="rounded-full"><Download className="mr-1.5 h-3.5 w-3.5" />Passport PDF</Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {app.subScores.map(s => (
                <div key={s.key} className="rounded-2xl border bg-card p-4 shadow-elev-sm">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-foreground">{s.label}</div>
                    <div className="font-mono text-sm font-bold text-primary-700">{s.value}<span className="text-muted-foreground">/{s.max}</span></div>
                  </div>
                  <Progress value={(s.value / s.max) * 100} className="mt-3 h-2 [&>div]:bg-primary-500" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* XAI + History */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border bg-card p-6 shadow-elev-sm lg:col-span-2">
            <div className="mb-1 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary-500" />
              <h3 className="text-base font-bold text-foreground">Explainable AI Report</h3>
            </div>
            <p className="text-xs text-muted-foreground">SHAP-based factors driving this score</p>

            <div className="mt-4 rounded-xl border-l-4 border-primary-500 bg-primary-50/50 p-4 text-sm leading-relaxed text-foreground">
              {app.summary}
            </div>

            <div className="mt-5 space-y-2.5">
              {app.xai.map((f, i) => {
                const positive = f.direction === "positive";
                const pct = Math.min(Math.abs(f.contribution) * 2, 100);
                return (
                  <div key={i} className="rounded-xl border p-3.5 transition hover:bg-muted/30">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">{f.label}</div>
                        {f.detail && <div className="mt-0.5 text-xs text-muted-foreground">{f.detail}</div>}
                      </div>
                      <div className={cn(
                        "shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-mono font-bold",
                        positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                      )}>
                        {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {positive ? "+" : ""}{f.contribution}
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className={cn("h-full rounded-full", positive ? "bg-success" : "bg-destructive")} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border bg-card p-5 shadow-elev-sm">
              <h3 className="text-base font-bold text-foreground">Score history</h3>
              <p className="mb-3 text-xs text-muted-foreground">Last 4 seasons</p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={app.scoreHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false}/>
                  <XAxis dataKey="season" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false}/>
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} domain={[300, 1000]}/>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}/>
                  <Line type="monotone" dataKey="score" stroke="hsl(var(--primary-500))" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(var(--primary-500))" }} activeDot={{ r: 6 }}/>
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-2xl border bg-card p-5 shadow-elev-sm">
              <h3 className="text-base font-bold text-foreground">Loan request</h3>
              <div className="mt-3 space-y-2 text-sm">
                <Row label="Requested amount" value={formatINR(app.requestedAmount)} />
                <Row label="Recommended max" value={formatINR(app.recommendation.amountMax)} />
                <Row label="Indicative rate" value={`${app.recommendation.rate}% p.a.`} />
                <Row label="Tenure" value={`${app.recommendation.tenureMonths} months`} />
              </div>
            </div>
          </div>
        </div>

        {/* Decision card — inline form + result on the same surface */}
        <div className={cn(
          "sticky bottom-4 z-10 mt-6 rounded-2xl border bg-card/95 p-5 shadow-elev-lg backdrop-blur transition-colors",
          decision?.action === "Approved" && "border-success/40 bg-success/5",
          decision?.action === "Rejected" && "border-destructive/40 bg-destructive/5",
        )}>
          {/* Result view */}
          {decision ? (
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-3">
                <div className={cn(
                  "grid h-10 w-10 shrink-0 place-items-center rounded-full",
                  decision.action === "Approved" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
                )}>
                  {decision.action === "Approved" ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                </div>
                <div className="min-w-0">
                  <div className={cn(
                    "text-sm font-bold",
                    decision.action === "Approved" ? "text-success" : "text-destructive"
                  )}>
                    Application {decision.action.toLowerCase()} for {app.farmer.name}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    By {decision.by} · {decision.at}
                  </div>
                  <div className="mt-2 rounded-lg border bg-card p-3 text-sm text-foreground">
                    <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Comment</div>
                    <p className="mt-1 leading-relaxed">{decision.comment}</p>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="shrink-0 text-muted-foreground hover:text-foreground" onClick={reset}>
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Undo
              </Button>
            </div>
          ) : pending ? (
            // Inline comment form
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {pending === "Approved" ? "Approve loan" : "Reject application"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Add an audit comment (min 10 characters). Decisions are immutable once confirmed.
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setPending(null); setComment(""); }}>Cancel</Button>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dec-comment" className="text-xs">Comment</Label>
                <Textarea
                  id="dec-comment"
                  autoFocus
                  rows={3}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder={pending === "Approved"
                    ? "e.g. Strong NDVI, ledger clear, recommend ₹1.5L KCC at 7%."
                    : "e.g. Insufficient collateral; suggest re-application after Rabi season."}
                />
                <div className="text-[11px] text-muted-foreground">{comment.trim().length}/10 minimum</div>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => submit(pending)}
                  className={cn(
                    "rounded-full",
                    pending === "Approved"
                      ? "bg-primary-500 text-primary-foreground hover:bg-primary-600 shadow-green"
                      : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  )}
                >
                  {pending === "Approved" ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <XCircle className="mr-2 h-4 w-4" />}
                  Confirm {pending === "Approved" ? "approval" : "rejection"}
                </Button>
              </div>
            </div>
          ) : (
            // Default action bar
            <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm font-semibold text-foreground">Make a decision</div>
                <div className="text-xs text-muted-foreground">All decisions are immutable and audit-logged.</div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="rounded-full border-destructive/40 text-destructive hover:bg-destructive/10"
                  onClick={() => setPending("Rejected")}
                >
                  <XCircle className="mr-2 h-4 w-4" /> Reject
                </Button>
                <Button
                  className="rounded-full bg-primary-500 text-primary-foreground hover:bg-primary-600 shadow-green"
                  onClick={() => setPending("Approved")}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Approve loan
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function Field({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-medium text-foreground">{value}</div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-dashed py-1.5 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-semibold text-foreground">{value}</span>
    </div>
  );
}

