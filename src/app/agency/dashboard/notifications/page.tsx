"use client";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, BellRing, ListChecks } from "lucide-react";
import { useState } from "react";
import type { NotificationItem } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

const initialNotifications: NotificationItem[] = [
  { id: "1", title: "New Booking Request", description: "John Doe - Toyota Camry - Tomorrow 10 AM", timestamp: new Date(Date.now() - 3600000 * 1), read: false, link: "/agency/dashboard/bookings" },
  { id: "2", title: "Vehicle Maintenance Due", description: "Sedan XYZ-123 - Oil Change", timestamp: new Date(Date.now() - 3600000 * 5), read: false, link: "/agency/dashboard/vehicles" },
  { id: "3", title: "Employee Shift Reminder", description: "Jane Smith - Starts in 1 hour", timestamp: new Date(Date.now() - 3600000 * 0.5), read: true },
  { id: "4", title: "Monthly Report Ready", description: "October's performance report is available for download.", timestamp: new Date(Date.now() - 3600000 * 24 * 2), read: true, link: "/agency/dashboard/reports" },
  { id: "5", title: "Low Tire Pressure Alert", description: "SUV ABC-789 reported low tire pressure on the front-left tire.", timestamp: new Date(Date.now() - 3600000 * 3), read: false, link: "/agency/dashboard/vehicles/2" },
  { id: "6", title: "New Customer Review", description: "Alice Johnson left a 5-star review for their recent trip.", timestamp: new Date(Date.now() - 3600000 * 8), read: true },
];


export default function AgencyNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const { toast } = useToast();

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    toast({
      title: "Notification Marked as Read",
      description: "The notification status has been updated.",
    });
  };
  
  const handleMarkAllAsRead = () => {
    setNotifications(prevNotifications =>
      prevNotifications.map(n => ({ ...n, read: true }))
    );
    toast({
      title: "All Notifications Marked as Read",
      description: "All notifications have been updated.",
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <PageHeader title="All Notifications" description="View and manage all your notifications.">
        <Button onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
          <ListChecks className="mr-2 h-4 w-4" /> Mark All as Read
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BellRing className="mr-2 h-5 w-5 text-primary" /> Notification Center
          </CardTitle>
          <CardDescription>
            You have {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length > 0 ? (
            <ScrollArea className="h-[calc(100vh-20rem)] pr-3"> {/* Adjust height as needed */}
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
                        // For now, just log, actual navigation might be complex if using router from here
                        console.log(`Navigate to: ${notification.link}`);
                        toast({ title: "Navigating...", description: `To ${notification.title}` });
                        // router.push(notification.link); // Would need router instance
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
                          {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
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
                            e.stopPropagation(); // Prevent li onClick from firing again
                            handleMarkAsRead(notification.id);
                          }}
                        >
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <BellRing className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg font-medium">No notifications yet.</p>
              <p className="text-sm">Check back later for updates.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
