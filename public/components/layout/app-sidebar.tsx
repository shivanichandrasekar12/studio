
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
  Bell,
  MessageSquareText,
  UserCircle, 
  ShieldCheck, 
  ShoppingCart,
  PlusCircle 
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
import type { NavItem, UserRole } from "@/types";
import { Separator } from "../ui/separator";
import { useToast } from "@/hooks/use-toast";
import type { User } from "firebase/auth"; // Import User type
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AppSidebarProps {
  userRole: UserRole;
  currentUser: User | null; // Add currentUser prop
}

const getNavItems = (role: UserRole): NavItem[] => {
  const baseDashboardPath = `/${role}/dashboard`; 
  if (role === "agency") {
    return [
      { title: "Dashboard", href: `${baseDashboardPath}`, icon: LayoutDashboard },
      { title: "Employees", href: `${baseDashboardPath}/employees`, icon: Users },
      { title: "Vehicles", href: `${baseDashboardPath}/vehicles`, icon: Truck },
      { title: "Bookings", href: `${baseDashboardPath}/bookings`, icon: CalendarDays },
      { title: "Notifications", href: `${baseDashboardPath}/notifications`, icon: Bell },
      { title: "Reviews", href: `${baseDashboardPath}/reviews`, icon: MessageSquareText },
      { title: "AI Allocation", href: `${baseDashboardPath}/ai-vehicle-allocation`, icon: Wand2 },
    ];
  }
  if (role === "customer") {
    return [
      { title: "Dashboard", href: `${baseDashboardPath}`, icon: LayoutDashboard },
      { title: "My Bookings", href: `${baseDashboardPath}/my-bookings`, icon: ShoppingCart },
      { title: "Book New Ride", href: `${baseDashboardPath}/book-new`, icon: PlusCircle },
      { title: "Notifications", href: `${baseDashboardPath}/notifications`, icon: Bell },
      { title: "My Reviews", href: `${baseDashboardPath}/my-reviews`, icon: MessageSquareText },
    ];
  }
  if (role === "admin") {
    return [
      { title: "Overview", href: `${baseDashboardPath}`, icon: LayoutDashboard },
      { title: "Manage Users", href: `${baseDashboardPath}/users`, icon: Users }, 
      { title: "Manage Agencies", href: `${baseDashboardPath}/agencies`, icon: Briefcase }, 
      { title: "Platform Bookings", href: `${baseDashboardPath}/all-bookings`, icon: CalendarDays }, 
      { title: "System Settings", href: `${baseDashboardPath}/system-settings`, icon: Settings }, 
    ];
  }
  return [];
};

export function AppSidebar({ userRole, currentUser }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { state, isMobile } = useSidebar();

  const navItems = getNavItems(userRole);
  const baseDashboardPath = `/${userRole}/dashboard`;
  const baseAuthPath = `/${userRole}/auth`; 

  const isCollapsed = state === "collapsed" && !isMobile;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      router.push(`${baseAuthPath}/login`);
    } catch (error) {
      console.error("Logout failed:", error);
      toast({
        title: "Logout Failed",
        description: "An error occurred during logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSettingsClick = () => {
    router.push(`${baseDashboardPath}/settings`);
  };
  
  const getAvatarFallback = () => {
    if (currentUser?.displayName) return currentUser.displayName.substring(0, 2).toUpperCase();
    if (currentUser?.email) return currentUser.email.substring(0, 2).toUpperCase();
    if (userRole === "agency") return "AG";
    if (userRole === "customer") return "CU";
    if (userRole === "admin") return "AD";
    return "U";
  }
  
  const getUserEmail = () => {
     return currentUser?.email || "user@example.com";
  }

  const getUserDisplayName = () => {
     return currentUser?.displayName || currentUser?.email?.split('@')[0] || (userRole.charAt(0).toUpperCase() + userRole.slice(1) + " User");
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Link href={baseDashboardPath} className="flex items-center gap-2">
          {userRole === 'admin' ? <ShieldCheck className="h-8 w-8 text-primary" /> : <Briefcase className="h-8 w-8 text-primary" />}
          {!isCollapsed && <span className="text-xl font-semibold text-sidebar-foreground">NomadX</span>}
        </Link>
         {!isCollapsed && <span className="text-xs text-muted-foreground -mt-1 ml-10 capitalize">{userRole} Portal</span>}
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  isActive={pathname === item.href || (item.href !== baseDashboardPath && pathname.startsWith(item.href))}
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
            <AvatarImage src={currentUser?.photoURL || `https://placehold.co/100x100.png?text=${getAvatarFallback()}`} alt="User Avatar" data-ai-hint="user avatar"/>
            <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium text-sidebar-foreground truncate" title={getUserDisplayName()}>{getUserDisplayName()}</span>
              <span className="text-xs text-muted-foreground truncate" title={getUserEmail()}>{getUserEmail()}</span>
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
                    className="w-full justify-start"
                    tooltip={isCollapsed ? "Profile" : undefined}
                    aria-label="Profile"
                    onClick={() => router.push(`${baseDashboardPath}/profile`)} 
                    asChild={isCollapsed}
                  >
                    {isCollapsed ? (
                       <UserCircle />
                    ) : (
                      <>
                       <UserCircle /> <span>Profile</span>
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
