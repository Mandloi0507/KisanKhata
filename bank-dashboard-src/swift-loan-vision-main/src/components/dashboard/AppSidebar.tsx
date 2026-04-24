import { LayoutDashboard, Users, AlertTriangle, BarChart3, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, SidebarHeader, useSidebar,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getPortfolio } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { useEffect, useState } from "react";

const mainBase = [
  { title: "Overview",      url: "/dashboard",              icon: LayoutDashboard },
  { title: "Applications",  url: "/dashboard/applications", icon: Users },
  { title: "Distress Alerts", url: "/dashboard/distress",   icon: AlertTriangle, badge: 0 },
  { title: "Analytics",     url: "/dashboard/analytics",    icon: BarChart3 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { banker, signOut } = useAuth();
  const nav = useNavigate();
  const [main, setMain] = useState(mainBase);

  useEffect(() => {
    getPortfolio().then(p => {
      if (p) {
        setMain(prev => prev.map(item => 
          item.title === "Distress Alerts" ? { ...item, badge: p.activeDistress } : item
        ));
      }
    });
  }, []);

  const handleLogout = () => {
    signOut();
    toast.success("Signed out");
    nav("/", { replace: true });
  };

  const initials = banker?.initials || "BN";
  const displayName = banker?.name || "Banker";
  const branch = banker?.branch || "Branch";

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        {!collapsed ? (
          <Logo variant="light" />
        ) : (
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary">
            <span className="text-sm font-bold text-primary-foreground">K</span>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-sidebar-foreground/60">Main</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {main.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild className="h-10">
                    <NavLink to={item.url} end={item.url === "/dashboard"}>
                      {({ isActive }) => (
                        <div className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                        )}>
                          <item.icon className="h-4 w-4 shrink-0" />
                          {!collapsed && <span className="flex-1">{item.title}</span>}
                          {!collapsed && item.badge ? (
                            <span className="rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-destructive-foreground">
                              {item.badge}
                            </span>
                          ) : null}
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>


      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className={cn("flex items-center gap-3 rounded-lg p-2", collapsed && "justify-center")}>
          <Avatar className="h-9 w-9 border-2 border-sidebar-primary">
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold">{initials}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <div className="truncate text-sm font-semibold text-sidebar-foreground">{displayName}</div>
              <div className="truncate text-xs text-sidebar-foreground/60">{branch}</div>
            </div>
          )}
          {!collapsed && (
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Log out"
              className="rounded p-1 text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
