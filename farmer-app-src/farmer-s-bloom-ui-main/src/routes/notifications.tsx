import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Info, AlertTriangle } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { ScreenHeader } from "@/components/ScreenHeader";
import { notifications } from "@/lib/mock-data";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [{ title: "Notifications — KisanKhata" }],
  }),
  component: () => (
    <PhoneShell>
      <Notifications />
    </PhoneShell>
  ),
});

const map = {
  success: { Icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  info: { Icon: Info, color: "text-info", bg: "bg-info/10" },
  warning: { Icon: AlertTriangle, color: "text-warning", bg: "bg-warning/15" },
};

function Notifications() {
  return (
    <div className="min-h-full flex flex-col bg-surface-soft pb-6">
      <ScreenHeader title="Notifications" titleHi="सूचनाएँ" back="/dashboard" />
      <div className="px-5 space-y-2 flex-1">
        {notifications.map((n) => {
          const m = map[n.type];
          const I = m.Icon;
          return (
            <div
              key={n.id}
              className="flex gap-3 rounded-2xl bg-white border border-border p-4"
            >
              <span
                className={`h-10 w-10 rounded-xl grid place-items-center shrink-0 ${m.bg} ${m.color}`}
              >
                <I className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold text-sm leading-snug">
                    {n.title}
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {n.time}
                  </span>
                </div>
                <p lang="hi" className="font-hi text-[11px] text-muted-foreground">
                  {n.titleHi}
                </p>
                <p className="text-sm text-foreground mt-1.5">{n.body}</p>
                <p lang="hi" className="font-hi text-xs text-muted-foreground mt-0.5">
                  {n.bodyHi}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
