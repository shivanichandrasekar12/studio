
"use client";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, BarChart2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getBookings } from "@/lib/services/bookingsService"; 
import { getAllUserProfiles, type UserProfileData } from "@/lib/services/usersService";
import type { Booking } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useMemo } from "react";

export default function AdminDashboardPage() {
  const { data: bookings, isLoading: isLoadingBookings, error: bookingsError } = useQuery<Booking[], Error>({
    queryKey: ["allBookingsAdminDashboard"],
    queryFn: getBookings, 
  });

  const { data: users = [], isLoading: isLoadingUsers, error: usersError } = useQuery<UserProfileData[], Error>({
    queryKey: ["allUserProfilesAdminDashboard"],
    queryFn: getAllUserProfiles,
  });

  const totalCustomersCount = useMemo(() => {
    if (isLoadingUsers) return "...";
    return users.filter(u => u.role === 'customer').length;
  }, [users, isLoadingUsers]);

  const totalAgenciesCount = useMemo(() => {
    if (isLoadingUsers) return "...";
    return users.filter(u => u.role === 'agency').length;
  }, [users, isLoadingUsers]);

  const totalBookingsCount = isLoadingBookings ? "..." : bookings?.length ?? 0;
  const bookingsThisWeek = isLoadingBookings ? "..." : bookings?.filter(b => {
      if (!b.pickupDate) return false;
      try {
        const bookingDate = new Date(b.pickupDate);
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return bookingDate >= oneWeekAgo;
      } catch (e) {
        return false;
      }
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
      {usersError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading User Data</AlertTitle>
          <AlertDescription>{usersError.message}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5 text-primary"/>Total Users</CardTitle>
            <CardDescription>Overview of registered customers and agencies.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingUsers ? (
              <>
                <Skeleton className="h-8 w-20 mb-1" />
                <Skeleton className="h-4 w-28 mb-3" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </>
            ) : (
              <>
                <p className="text-2xl font-bold">{totalCustomersCount} <span className="text-sm text-muted-foreground">Customers</span></p>
                <p className="text-2xl font-bold mt-1">{totalAgenciesCount} <span className="text-sm text-muted-foreground">Agencies</span></p>
              </>
            )}
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
