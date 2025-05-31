"use client"; // Good practice for pages that might have interactions

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function CustomerSettingsPage() {
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);

  const handleSaveChanges = () => {
    console.log("Settings saved (mock):", { emailNotifications, smsNotifications, pushNotifications });
    toast({
      title: "Settings Saved (Mock)",
      description: "Your notification preferences have been 'updated'.",
    });
  };

  return (
    <>
      <PageHeader
        title="Account Settings"
        description="Manage your application preferences and notification settings."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Choose how you receive updates from NomadX.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between space-x-2 p-3 border rounded-md">
              <Label htmlFor="emailNotifications" className="flex flex-col space-y-1">
                <span>Email Notifications</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Receive booking confirmations and updates via email.
                </span>
              </Label>
              <Switch
                id="emailNotifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            <div className="flex items-center justify-between space-x-2 p-3 border rounded-md">
              <Label htmlFor="smsNotifications" className="flex flex-col space-y-1">
                <span>SMS Notifications</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Get critical alerts and driver updates via text message.
                </span>
              </Label>
              <Switch
                id="smsNotifications"
                checked={smsNotifications}
                onCheckedChange={setSmsNotifications}
              />
            </div>
            <div className="flex items-center justify-between space-x-2 p-3 border rounded-md">
              <Label htmlFor="pushNotifications" className="flex flex-col space-y-1">
                <span>Push Notifications</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Enable in-app push notifications for real-time updates.
                </span>
              </Label>
              <Switch
                id="pushNotifications"
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
              />
            </div>
             <div className="flex justify-end pt-4">
                <Button onClick={handleSaveChanges}>Save Preferences</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Management</CardTitle>
             <CardDescription>Other account-related actions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full" onClick={() => toast({title: "Feature not implemented"})}>
              Export My Data
            </Button>
            <Button variant="destructive" className="w-full" onClick={() => toast({title: "Feature not implemented", description: "Account deletion needs confirmation."})}>
              Delete My Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
