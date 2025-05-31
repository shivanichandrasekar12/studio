
"use client"; // For potential future form interactions

import { PageHeader } from "@/components/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function AdminProfilePage() {
  const { toast } = useToast();
  const [adminName, setAdminName] = useState("Platform Administrator");
  const [adminEmail, setAdminEmail] = useState("admin@nomadx.com");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    toast({
      title: "Profile Update (Mock)",
      description: "Admin profile information 'updated'. In a real app, this would save to a database.",
    });
  };

  return (
    <>
      <PageHeader
        title="Administrator Profile"
        description="Manage your administrator account details."
      />
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Admin Account</CardTitle>
          <CardDescription className="text-center">Update your profile and password.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src="https://placehold.co/100x100.png?text=AD" alt="Admin Avatar" data-ai-hint="admin avatar" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" type="button" onClick={() => toast({ title: "Feature Not Implemented"})}>
                Change Picture
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="adminName">Full Name</Label>
                <Input id="adminName" value={adminName} onChange={(e) => setAdminName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Email Address</Label>
                <Input id="adminEmail" type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
              </div>
            </div>

            <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-medium mb-4">Change Password</h3>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input id="currentPassword" type="password" placeholder="Enter current password" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input id="newPassword" type="password" placeholder="Enter new password" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input id="confirmPassword" type="password" placeholder="Confirm new password" />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-6">
              <Button type="submit">Save Changes</Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </>
  );
}
