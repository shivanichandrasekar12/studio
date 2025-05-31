
"use client";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, User, Users, Briefcase, AlertCircle, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAllUserProfiles, type UserProfileData } from "@/lib/services/usersService";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AdminUsersPage() {
  const { data: users = [], isLoading: isLoadingUsers, error: usersError } = useQuery<UserProfileData[], Error>({
    queryKey: ["allUserProfiles"],
    queryFn: getAllUserProfiles,
  });

  const totalCustomers = isLoadingUsers ? "..." : users.filter(u => u.role === 'customer').length;
  const totalAgencyStaff = isLoadingUsers ? "..." : users.filter(u => u.role === 'agency').length;
  // "Pending Approvals" remains static as this status is not in UserProfileData
  const pendingApprovals = 5; 

  if (usersError) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Fetching Users</AlertTitle>
          <AlertDescription>{usersError.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="User Management" description="Oversee and manage all platform users (customers and agency personnel).">
        <Button disabled> {/* Add User (Manual) functionality not yet implemented */}
          <PlusCircle className="mr-2 h-4 w-4" /> Add User (Manual)
        </Button>
      </PageHeader>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center"><Users className="mr-2 h-5 w-5 text-primary"/>Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingUsers ? <Skeleton className="h-8 w-16"/> : <p className="text-2xl font-bold">{totalCustomers}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center"><Briefcase className="mr-2 h-5 w-5 text-primary"/>Total Agency Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingUsers ? <Skeleton className="h-8 w-16"/> : <p className="text-2xl font-bold">{totalAgencyStaff}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center"><User className="mr-2 h-5 w-5 text-primary"/>Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{pendingApprovals} <span className="text-xs text-muted-foreground">(Static)</span></p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>A comprehensive list of all registered users.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingUsers ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Display Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>UID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : users.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center">No users found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Display Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>UID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell className="font-medium">{user.displayName || "N/A"}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'agency' ? 'secondary' : 'outline'}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{user.uid}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
