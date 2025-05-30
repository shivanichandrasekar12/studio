
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

export default function AdminAllBookingsPage() {
  return (
    <>
      <PageHeader title="Platform-Wide Bookings" description="View and manage all bookings across the platform." />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><CalendarDays className="mr-2 h-5 w-5 text-primary"/>All Bookings Overview</CardTitle>
          <CardDescription>A comprehensive list of all bookings from all agencies and customers.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder for bookings table or advanced filtering */}
          <p className="text-muted-foreground">A sortable and filterable table of all platform bookings will be displayed here.</p>
           <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader><CardTitle>Total Bookings Today</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold">120</p></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Confirmed Bookings</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold">2,300</p></CardContent>
            </Card>
             <Card>
              <CardHeader><CardTitle>Cancelled Bookings</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold">50</p></CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
