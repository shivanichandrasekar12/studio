
"use client";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, BarChart2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getBookings } from "@/lib/services/bookingsService"; // Assuming this gets ALL bookings
import type { Booking } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AdminDashboardPage() {
  const { data: bookings, isLoading: isLoadingBookings, error: bookingsError } = useQuery<Booking[], Error>({
    queryKey: ["allBookingsAdminDashboard"],
    queryFn: getBookings, // This should fetch all bookings across the platform
  });

  // Note: Total Users, Total Agencies, and Platform Revenue are complex to aggregate client-side
  // in Firestore efficiently and securely for large datasets.
  // These would typically be handled by backend functions or aggregated counters.
  // For this example, 'Total Users' and 'Platform Revenue' will remain as mock/static values.
  // 'Total Bookings' is made dynamic.

  const totalBookingsCount = isLoadingBookings ? "..." : bookings?.length ?? 0;
  const bookingsThisWeek = isLoadingBookings ? "..." : bookings?.filter(b => {
      const bookingDate = new Date(b.pickupDate);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return bookingDate >= oneWeekAgo;
  }).length ?? 0;


  return (
    <>
      <PageHeader title="Admin Dashboard Overview" description="Monitor and manage the NomadX platform." />
      
      {bookingsError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Bookings Data</AlertTitle>
          <AlertDescription>{bookingsError.message}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5 text-primary"/>Total Users</CardTitle>
            <CardDescription>Overview of registered customers and agencies. (Static data)</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">500 <span className="text-sm text-muted-foreground">Customers</span></p>
            <p className="text-2xl font-bold mt-1">50 <span className="text-sm text-muted-foreground">Agencies</span></p>
            <Button variant="link" asChild className="px-0 pt-2 h-auto text-sm">
                <Link href="/admin/dashboard/users">Manage Users</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><Briefcase className="mr-2 h-5 w-5 text-primary"/>Total Bookings</CardTitle>
            <CardDescription>Platform-wide booking activity.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingBookings ? (
              <>
                <Skeleton className="h-8 w-20 mb-1" />
                <Skeleton className="h-4 w-32" />
              </>
            ) : (
              <>
                <p className="text-2xl font-bold">{totalBookingsCount}</p>
                <p className="text-sm text-muted-foreground">+{bookingsThisWeek} this week</p>
              </>
            )}
             <Button variant="link" asChild className="px-0 pt-2 h-auto text-sm">
                <Link href="/admin/dashboard/all-bookings">View All Bookings</Link>
            </Button>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><BarChart2 className="mr-2 h-5 w-5 text-primary"/>Platform Revenue</CardTitle>
            <CardDescription>Summary of financial activity. (Static data)</CardDescription>
          </CardHeader>
          <CardContent>
             <p className="text-2xl font-bold">$50,000</p>
            <p className="text-sm text-muted-foreground">Month to date</p>
            {/* Placeholder for reports link - Link to a future reports page if needed */}
             <Button variant="link" disabled asChild className="px-0 pt-2 h-auto text-sm text-muted-foreground cursor-not-allowed">
                {/* <Link href="#">View Financial Reports</Link> */}
                <span>View Financial Reports (Soon)</span>
            </Button>
          </CardContent>
        </Card>
      </div>
      {/* Additional admin-specific components and data can be added here */}
    </>
  );
}
