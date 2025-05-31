
"use client";

import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { DashboardCardItem, Booking, Vehicle, Employee } from "@/types";
import { CalendarCheck, Users, Truck, DollarSign, PlusCircle, ExternalLink, Wand2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { getBookings } from "@/lib/services/bookingsService";
import { getVehicles } from "@/lib/services/vehiclesService";
import { getEmployees } from "@/lib/services/employeesService";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { auth } from "@/lib/firebase";
import { useState, useEffect } from "react";


export default function AgencyDashboardOverviewPage() {
  const [currentUser, setCurrentUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const agencyId = currentUser?.uid;

  const { data: bookingsData, isLoading: isLoadingBookings, error: bookingsError } = useQuery<Booking[], Error>({
    queryKey: ["agencyBookingsDashboard", agencyId], // Scoped query key
    queryFn: () => {
      if (!agencyId) return Promise.resolve([]);
      return getBookings(agencyId); // Pass agencyId to fetch agency-specific bookings
    },
    enabled: !!agencyId,
  });

  const { data: vehicles = [], isLoading: isLoadingVehicles, error: vehiclesError } = useQuery<Vehicle[], Error>({
    queryKey: ["vehicles", agencyId],
    queryFn: () => {
      if (!agencyId) return Promise.resolve([]);
      return getVehicles(agencyId);
    },
    enabled: !!agencyId,
  });

  const { data: employees = [], isLoading: isLoadingEmployees, error: employeesError } = useQuery<Employee[], Error>({
    queryKey: ["employees", agencyId],
    queryFn: () => {
      if (!agencyId) return Promise.resolve([]);
      return getEmployees(agencyId);
    },
    enabled: !!agencyId,
  });

  const upcomingBookings = (bookingsData || [])
    .filter(b => {
        try {
            // Ensure pickupDate is valid and can be converted to Date
            const pickupDate = b.pickupDate instanceof Date ? b.pickupDate : new Date(b.pickupDate);
            if (isNaN(pickupDate.getTime())) return false;
            return pickupDate >= new Date() && (b.status === "Pending" || b.status === "Confirmed");
        } catch (e) {
            return false; 
        }
    })
    .sort((a, b) => {
        try {
            const dateA = a.pickupDate instanceof Date ? a.pickupDate : new Date(a.pickupDate);
            const dateB = b.pickupDate instanceof Date ? b.pickupDate : new Date(b.pickupDate);
            if (isNaN(dateA.getTime())) return 1; // Invalid dates sort last
            if (isNaN(dateB.getTime())) return -1;
            return dateA.getTime() - dateB.getTime();
        } catch (e) {
            return 0;
        }
    })
    .slice(0, 3);

  const summaryStats: DashboardCardItem[] = [
    { 
      title: "Total Bookings", 
      value: isLoadingBookings ? "..." : (bookingsData?.length ?? 0).toString(), 
      icon: CalendarCheck, 
      trend: isLoadingBookings ? "" : ((bookingsData || []).filter(b => b.status === "Pending").length > 0 ? `+${(bookingsData || []).filter(b => b.status === "Pending").length} pending` : "No pending"), 
      actionLabel: "View Bookings", 
      actionHref: "/agency/dashboard/bookings" 
    },
    { 
      title: "Active Employees", 
      value: isLoadingEmployees ? "..." : employees.length.toString(), 
      icon: Users, 
      actionLabel: "Manage Employees", 
      actionHref: "/agency/dashboard/employees" 
    },
    { 
      title: "Available Vehicles", 
      value: isLoadingVehicles ? "..." : vehicles.filter(v => v.status === 'Available').length.toString(), 
      icon: Truck, 
      trend: isLoadingVehicles ? "" : `${vehicles.filter(v => v.status !== 'Available').length} in use/maintenance`, 
      actionLabel: "Manage Vehicles", 
      actionHref: "/agency/dashboard/vehicles" 
    },
    { title: "Monthly Revenue", value: "$0", icon: DollarSign, trend: "Feature coming soon" }, // Placeholder
  ];
  
  const safeFormat = (dateInput: Date | string | undefined, formatString: string) => {
    if (!dateInput) return "N/A";
    try {
      const date = typeof dateInput === 'string' || !(dateInput instanceof Date) ? new Date(dateInput) : dateInput;
      if (isNaN(date.getTime())) return "Invalid Date";
      return format(date, formatString);
    } catch {
      return "Invalid Date";
    }
  };

  const pageError = bookingsError || vehiclesError || employeesError;

  return (
    <>
      <PageHeader title="Agency Dashboard Overview" description="Welcome back, Agency Admin!">
        <Button asChild>
          <Link href="/agency/dashboard/bookings">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Booking
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {summaryStats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {pageError && (
        <Alert variant="destructive" className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Fetching Dashboard Data</AlertTitle>
          <AlertDescription>{pageError.message || "Could not load some dashboard data. Please try again later."}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
            <CardDescription>A quick look at your next few scheduled trips.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingBookings ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-16 rounded-md" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : upcomingBookings.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.customerName}</TableCell>
                      <TableCell>{safeFormat(booking.pickupDate, "PP")}</TableCell>
                      <TableCell>{booking.vehicleType || "N/A"}</TableCell>
                      <TableCell>
                         <Badge 
                            variant={booking.status === 'Confirmed' ? 'default' : booking.status === 'Pending' ? 'secondary' : 'destructive'}
                            className={
                                booking.status === 'Confirmed' ? 'bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30' :
                                booking.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30 hover:bg-yellow-500/30' :
                                'bg-gray-500/20 text-gray-700 border-gray-500/30 hover:bg-gray-500/30' 
                            }
                          >
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/agency/dashboard/bookings#${booking.id}`}> 
                            View <ExternalLink className="ml-2 h-3 w-3" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground py-4 text-center">No upcoming bookings found.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Access common tasks quickly.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/agency/dashboard/employees"><Users className="mr-2 h-4 w-4" />Add New Employee</Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/agency/dashboard/vehicles"><Truck className="mr-2 h-4 w-4" />Add New Vehicle</Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/agency/dashboard/ai-vehicle-allocation"><Wand2 className="mr-2 h-4 w-4" />Get AI Suggestion</Link>
            </Button>
             <Image 
                src="https://placehold.co/600x300.png" 
                alt="Promotional image or chart"
                width={600}
                height={300}
                className="mt-4 rounded-lg object-cover"
                data-ai-hint="travel agency promotion"
              />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
    
