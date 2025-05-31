
"use client";

import { Bell, Menu, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar, SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import type { NotificationItem, UserRole } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAgencyNotifications, markAgencyNotificationAsRead } from "@/lib/services/notificationsService"; 
import type { User } from "firebase/auth"; // Import User type
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";


interface AppHeaderProps {
  title: string;
  userRole: UserRole;
  currentUser: User | null; // Add currentUser prop
}

export function AppHeader({ title, userRole, currentUser }: AppHeaderProps) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: headerNotifications = [], isLoading: isLoadingHeaderNotifications } = useQuery<NotificationItem[], Error>({
    queryKey: ["headerNotifications", userRole], 
    queryFn: () => {
      if (userRole === 'agency') {
        return getAgencyNotifications(5); 
      }
      return Promise.resolve([]); 
    },
    enabled: !!userRole && !!currentUser, // Only run if userRole and currentUser are available
  });


  const { mutate: markAsReadMutation } = useMutation({
    mutationFn: markAgencyNotificationAsRead, 
    onSuccess: (data, notificationId) => {
      queryClient.invalidateQueries({ queryKey: ["headerNotifications", userRole] });
      queryClient.invalidateQueries({ queryKey: ["agencyNotifications"] }); 
    }
  });


  const unreadCount = headerNotifications.filter(n => !n.read).length;
  
  const baseDashboardPath = `/${userRole}/dashboard`;
  const baseAuthPath = `/${userRole}/auth/login`; 

  const handleLogout = async () => {
     try {
      await signOut(auth);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      router.push(baseAuthPath);
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

  const handleProfileClick = () => {
    router.push(`${baseDashboardPath}/profile`);
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.read && userRole === 'agency') { 
      markAsReadMutation(notification.id);
    }
    toast({
      title: `Notification: ${notification.title}`,
      description: notification.link ? `Navigating to details...` : "Marked as read.",
    });
    if (notification.link) {
      router.push(notification.link); 
    }
  };

  const handleViewAllNotifications = () => {
    router.push(`${baseDashboardPath}/notifications`);
  };

  const getAvatarFallback = () => {
    if (currentUser?.displayName) return currentUser.displayName.substring(0, 2).toUpperCase();
    if (currentUser?.email) return currentUser.email.substring(0, 2).toUpperCase();
    if (userRole === "agency") return "AG";
    if (userRole === "customer") return "CU";
    if (userRole === "admin") return "AD";
    return "U";
  }

  const getAvatarSrc = () => {
     return currentUser?.photoURL || `https://placehold.co/40x40.png?text=${getAvatarFallback()}`;
  }


  return (
    <header className="flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30">
       {isMobile ? (
         <SidebarTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SidebarTrigger>
       ) : (
        <SidebarTrigger aria-label="Toggle Sidebar" />
       )}

      <h1 className="text-xl font-semibold hidden md:block">{title}</h1>

      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <form className="ml-auto flex-1 sm:flex-initial">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
            />
          </div>
        </form>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-full">
              <Bell className="h-5 w-5" />
              {isLoadingHeaderNotifications && <Loader2 className="absolute top-0 right-0 h-3 w-3 animate-spin"/>}
              {!isLoadingHeaderNotifications && unreadCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-primary-foreground transform translate-x-1/2 -translate-y-1/2 bg-accent rounded-full">
                  {unreadCount}
                </span>
              )}
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isLoadingHeaderNotifications ? (
                <DropdownMenuItem disabled className="text-center"><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Loading...</DropdownMenuItem>
            ) : headerNotifications.length > 0 ? (
              headerNotifications.map(notification => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex flex-col items-start cursor-pointer ${notification.read ? 'opacity-60' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <p className={`font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>{notification.title}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[250px]">{notification.description}</p>
                  <p className="text-xs text-muted-foreground/80 mt-0.5">
                    {notification.timestamp ? formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true }) : 'N/A'}
                  </p>
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled className="text-center text-muted-foreground">No new notifications</DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-primary hover:!text-primary cursor-pointer" onClick={handleViewAllNotifications}>
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={getAvatarSrc()} alt={`${userRole} Avatar`} data-ai-hint="user profile"/>
                <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
              </Avatar>
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account ({currentUser?.displayName || currentUser?.email?.split('@')[0] || userRole})</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleProfileClick}>Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={handleSettingsClick}>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50">Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
