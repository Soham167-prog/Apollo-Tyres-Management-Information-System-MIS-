import { LayoutDashboard, Factory, Package, ShoppingCart, DollarSign, Users, Box, LogOut, Shield, Info } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getNavItems } from '@/lib/permissions';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, Factory, Package, ShoppingCart, DollarSign, Users, Box, Shield, Info,
};

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = user ? getNavItems(user.role) : [];

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <div className="flex h-14 items-center gap-2 px-4 border-b border-sidebar-border">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-sidebar-primary">
          <span className="text-sm font-bold text-sidebar-primary-foreground">AT</span>
        </div>
        {!collapsed && <span className="font-display font-semibold text-sidebar-accent-foreground text-sm">Apollo Tyres MIS</span>}
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-[10px] uppercase tracking-wider">Modules</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = iconMap[item.icon] || Box;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.url}
                      tooltip={item.title}
                    >
                      <NavLink to={item.url} end className="hover:bg-sidebar-accent" activeClassName="bg-sidebar-primary text-sidebar-primary-foreground">
                        <Icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-3">
        {!collapsed && user && (
          <div className="mb-2 text-xs text-sidebar-foreground/60">
            <p className="font-medium text-sidebar-accent-foreground">{user.name}</p>
            <p className="capitalize">{user.role}</p>
          </div>
        )}
        <button onClick={logout} className="flex items-center gap-2 text-xs text-sidebar-foreground/60 hover:text-sidebar-accent-foreground transition-colors">
          <LogOut className="h-4 w-4" />
          {!collapsed && 'Logout'}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
