import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, ShoppingCart, Bell } from "lucide-react";
import Link from "next/link";

export default function CustomerDashboardPage() {
  return (
    <>
      <PageHeader title="Welcome to your Dashboard!" description="Manage your bookings and view your travel history.">
        <Button asChild>
          <Link href="/customer/dashboard/book-new">
            <PlusCircle className="mr-2 h-4 w-4" /> Book New Ride
          </Link>
        </Button>
      </PageHeader>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><ShoppingCart className="mr-2 h-5 w-5 text-primary"/>My Upcoming Bookings</CardTitle>
            <CardDescription>View and manage your scheduled rides.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">You have no upcoming bookings.</p>
            {/* Placeholder for upcoming bookings list */}
            <Button variant="link" asChild className="px-0 pt-2">
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
            <p className="text-muted-foreground">No new notifications.</p>
             {/* Placeholder for recent notifications list */}
            <Button variant="link" asChild className="px-0 pt-2">
                <Link href="/customer/dashboard/notifications">View All Notifications</Link>
            </Button>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/customer/dashboard/profile"><UserCircle className="mr-2 h-4 w-4" />My Profile</Link>
            </Button>
             <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/customer/dashboard/reviews"><MessageSquareText className="mr-2 h-4 w-4" />My Reviews</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// Added imports
import { UserCircle, MessageSquareText } from "lucide-react";
