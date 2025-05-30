import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, BarChart2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminDashboardPage() {
  return (
    <>
      <PageHeader title="Admin Dashboard Overview" description="Monitor and manage the NomadX platform." />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5 text-primary"/>Total Users</CardTitle>
            <CardDescription>Overview of registered customers and agencies.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">500 <span className="text-sm text-muted-foreground">Customers</span></p>
            <p className="text-2xl font-bold mt-1">50 <span className="text-sm text-muted-foreground">Agencies</span></p>
            <Button variant="link" asChild className="px-0 pt-2">
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
            <p className="text-2xl font-bold">2,500</p>
            <p className="text-sm text-muted-foreground">+150 this week</p>
             <Button variant="link" asChild className="px-0 pt-2">
                <Link href="/admin/dashboard/all-bookings">View All Bookings</Link>
            </Button>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><BarChart2 className="mr-2 h-5 w-5 text-primary"/>Platform Revenue</CardTitle>
            <CardDescription>Summary of financial activity.</CardDescription>
          </CardHeader>
          <CardContent>
             <p className="text-2xl font-bold">$50,000</p>
            <p className="text-sm text-muted-foreground">Month to date</p>
            {/* Placeholder for reports link */}
          </CardContent>
        </Card>
      </div>
      {/* Additional admin-specific components and data can be added here */}
    </>
  );
}
