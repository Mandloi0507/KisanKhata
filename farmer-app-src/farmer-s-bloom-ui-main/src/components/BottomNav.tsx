import { Link, useLocation } from "@tanstack/react-router";
import { Home, History, FileText, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/dashboard", icon: Home, label: "Home", hi: "होम" },
  { to: "/history", icon: History, label: "History", hi: "इतिहास" },
  { to: "/passport", icon: FileText, label: "Passport", hi: "पासपोर्ट" },
  { to: "/profile", icon: User, label: "Profile", hi: "प्रोफ़ाइल" },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav
      className="
        sticky bottom-0 left-0 right-0 z-40
        bg-surface/95 backdrop-blur-md border-t border-border
        px-3 pt-2 pb-3
      "
    >
      <div className="flex items-end justify-between">
        {items.map(({ to, icon: Icon, label, hi }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-1 rounded-2xl transition-colors",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "h-10 w-10 flex items-center justify-center rounded-2xl transition-all",
                  active
                    ? "bg-primary text-primary-foreground shadow-green"
                    : "bg-transparent"
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-[10px] font-medium leading-none">{label}</span>
              <span lang="hi" className="font-hi text-[9px] opacity-70 leading-none">
                {hi}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
