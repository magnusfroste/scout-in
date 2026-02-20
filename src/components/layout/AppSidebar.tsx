import { Building2, User, BarChart3, Settings, Search, Shield } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useAdminCheck } from "@/hooks/useAdminCheck";

const items = [{
  title: "Dashboard",
  url: "/",
  icon: BarChart3
}, {
  title: "New Research",
  url: "/research",
  icon: Search
}, {
  title: "Company Profile",
  url: "/company-profile",
  icon: Building2
}, {
  title: "User Profile",
  url: "/user-profile",
  icon: User
}, {
  title: "Settings",
  url: "/settings",
  icon: Settings
}];
export function AppSidebar() {
  const {
    state
  } = useSidebar();
  const location = useLocation();
  const { isAdmin } = useAdminCheck();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";
  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };
  const getNavCls = (active: boolean) => cn("transition-all duration-200", active ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm" : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground");
  return <Sidebar className={cn("border-r border-sidebar-border transition-all duration-300", collapsed ? "w-14" : "w-64")} collapsible="icon">
      {/* Fixed header that remains visible when collapsed */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && <SidebarGroupLabel className="text-sidebar-foreground/60 font-semibold text-xs uppercase tracking-wider">MENU</SidebarGroupLabel>}
        <SidebarTrigger className="h-6 w-6 text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors ml-auto" />
      </div>
      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupContent className="mt-2">
            <SidebarMenu>
              {items.map(item => {
              const active = isActive(item.url);
              return <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavCls(active)}>
                        <item.icon className={cn("h-4 w-4 transition-colors", active ? "text-primary" : "text-sidebar-foreground/70")} />
                        {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>;
            })}
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/admin" className={getNavCls(isActive("/admin"))}>
                      <Shield className={cn("h-4 w-4 transition-colors", isActive("/admin") ? "text-primary" : "text-sidebar-foreground/70")} />
                      {!collapsed && <span className="text-sm font-medium">Admin</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      {/* Version footer - only visible when expanded */}
      {!collapsed && (
        <div className="mt-auto p-4 border-t border-sidebar-border">
          <p className="text-[10px] text-sidebar-foreground/40 font-mono">
            v: {import.meta.env.VITE_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'dev'}
          </p>
        </div>
      )}
    </Sidebar>;
}