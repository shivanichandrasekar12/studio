"use client";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Booking } from "@/types";
import { ShoppingCart, CalendarDays } from "lucide-react"; // Removed MapPin as it's not directly used in this simplified version
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Mock data
const mockCustomerBookings: Booking[] = [
  { id: "CB001", customerName: "Current User", customerEmail: "customer@example.com", customerPhone: "555-1234", pickupDate: new Date(Date.now() - 86400000 * 2), dropoffDate: new Date(Date.now() - 86400000 * 1.8), pickupLocation: "123 Main St, Cityville", dropoffLocation: "City Airport", vehicleType: "Sedan", status: "Completed", notes: "Flight BA245" },
  { id: "CB002", customerName: "Current User", customerEmail: "customer@example.com", customerPhone: "555-1234", pickupDate: new Date(Date.now() + 86400000 * 3), dropoffDate: new Date(Date.now() + 86400000 * 3.2), pickupLocation: "Grand Hotel", dropoffLocation: "Conference Center", vehicleType: "SUV", status: "Confirmed", notes: "VIP Guest" },
  { id: "CB003", customerName: "Current User", customerEmail: "customer@example.com", customerPhone: "555-1234", pickupDate: new Date(Date.now() + 86400000 * 7), dropoffDate: new Date(Date.now() + 86400000 * 7.1), pickupLocation: "Downtown Station", dropoffLocation: "Seaside Resort", vehicleType: "Van", status: "Pending" },
];

export default function MyBookingsPage() {
  const bookings = mockCustomerBookings;

  return (
    <>
      <PageHeader
        title="My Bookings"
        description="View your past, current, and upcoming ride bookings."
      />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><ShoppingCart className="mr-2 h-5 w-5 text-primary" />Booking History</CardTitle>
          <CardDescription>
            {bookings.length > 0 ? `You have ${bookings.length} booking(s).` : "You haven't made any bookings yet."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.length > 0 ? (
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
                      <div className="font-medium">{format(new Date(booking.pickupDate), "PP")}</div>
                      <div className="text-xs text-muted-foreground">{format(new Date(booking.pickupDate), "p")}</div>
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
