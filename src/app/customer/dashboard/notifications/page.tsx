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
// import { useRouter } from "next/navigation"; // Import if you want to use router.push

const initialCustomerNotifications: NotificationItem[] = [
  { id: "CN1", title: "Ride Confirmed!", description: "Your booking for Toyota Camry on Oct 26th is confirmed.", timestamp: new Date(Date.now() - 3600000 * 2), read: false, type: "booking" },
  { id: "CN2", title: "Driver Assigned", description: "John D. (Toyota Camry - XYZ 123) is assigned for your ride.", timestamp: new Date(Date.now() - 3600000 * 1), read: false, type: "booking_update" },
  { id: "CN3", title: "Ride Completed", description: "Your trip to City Airport has been completed. Please rate your experience!", timestamp: new Date(Date.now() - 3600000 * 24), read: true, type: "booking_completed", link: "/customer/dashboard/my-reviews" },
  { id: "CN4", title: "Special Offer", description: "Get 10% off on your next SUV booking. Use code SUV10.", timestamp: new Date(Date.now() - 3600000 * 48), read: true, type: "promotion" },
];


export default function CustomerNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialCustomerNotifications);
  const { toast } = useToast();
  // const router = useRouter(); // Initialize if using router.push

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    toast({
      title: "Notification Marked as Read",
    });
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prevNotifications =>
      prevNotifications.map(n => ({ ...n, read: true }))
    );
    toast({
      title: "All Notifications Marked as Read",
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <PageHeader title="My Notifications" description="Stay updated with alerts about your bookings and more.">
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
            <ScrollArea className="h-[calc(100vh-20rem)] pr-3">
              <ul className="space-y-4">
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className={cn(
                      "flex items-start space-x-4 p-4 rounded-lg border transition-colors",
                      notification.read ? "bg-muted/50 border-transparent" : "bg-card border-primary/20",
                      "cursor-pointer hover:bg-accent/50" 
                    )}
                    onClick={() => {
                      if (!notification.read) {
                        handleMarkAsRead(notification.id);
                      }
                      if (notification.link) {
                        // router.push(notification.link); // Uncomment and import router if needed
                        toast({title: "Navigating...", description: `To details for: ${notification.title}`});
                        console.log("Navigate to:", notification.link);
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
                          {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
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
              <p className="text-sm">We'll let you know when something new comes up!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
