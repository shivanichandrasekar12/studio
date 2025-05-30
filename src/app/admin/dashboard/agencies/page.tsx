
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Building } from "lucide-react";

export default function AdminAgenciesPage() {
  return (
    <>
      <PageHeader title="Agency Management" description="Manage and monitor all travel agencies on the platform.">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Register New Agency
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Building className="mr-2 h-5 w-5 text-primary"/>Registered Agencies</CardTitle>
          <CardDescription>A list of all travel agencies using NomadX.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder for agency table */}
          <p className="text-muted-foreground">Agency table and management tools will be displayed here.</p>
           <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader><CardTitle>Total Agencies</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold">50</p></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Active Agencies</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold">45</p></CardContent>
            </Card>
             <Card>
              <CardHeader><CardTitle>Agencies Pending Review</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold">2</p></CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
