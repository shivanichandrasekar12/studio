
"use client";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, BellRing, ListChecks, Loader2, AlertCircle } from "lucide-react";
import type { NotificationItem } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCustomerNotifications, markCustomerNotificationAsRead, markAllCustomerNotificationsAsRead } from "@/lib/services/notificationsService";
import { auth } from "@/lib/firebase";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";

export default function CustomerNotificationsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const customerId = currentUser?.uid;

  const { data: notifications = [], isLoading: isLoadingNotifications, error: notificationsError } = useQuery<NotificationItem[], Error>({
    queryKey: ["customerNotifications", customerId],
    queryFn: () => {
      if (!customerId) return Promise.resolve([]);
      return getCustomerNotifications(customerId);
    },
    enabled: !!customerId,
  });

  const { mutate: markAsReadMutation, isPending: isMarkingAsRead } = useMutation({
    mutationFn: markCustomerNotificationAsRead,
    onSuccess: (data, notificationId) => {
      queryClient.invalidateQueries({ queryKey: ["customerNotifications", customerId] });
      queryClient.invalidateQueries({ queryKey: ["headerNotifications", 'customer', customerId] }); 
      toast({ title: "Notification Marked as Read"});
    },
    onError: (error) => {
      toast({ title: "Error Marking Read", description: error.message, variant: "destructive" });
    },
  });
  
  const { mutate: markAllAsReadMutation, isPending: isMarkingAllAsRead } = useMutation({
    mutationFn: () => {
      if (!customerId) throw new Error("Customer ID is required to mark all as read.");
      return markAllCustomerNotificationsAsRead(customerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customerNotifications", customerId] });
      queryClient.invalidateQueries({ queryKey: ["headerNotifications", 'customer', customerId] });
      toast({ title: "All Notifications Marked as Read" });
    },
    onError: (error: any) => {
      toast({ title: "Error Marking All Read", description: error.message, variant: "destructive" });
    },
  });

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation(notificationId);
  };
  
  const handleMarkAllAsRead = () => {
    if (!customerId) {
        toast({ title: "Error", description: "Could not identify user.", variant: "destructive" });
        return;
    }
    markAllAsReadMutation();
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  
  if (!currentUser && !auth.currentUser) {
     return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading user data...</p>
      </div>
    );
  }

  if (notificationsError) {
    return (
     <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Fetching Notifications</AlertTitle>
          <AlertDescription>{notificationsError.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="My Notifications" description="Stay updated with alerts about your bookings and more.">
        <Button onClick={handleMarkAllAsRead} disabled={unreadCount === 0 || isMarkingAllAsRead || !customerId}>
          {isMarkingAllAsRead ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ListChecks className="mr-2 h-4 w-4" />}
           Mark All as Read
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BellRing className="mr-2 h-5 w-5 text-primary" /> Notification Center
          </CardTitle>
          <CardDescription>
            You have {isLoadingNotifications ? "..." : unreadCount} unread notification{unreadCount === 1 ? "" : "s"}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingNotifications ? (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <li key={i} className="flex items-start space-x-4 p-4 rounded-lg border">
                        <Skeleton className="h-5 w-5 rounded-full mt-1" />
                        <div className="flex-1 space-y-1">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                             <Skeleton className="h-3 w-1/4" />
                        </div>
                    </li>
                ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <BellRing className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg font-medium">No notifications yet.</p>
              <p className="text-sm">We'll let you know when something new comes up!</p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-20rem)] pr-3"> 
              <ul className="space-y-4">
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className={cn(
                      "flex items-start space-x-4 p-4 rounded-lg border transition-colors",
                      notification.read ? "bg-muted/50 border-transparent" : "bg-card border-primary/20",
                      notification.link && "cursor-pointer hover:bg-accent/50"
                    )}
                    onClick={() => {
                      if (notification.link) {
                        router.push(notification.link);
                      }
                      if (!notification.read) {
                        handleMarkAsRead(notification.id);
                      }
                    }}
                  >
                    <div className={cn("mt-1", notification.read ? "text-muted-foreground" : "text-primary")}>
                      {notification.read ? <CheckCircle className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className={cn("text-sm font-medium leading-none", !notification.read && "text-foreground")}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {notification.timestamp ? formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true }) : 'N/A'}
                        </p>
                      </div>
                      <p className={cn("text-sm", notification.read ? "text-muted-foreground" : "text-foreground/90")}>
                        {notification.description}
                      </p>
                      {!notification.read && (
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 h-auto text-xs text-primary"
                          onClick={(e) => {
                            e.stopPropagation(); 
                            handleMarkAsRead(notification.id);
                          }}
                          disabled={isMarkingAsRead}
                        >
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </>
  );
}
