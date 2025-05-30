
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function AdminUsersPage() {
  return (
    <>
      <PageHeader title="User Management" description="Oversee and manage all platform users (customers and agency personnel).">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add User (Manual)
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>A comprehensive list of all registered users.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder for user table */}
          <p className="text-muted-foreground">User table and management tools will be displayed here.</p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader><CardTitle>Total Customers</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold">500</p></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Total Agency Staff</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold">150</p></CardContent>
            </Card>
             <Card>
              <CardHeader><CardTitle>Pending Approvals</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold">5</p></CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
