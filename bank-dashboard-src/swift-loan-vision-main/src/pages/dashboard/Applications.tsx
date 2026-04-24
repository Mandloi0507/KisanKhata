import { useEffect, useMemo, useState } from "react";
import { Search, Download, AlertTriangle } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ScoreBadge } from "@/components/ScoreBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getApplications } from "@/lib/mock-data";
import type { Application, ScoreBand } from "@/lib/types";
import { formatINRCompact } from "@/lib/score";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function Applications() {
  const [apps, setApps] = useState<Application[]>([]);
  const [q, setQ] = useState("");
  const [band, setBand] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");

  useEffect(() => { getApplications().then(setApps); }, []);

  const filtered = useMemo(() => apps.filter(a => {
    if (band !== "all" && a.band !== band) return false;
    if (status !== "all" && a.status !== status) return false;
    if (q && !`${a.farmer.name} ${a.farmer.id} ${a.farmer.district}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [apps, q, band, status]);

  return (
    <>
      <DashboardHeader title="Applications" subtitle={`${filtered.length} of ${apps.length} loan applications`} />
      <main className="flex-1 space-y-5 p-4 md:p-6">
        <div className="rounded-2xl border bg-card p-4 shadow-elev-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by farmer, ID or district…" value={q} onChange={e => setQ(e.target.value)}
                     className="h-10 rounded-xl border-border bg-muted/30 pl-9" />
            </div>
            <Select value={band} onValueChange={setBand}>
              <SelectTrigger className="h-10 w-full rounded-xl md:w-44"><SelectValue placeholder="Score band" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All bands</SelectItem>
                <SelectItem value="Excellent">Excellent</SelectItem>
                <SelectItem value="Good">Good</SelectItem>
                <SelectItem value="Fair">Fair</SelectItem>
                <SelectItem value="Poor">Poor</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-10 w-full rounded-xl md:w-44"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Review">In Review</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="h-10 rounded-xl gap-2"><Download className="h-4 w-4" /> Export CSV</Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border bg-card shadow-elev-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Farmer</th>
                  <th className="px-5 py-3 text-left font-medium">Aadhaar</th>
                  <th className="px-5 py-3 text-left font-medium">District</th>
                  <th className="px-5 py-3 text-left font-medium">Land</th>
                  <th className="px-5 py-3 text-left font-medium">KisanScore</th>
                  <th className="px-5 py-3 text-left font-medium">Requested</th>
                  <th className="px-5 py-3 text-left font-medium">Recommended</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id} className={cn(
                    "border-t transition hover:bg-muted/30",
                    a.distress === "Active" && "bg-destructive/[0.03]"
                  )}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        {a.distress === "Active" && <AlertTriangle className="h-4 w-4 text-destructive" />}
                        <div>
                          <div className="font-semibold text-foreground">{a.farmer.name}</div>
                          <div className="font-mono text-xs text-muted-foreground">{a.farmer.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{a.farmer.aadhaarMasked}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{a.farmer.district}<div className="text-xs text-muted-foreground/70">{a.farmer.state}</div></td>
                    <td className="px-5 py-3.5 font-mono text-muted-foreground">{a.farmer.landAcres} ac</td>
                    <td className="px-5 py-3.5"><ScoreBadge band={a.band as ScoreBand} score={a.score} /></td>
                    <td className="px-5 py-3.5 font-mono text-xs">{formatINRCompact(a.requestedAmount)}</td>
                    <td className="px-5 py-3.5 font-mono text-xs">{formatINRCompact(a.recommendation.amountMin)}–{formatINRCompact(a.recommendation.amountMax)} <span className="text-muted-foreground">@ {a.recommendation.rate}%</span></td>
                    <td className="px-5 py-3.5">
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        a.status === "Approved" && "bg-success/10 text-success",
                        a.status === "Rejected" && "bg-destructive/10 text-destructive",
                        a.status === "Pending"  && "bg-muted text-muted-foreground",
                        a.status === "In Review" && "bg-info/10 text-info",
                      )}>{a.status}</span>
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
