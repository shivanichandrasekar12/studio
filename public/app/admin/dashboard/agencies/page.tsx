
"use client";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Building, Users, Briefcase, AlertCircle, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAllUserProfiles, type UserProfileData } from "@/lib/services/usersService";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMemo } from "react";

export default function AdminAgenciesPage() {
  const { data: users = [], isLoading: isLoadingUsers, error: usersError } = useQuery<UserProfileData[], Error>({
    queryKey: ["allUserProfilesForAgencies"], // Use a distinct key if needed, or share "allUserProfiles"
    queryFn: getAllUserProfiles,
  });

  const agencies = useMemo(() => users.filter(u => u.role === 'agency'), [users]);

  const totalAgencies = isLoadingUsers ? "..." : agencies.length;
  // "Active Agencies" and "Pending Review" remain static as these statuses are not in UserProfileData
  const activeAgencies = isLoadingUsers ? "..." : agencies.length; // Simplification: all fetched are "active"
  const agenciesPendingReview = 2; 

  if (usersError) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Fetching Agency Data</AlertTitle>
          <AlertDescription>{usersError.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Agency Management" description="Manage and monitor all travel agencies on the platform.">
        <Button disabled> {/* Register New Agency functionality not yet implemented for admin */}
          <PlusCircle className="mr-2 h-4 w-4" /> Register New Agency
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center"><Briefcase className="mr-2 h-5 w-5 text-primary"/>Total Agencies</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingUsers ? <Skeleton className="h-8 w-16"/> : <p className="text-2xl font-bold">{totalAgencies}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center"><Users className="mr-2 h-5 w-5 text-primary"/>Active Agencies</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingUsers ? <Skeleton className="h-8 w-16"/> : <p className="text-2xl font-bold">{activeAgencies} <span className="text-xs text-muted-foreground">(All listed)</span></p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center"><Building className="mr-2 h-5 w-5 text-primary"/>Agencies Pending Review</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{agenciesPendingReview} <span className="text-xs text-muted-foreground">(Static)</span></p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Building className="mr-2 h-5 w-5 text-primary"/>Registered Agencies</CardTitle>
          <CardDescription>A list of all travel agencies (users with role 'agency') using NomadX.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingUsers ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agency Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>UID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : agencies.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center">No agencies found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agency Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>UID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agencies.map((agency) => (
                  <TableRow key={agency.uid}>
                    <TableCell className="font-medium">{agency.displayName || "N/A"}</TableCell>
                    <TableCell>{agency.email}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{agency.uid}</TableCell>
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
