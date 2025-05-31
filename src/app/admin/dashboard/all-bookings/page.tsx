
"use client";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, CheckCircle, XCircle, ListFilter, Loader2, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getBookings } from "@/lib/services/bookingsService";
import type { Booking } from "@/types";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button"; // Added for potential future actions

export default function AdminAllBookingsPage() {
  const { data: bookings = [], isLoading: isLoadingBookings, error: bookingsError } = useQuery<Booking[], Error>({
    queryKey: ["allPlatformBookings"],
    queryFn: getBookings,
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

  const today = new Date();
  const todayFormatted = format(today, "yyyy-MM-dd");

  const totalBookingsToday = isLoadingBookings ? "..." : bookings.filter(b => safeFormat(b.pickupDate, "yyyy-MM-dd") === todayFormatted).length;
  const confirmedBookingsCount = isLoadingBookings ? "..." : bookings.filter(b => b.status === "Confirmed").length;
  const cancelledBookingsCount = isLoadingBookings ? "..." : bookings.filter(b => b.status === "Cancelled" || b.status === "Denied").length;

  if (bookingsError) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Fetching Bookings</AlertTitle>
          <AlertDescription>{bookingsError.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Platform-Wide Bookings" description="View and manage all bookings across the platform.">
        {/* Placeholder for future filter button or actions */}
        {/* <Button variant="outline" disabled>
          <ListFilter className="mr-2 h-4 w-4" /> Filter Bookings
        </Button> */}
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center"><CalendarDays className="mr-2 h-5 w-5 text-primary"/>Bookings Today</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingBookings ? <Skeleton className="h-8 w-16" /> : <p className="text-2xl font-bold">{totalBookingsToday}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center"><CheckCircle className="mr-2 h-5 w-5 text-green-600"/>Confirmed Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingBookings ? <Skeleton className="h-8 w-16" /> : <p className="text-2xl font-bold">{confirmedBookingsCount}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center"><XCircle className="mr-2 h-5 w-5 text-red-600"/>Cancelled/Denied</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingBookings ? <Skeleton className="h-8 w-16" /> : <p className="text-2xl font-bold">{cancelledBookingsCount}</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><CalendarDays className="mr-2 h-5 w-5 text-primary"/>All Bookings Overview</CardTitle>
          <CardDescription>A comprehensive list of all bookings from all agencies and customers.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingBookings ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Pickup Date</TableHead>
                  <TableHead>Pickup Location</TableHead>
                  <TableHead>Dropoff Location</TableHead>
                  <TableHead>Vehicle Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : bookings.length === 0 ? (
             <div className="text-center py-10">
              <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No bookings found on the platform.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Pickup</TableHead>
                    <TableHead>Drop-off</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Agency ID</TableHead> 
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">
                        {booking.customerName}
                        <div className="text-xs text-muted-foreground">{booking.customerEmail}</div>
                      </TableCell>
                      <TableCell>
                        {safeFormat(booking.pickupDate, "PPp")}
                        <div className="text-xs text-muted-foreground">{booking.pickupLocation}</div>
                      </TableCell>
                      <TableCell>
                        {safeFormat(booking.dropoffDate, "PPp")}
                        <div className="text-xs text-muted-foreground">{booking.dropoffLocation}</div>
                      </TableCell>
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
                      <TableCell className="text-xs text-muted-foreground">{booking.agencyId || "N/A"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
