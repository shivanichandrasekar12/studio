
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminSystemSettingsPage() {
  return (
    <>
      <PageHeader title="System Settings" description="Configure global settings for the NomadX platform." />
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Platform-wide configurations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between space-x-2 p-3 border rounded-md">
              <Label htmlFor="maintenanceMode" className="flex flex-col space-y-1">
                <span>Maintenance Mode</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Temporarily disable platform access for maintenance.
                </span>
              </Label>
              <Switch id="maintenanceMode" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="platformFee">Platform Commission Rate (%)</Label>
                <Input id="platformFee" type="number" defaultValue="5" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input id="supportEmail" type="email" defaultValue="support@nomadx.com" />
            </div>
             <div className="flex justify-end pt-4">
                <Button>Save General Settings</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>API Keys & Integrations</CardTitle>
            <CardDescription>Manage third-party service integrations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="mapsApiKey">Google Maps API Key</Label>
                <Input id="mapsApiKey" type="password" placeholder="Enter Google Maps API Key" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="paymentGatewayKey">Payment Gateway API Key</Label>
                <Input id="paymentGatewayKey" type="password" placeholder="Enter Payment Gateway Key" />
            </div>
             <div className="flex justify-end pt-4">
                <Button>Save Integration Settings</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
