import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { getPortfolio } from "@/lib/mock-data";
import type { PortfolioMetrics } from "@/lib/types";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Cell, PieChart, Pie, Legend } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BAND_COLORS: Record<string, string> = {
  Excellent: "hsl(var(--score-excellent))",
  Good: "hsl(var(--score-good))",
  Fair: "hsl(var(--score-fair))",
  Poor: "hsl(var(--score-poor))",
};

export default function Analytics() {
  const [p, setP] = useState<PortfolioMetrics | null>(null);
  useEffect(() => { getPortfolio().then(setP); }, []);
  if (!p) return null;

  return (
    <>
      <DashboardHeader title="Portfolio Analytics" subtitle="Branch-level lending performance" />
      <main className="flex-1 space-y-6 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Showing all data for Nashik branch</div>
          <Select defaultValue="month">
            <SelectTrigger className="h-9 w-40 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="month">This month</SelectItem>
              <SelectItem value="quarter">This quarter</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border bg-card p-5 shadow-elev-sm">
            <h3 className="text-base font-bold text-foreground">Applications by district</h3>
            <p className="mb-4 text-xs text-muted-foreground">Sorted by volume</p>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={p.byDistrict} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false}/>
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}/>
                <YAxis dataKey="district" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} width={90}/>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}/>
                <Bar dataKey="count" fill="hsl(var(--primary-500))" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-elev-sm">
            <h3 className="text-base font-bold text-foreground">Score band breakdown</h3>
            <p className="mb-4 text-xs text-muted-foreground">% of total applications</p>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={p.byBand} dataKey="count" nameKey="band" cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={2}>
                  {p.byBand.map((b, i) => <Cell key={i} fill={BAND_COLORS[b.band]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}/>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-elev-sm">
          <h3 className="text-base font-bold text-foreground">Approvals vs applications</h3>
          <p className="mb-4 text-xs text-muted-foreground">Last 6 months</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={p.monthlyTrend} margin={{ top: 10, right: 20, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false}/>
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}/>
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}/>
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}/>
              <Legend />
              <Bar dataKey="applications" fill="hsl(var(--primary-500))" radius={[8, 8, 0, 0]} />
              <Bar dataKey="approvals" fill="hsl(var(--teal-500))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </main>
    </>
  );
}
