
"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, ShoppingCart, Bell, UserCircle, MessageSquareText, CalendarDays, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getCustomerBookings } from "@/lib/services/bookingsService";
import { getCustomerNotifications } from "@/lib/services/notificationsService";
import { auth } from "@/lib/firebase";
import { useState, useEffect } from "react";
import type { Booking, NotificationItem } from "@/types";
import { format, formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function CustomerDashboardPage() {
  const [currentUser, setCurrentUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const customerId = currentUser?.uid;

  const { data: bookings = [], isLoading: isLoadingBookings, error: bookingsError } = useQuery<Booking[], Error>({
    queryKey: ["customerUpcomingBookingsDashboard", customerId],
    queryFn: () => {
      if (!customerId) return Promise.resolve([]);
      return getCustomerBookings(customerId);
    },
    enabled: !!customerId,
    select: (data) => data
      .filter(b => new Date(b.pickupDate) >= new Date() && (b.status === "Pending" || b.status === "Confirmed"))
      .sort((a, b) => new Date(a.pickupDate).getTime() - new Date(b.pickupDate).getTime())
      .slice(0, 3), // Show up to 3 upcoming bookings
  });

  const { data: notifications = [], isLoading: isLoadingNotifications, error: notificationsError } = useQuery<NotificationItem[], Error>({
    queryKey: ["customerRecentNotificationsDashboard", customerId],
    queryFn: () => {
      if (!customerId) return Promise.resolve([]);
      return getCustomerNotifications(customerId, 5); // Fetch up to 5 recent notifications
    },
    enabled: !!customerId,
  });
  
  const safeFormat = (dateInput: Date | string | undefined, formatString: string) => {
    if (!dateInput) return "N/A";
    try {
      const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
      if (isNaN(date.getTime())) return "Invalid Date";
      return format(date, formatString);
    } catch {
      return "Invalid Date";
    }
  };
  
  const pageError = bookingsError || notificationsError;

  return (
    <>
      <PageHeader title="Welcome to your Dashboard!" description="Manage your bookings and view your travel history.">
        <Button asChild>
          <Link href="/customer/dashboard/book-new">
            <PlusCircle className="mr-2 h-4 w-4" /> Book New Ride
          </Link>
        </Button>
      </PageHeader>

      {pageError && (
         <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Dashboard Data</AlertTitle>
          <AlertDescription>{pageError.message || "Could not load some dashboard information."}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><ShoppingCart className="mr-2 h-5 w-5 text-primary"/>My Upcoming Bookings</CardTitle>
            <CardDescription>View and manage your scheduled rides.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingBookings ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-full rounded" />
                <Skeleton className="h-6 w-3/4 rounded" />
              </div>
            ) : bookings.length > 0 ? (
              <ul className="space-y-3">
                {bookings.map(booking => (
                  <li key={booking.id} className="text-sm">
                    <p className="font-medium">To: {booking.dropoffLocation}</p>
                    <p className="text-xs text-muted-foreground">
                      On: {safeFormat(booking.pickupDate, "PPp")} - Status: {booking.status}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">You have no upcoming bookings.</p>
            )}
            <Button variant="link" asChild className="px-0 pt-3 h-auto text-sm">
                <Link href="/customer/dashboard/my-bookings">View All Bookings</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><Bell className="mr-2 h-5 w-5 text-primary"/>Recent Notifications</CardTitle>
            <CardDescription>Stay updated with alerts about your bookings.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingNotifications ? (
               <div className="space-y-2">
                <Skeleton className="h-5 w-full rounded" />
                <Skeleton className="h-5 w-5/6 rounded" />
              </div>
            ) : notifications.length > 0 ? (
              <ul className="space-y-2">
                {notifications.slice(0, 3).map(notification => ( // Show max 3 recent
                  <li key={notification.id} className="text-sm">
                    <p className="font-medium truncate">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {notification.timestamp ? formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true }) : 'N/A'}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No new notifications.</p>
            )}
            <Button variant="link" asChild className="px-0 pt-3 h-auto text-sm">
                <Link href="/customer/dashboard/notifications">View All Notifications</Link>
            </Button>
          </CardContent>
        </Card>
        
         <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
             <CardDescription>Access your profile or submit reviews.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/customer/dashboard/profile"><UserCircle className="mr-2 h-4 w-4" />My Profile</Link>
            </Button>
             <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/customer/dashboard/my-reviews"><MessageSquareText className="mr-2 h-4 w-4" />My Reviews</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
