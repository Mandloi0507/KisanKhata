import { useEffect, useState } from "react";
import { Users, CheckCircle2, AlertTriangle, TrendingUp, Download, ArrowUpRight } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCard } from "@/components/StatCard";
import { ScoreBadge } from "@/components/ScoreBadge";
import { Button } from "@/components/ui/button";
import { getApplications, getPortfolio } from "@/lib/mock-data";
import type { Application, PortfolioMetrics } from "@/lib/types";
import { formatINRCompact } from "@/lib/score";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Cell,
} from "recharts";

export default function Overview() {
  const [apps, setApps] = useState<Application[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioMetrics | null>(null);

  useEffect(() => {
    getApplications().then(setApps);
    getPortfolio().then(setPortfolio);
  }, []);

  if (!portfolio) return null;
  const recent = apps.slice(0, 6);

  const bandColors: Record<string, string> = {
    Excellent: "hsl(var(--score-excellent))",
    Good: "hsl(var(--score-good))",
    Fair: "hsl(var(--score-fair))",
    Poor: "hsl(var(--score-poor))",
  };

  return (
    <>
      <DashboardHeader title="Overview" subtitle="Portfolio snapshot · Updated just now" />

      <main className="flex-1 space-y-6 p-4 md:p-6">
        {/* Welcome banner */}
        <div className="overflow-hidden rounded-2xl bg-gradient-primary p-6 text-primary-foreground shadow-green md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-xs font-medium uppercase tracking-widest text-primary-100/80">Good morning, Priya</div>
              <h2 className="mt-1 text-2xl font-bold md:text-3xl">You have <span className="text-card">{apps.filter(a => a.status === "Pending").length} pending</span> applications today</h2>
              <p className="mt-1 max-w-xl text-sm text-primary-100">
                {portfolio.activeDistress} active distress alerts need acknowledgement within 48 hours.
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="secondary" className="rounded-full bg-card text-primary-700 hover:bg-card/90">
                <Link to="/dashboard/distress">Review distress</Link>
              </Button>
              <Button variant="ghost" className="rounded-full border border-primary-300/40 text-primary-foreground hover:bg-primary-700/40">
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Applications" value={portfolio.totalApplications.toString()} delta="+12 this week" trend="up" icon={Users} accent="green" />
          <StatCard label="Approval Rate" value={`${(portfolio.approvalRate * 100).toFixed(0)}%`} delta="+3.2% vs last month" trend="up" icon={CheckCircle2} accent="teal" />
          <StatCard label="Avg Approved Score" value={portfolio.avgApprovedScore.toString()} delta="Excellent band" trend="flat" icon={TrendingUp} accent="earth" />
          <StatCard label="Active Distress" value={portfolio.activeDistress.toString()} delta="Needs review" trend="down" icon={AlertTriangle} accent="muted" className="border-destructive/30" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Trend chart */}
          <div className="rounded-2xl border bg-card p-5 shadow-elev-sm lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">Applications & Approvals</h3>
                <p className="text-xs text-muted-foreground">Last 6 months</p>
              </div>
              <div className="flex gap-2 text-xs">
                <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary-500" /><span className="text-muted-foreground">Applications</span></div>
                <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-teal-500" /><span className="text-muted-foreground">Approvals</span></div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={portfolio.monthlyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="appsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary-500))" stopOpacity={0.35}/>
                    <stop offset="100%" stopColor="hsl(var(--primary-500))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="apprGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--teal-500))" stopOpacity={0.35}/>
                    <stop offset="100%" stopColor="hsl(var(--teal-500))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false}/>
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}/>
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}/>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}/>
                <Area type="monotone" dataKey="applications" stroke="hsl(var(--primary-500))" strokeWidth={2.5} fill="url(#appsGrad)"/>
                <Area type="monotone" dataKey="approvals" stroke="hsl(var(--teal-500))" strokeWidth={2.5} fill="url(#apprGrad)"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Score band distribution */}
          <div className="rounded-2xl border bg-card p-5 shadow-elev-sm">
            <h3 className="mb-1 text-base font-bold text-foreground">Score Distribution</h3>
            <p className="mb-4 text-xs text-muted-foreground">Across all applications</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={portfolio.byBand} layout="vertical" margin={{ left: 0, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false}/>
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}/>
                <YAxis dataKey="band" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} width={70}/>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}/>
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  {portfolio.byBand.map((b, i) => <Cell key={i} fill={bandColors[b.band]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent applications */}
        <div className="rounded-2xl border bg-card shadow-elev-sm">
          <div className="flex items-center justify-between border-b p-5">
            <div>
              <h3 className="text-base font-bold text-foreground">Recent applications</h3>
              <p className="text-xs text-muted-foreground">Latest submissions awaiting review</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-primary-700 hover:bg-primary-50">
              <Link to="/dashboard/applications">View all <ArrowUpRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Farmer</th>
                  <th className="px-5 py-3 text-left font-medium">District</th>
                  <th className="px-5 py-3 text-left font-medium">Crop</th>
                  <th className="px-5 py-3 text-left font-medium">KisanScore</th>
                  <th className="px-5 py-3 text-left font-medium">Recommendation</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {recent.map(a => (
                  <tr key={a.id} className="border-t transition hover:bg-muted/30">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-foreground">{a.farmer.name}</div>
                      <div className="font-mono text-xs text-muted-foreground">{a.farmer.id}</div>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{a.farmer.district}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{a.farmer.primaryCrop}</td>
                    <td className="px-5 py-3.5"><ScoreBadge band={a.band} score={a.score} /></td>
                    <td className="px-5 py-3.5 font-mono text-xs text-foreground">{formatINRCompact(a.recommendation.amountMin)}–{formatINRCompact(a.recommendation.amountMax)} @ {a.recommendation.rate}%</td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{a.status}</span>
                      {a.distress === "Active" && <span className="ml-1.5 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">Distress</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <Button asChild size="sm" className="h-8 rounded-lg bg-primary-500 text-primary-foreground hover:bg-primary-600">
                        <Link to={`/dashboard/applications/${a.id}`}>Review</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
