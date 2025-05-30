
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Briefcase,
  LayoutDashboard,
  Users,
  Truck,
  CalendarDays,
  Wand2,
  LogOut,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { NavItem } from "@/types";
import { Separator } from "../ui/separator";
import { useToast } from "@/hooks/use-toast";

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Employees", href: "/dashboard/employees", icon: Users },
  { title: "Vehicles", href: "/dashboard/vehicles", icon: Truck },
  { title: "Bookings", href: "/dashboard/bookings", icon: CalendarDays },
  { title: "AI Allocation", href: "/dashboard/ai-vehicle-allocation", icon: Wand2 },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { state, isMobile } = useSidebar();

  const isCollapsed = state === "collapsed" && !isMobile;

  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    router.push("/login");
  };

  const handleSettingsClick = () => {
    toast({
      title: "Settings",
      description: "Settings page is a placeholder.",
    });
    router.push("/dashboard/settings");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Briefcase className="h-8 w-8 text-primary" />
          {!isCollapsed && <span className="text-xl font-semibold text-sidebar-foreground">NomadX_Agency</span>}
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  isActive={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))}
                  tooltip={isCollapsed ? item.title : undefined}
                  aria-label={item.title}
                  asChild={isCollapsed}
                >
                  {isCollapsed ? (
                    <item.icon />
                  ) : (
                    <>
                      <item.icon />
                      <span>{item.title}</span>
                    </>
                  )}
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 mt-auto border-t border-sidebar-border">
        {!isCollapsed && <Separator className="my-2 bg-sidebar-border" />}
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : 'px-2 py-2'}`}>
          <Avatar className="h-9 w-9">
            <AvatarImage src="https://placehold.co/100x100.png" alt="User Avatar" data-ai-hint="user avatar" />
            <AvatarFallback>AG</AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-medium text-sidebar-foreground">Agency Admin</span>
              <span className="text-xs text-muted-foreground">admin@agency.com</span>
            </div>
          )}
        </div>
         <SidebarMenu>
            <SidebarMenuItem>
                 <SidebarMenuButton
                    variant="ghost"
                    className="w-full justify-start"
                    tooltip={isCollapsed ? "Settings" : undefined}
                    aria-label="Settings"
                    onClick={handleSettingsClick}
                    asChild={isCollapsed}
                  >
                    {isCollapsed ? (
                       <Settings />
                    ) : (
                      <>
                       <Settings /> <span>Settings</span>
                      </>
                    )}
                  </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                  <SidebarMenuButton
                    variant="ghost"
                    className="w-full justify-start text-red-500 hover:text-red-500 hover:bg-red-500/10 dark:text-red-400 dark:hover:text-red-400 dark:hover:bg-red-400/10"
                    tooltip={isCollapsed ? "Logout" : undefined}
                    aria-label="Logout"
                    onClick={handleLogout}
                    asChild={isCollapsed}
                  >
                     {isCollapsed ? (
                       <LogOut />
                    ) : (
                      <>
                       <LogOut /> <span>Logout</span>
                      </>
                    )}
                  </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
