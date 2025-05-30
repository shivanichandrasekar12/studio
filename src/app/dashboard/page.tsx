import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { DashboardCardItem, Booking } from "@/types";
import { CalendarCheck, Users, Truck, DollarSign, PlusCircle, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

const summaryStats: DashboardCardItem[] = [
  { title: "Total Bookings", value: "1,234", icon: CalendarCheck, trend: "+12% from last month", actionLabel: "View Bookings", actionHref: "/dashboard/bookings" },
  { title: "Active Employees", value: "25", icon: Users, trend: "+2 new hires", actionLabel: "Manage Employees", actionHref: "/dashboard/employees" },
  { title: "Available Vehicles", value: "18", icon: Truck, trend: "3 in maintenance", actionLabel: "Manage Vehicles", actionHref: "/dashboard/vehicles" },
  { title: "Monthly Revenue", value: "$15,670", icon: DollarSign, trend: "+8.5% from last month" },
];

const mockRecentBookings: Booking[] = [
  { id: "1", customerName: "Alice Wonderland", pickupDate: new Date(Date.now() + 86400000), dropoffDate: new Date(Date.now() + 2*86400000), status: "Confirmed", vehicleType: "Sedan", customerEmail: "alice@example.com", customerPhone:"123-456-7890", pickupLocation:"City Center", dropoffLocation:"Airport"},
  { id: "2", customerName: "Bob The Builder", pickupDate: new Date(Date.now() + 2*86400000), dropoffDate: new Date(Date.now() + 3*86400000), status: "Pending", vehicleType: "SUV", customerEmail: "bob@example.com", customerPhone:"123-456-7890", pickupLocation:"Hotel ABC", dropoffLocation:"Conference Hall" },
  { id: "3", customerName: "Charlie Brown", pickupDate: new Date(Date.now() + 3*86400000), dropoffDate: new Date(Date.now() + 4*86400000), status: "Confirmed", vehicleType: "Van", customerEmail: "charlie@example.com", customerPhone:"123-456-7890", pickupLocation:"Residential Area", dropoffLocation:"Theme Park" },
];

export default function DashboardOverviewPage() {
  return (
    <>
      <PageHeader title="Dashboard Overview" description="Welcome back, Agency Admin!">
        <Button asChild>
          <Link href="/dashboard/bookings/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Booking
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {summaryStats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
            <CardDescription>A quick look at your next few scheduled trips.</CardDescription>
          </CardHeader>
          <CardContent>
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
                {mockRecentBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.customerName}</TableCell>
                    <TableCell>{booking.pickupDate.toLocaleDateString()}</TableCell>
                    <TableCell>{booking.vehicleType}</TableCell>
                    <TableCell>
                       <Badge variant={booking.status === 'Confirmed' ? 'default' : booking.status === 'Pending' ? 'secondary' : 'destructive'}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/bookings/${booking.id}`}>
                          View <ExternalLink className="ml-2 h-3 w-3" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Access common tasks quickly.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/employees/new"><Users className="mr-2 h-4 w-4" />Add New Employee</Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/vehicles/new"><Truck className="mr-2 h-4 w-4" />Add New Vehicle</Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/ai-vehicle-allocation"><Wand2 className="mr-2 h-4 w-4" />Get AI Suggestion</Link>
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
