import { useState } from "react";
import { Bell, AlertTriangle, CheckCircle2, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface Notif {
  id: string;
  icon: typeof Bell;
  title: string;
  desc: string;
  time: string;
  to?: string;
  tone: "danger" | "success" | "info";
  read?: boolean;
}

const SEED: Notif[] = [
  { id: "n1", icon: AlertTriangle, title: "New distress alert", desc: "Sunita Devi · Vidisha · score dropped 120 pts", time: "2m ago", to: "/dashboard/distress", tone: "danger" },
  { id: "n2", icon: FileText, title: "5 new applications", desc: "Awaiting review in your queue", time: "1h ago", to: "/dashboard/applications", tone: "info" },
  { id: "n3", icon: CheckCircle2, title: "Loan disbursed", desc: "Ramesh Kumar · ₹1.5L KCC approved", time: "Yesterday", tone: "success", read: true },
  { id: "n4", icon: AlertTriangle, title: "Drought warning", desc: "Marathwada region · 12 farmers affected", time: "2d ago", to: "/dashboard/distress", tone: "danger", read: true },
];

export function NotificationsBell() {
  const [items, setItems] = useState<Notif[]>(SEED);
  const [open, setOpen] = useState(false);
  const unread = items.filter(i => !i.read).length;

  const markAll = () => setItems(items.map(i => ({ ...i, read: true })));
  const dismiss = (id: string) => setItems(items.filter(i => i.id !== id));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full" aria-label={`Notifications (${unread} unread)`}>
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <div className="text-sm font-bold text-foreground">Notifications</div>
            <div className="text-xs text-muted-foreground">{unread} unread</div>
          </div>
          {unread > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs text-primary-700 hover:bg-primary-50" onClick={markAll}>
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-[380px]">
          {items.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">You're all caught up 🎉</div>
          ) : (
            <ul className="divide-y">
              {items.map(n => {
                const Inner = (
                  <div className={cn("flex gap-3 p-4 transition hover:bg-muted/40", !n.read && "bg-primary-50/30")}>
                    <div className={cn(
                      "grid h-9 w-9 shrink-0 place-items-center rounded-full",
                      n.tone === "danger" && "bg-destructive/10 text-destructive",
                      n.tone === "success" && "bg-success/10 text-success",
                      n.tone === "info" && "bg-primary-100 text-primary-700",
                    )}>
                      <n.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm font-semibold text-foreground">{n.title}</div>
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); dismiss(n.id); }}
                          className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          aria-label="Dismiss"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.desc}</p>
                      <div className="mt-1 text-[11px] text-muted-foreground/80">{n.time}</div>
                    </div>
                  </div>
                );
                return (
                  <li key={n.id}>
                    {n.to ? (
                      <Link to={n.to} onClick={() => setOpen(false)}>{Inner}</Link>
                    ) : Inner}
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>
        <div className="border-t p-2">
          <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-foreground" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
