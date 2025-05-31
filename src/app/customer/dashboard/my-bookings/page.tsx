
"use client";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Booking } from "@/types";
import { ShoppingCart, CalendarDays, Loader2, AlertCircle, PlusCircle } from "lucide-react"; // Added PlusCircle
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getCustomerBookings } from "@/lib/services/bookingsService";
import { auth } from "@/lib/firebase";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function MyBookingsPage() {
  const [currentUser, setCurrentUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const customerId = currentUser?.uid;

  const { data: bookings = [], isLoading, error } = useQuery<Booking[], Error>({
    queryKey: ["customerBookings", customerId],
    queryFn: () => {
      if (!customerId) return Promise.resolve([]); // Don't fetch if no customerId
      return getCustomerBookings(customerId);
    },
    enabled: !!customerId, // Only run query if customerId is available
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

  if (!currentUser && !auth.currentUser) { // Check auth.currentUser for initial load robustness
     return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading user data...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Fetching Bookings</AlertTitle>
        <AlertDescription>{error.message || "Could not load your bookings. Please try again later."}</AlertDescription>
      </Alert>
    );
  }


  return (
    <>
      <PageHeader
        title="My Bookings"
        description="View your past, current, and upcoming ride bookings."
      >
        <Button asChild>
          <Link href="/customer/dashboard/book-new">
            <PlusCircle className="mr-2 h-4 w-4" /> Book New Ride
          </Link>
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><ShoppingCart className="mr-2 h-5 w-5 text-primary" />Booking History</CardTitle>
          <CardDescription>
            {isLoading ? "Loading your bookings..." : 
             bookings.length > 0 ? `You have ${bookings.length} booking(s).` : "You haven't made any bookings yet."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Pickup</TableHead>
                  <TableHead>Drop-off</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : bookings.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Pickup</TableHead>
                  <TableHead>Drop-off</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div className="font-medium">{safeFormat(booking.pickupDate, "PP")}</div>
                      <div className="text-xs text-muted-foreground">{safeFormat(booking.pickupDate, "p")}</div>
                    </TableCell>
                    <TableCell>{booking.pickupLocation}</TableCell>
                    <TableCell>{booking.dropoffLocation}</TableCell>
                    <TableCell>{booking.vehicleType || "N/A"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          booking.status === "Confirmed" ? "default" :
                          booking.status === "Completed" ? "secondary" :
                          booking.status === "Pending" ? "outline" :
                          "destructive"
                        }
                         className={
                            booking.status === 'Confirmed' ? 'bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30' :
                            booking.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30 hover:bg-yellow-500/30' :
                            booking.status === 'Denied' || booking.status === 'Cancelled' ? 'bg-red-500/20 text-red-700 border-red-500/30 hover:bg-red-500/30' :
                            booking.status === 'Completed' ? 'bg-blue-500/20 text-blue-700 border-blue-500/30 hover:bg-blue-500/30' : ''
                        }
                      >
                        {booking.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10">
              <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No bookings found.</p>
              <p className="text-sm text-muted-foreground">Ready to plan your next trip?</p>
              <Button asChild className="mt-4"><Link href="/customer/dashboard/book-new">Book a Ride</Link></Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
