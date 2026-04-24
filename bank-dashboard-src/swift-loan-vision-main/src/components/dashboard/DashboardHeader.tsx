import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationsBell } from "./NotificationsBell";

interface Props {
  title: string;
  subtitle?: string;
}

export function DashboardHeader({ title, subtitle }: Props) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
      <div className="hidden md:block">
        <h1 className="text-lg font-bold leading-tight tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="ml-auto flex items-center gap-3">
        <NotificationsBell />
      </div>
    </header>
  );
}
