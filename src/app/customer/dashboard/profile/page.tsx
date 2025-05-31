"use client";

import { PageHeader } from "@/components/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function CustomerProfilePage() {
  const { toast } = useToast();
  const [fullName, setFullName] = useState("Customer User");
  const [email, setEmail] = useState("customer@example.com");
  const [phone, setPhone] = useState("555-0199");
  // Password fields are usually separate for security, here for UI demonstration
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");


  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // In a real app, you'd handle form submission, API calls, etc.
    // For now, just show a toast.
    if (newPassword && newPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirm password do not match.",
        variant: "destructive",
      });
      return;
    }
    console.log("Profile update attempt:", { fullName, email, phone });
    toast({
      title: "Profile Updated (Mock)",
      description: "Your profile information has been 'updated'.",
    });
  };

  return (
    <>
      <PageHeader
        title="My Profile"
        description="View and update your personal information."
      />
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Account Information</CardTitle>
          <CardDescription className="text-center">Manage your personal details and password.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src="https://placehold.co/100x100.png?text=CU" alt="Customer Avatar" data-ai-hint="user avatar" />
                <AvatarFallback>CU</AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" type="button" onClick={() => toast({ title: "Feature Not Implemented", description: "Avatar upload will be available soon."})}>
                Change Picture
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-medium mb-4">Change Password</h3>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input id="currentPassword" type="password" placeholder="Enter current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input id="newPassword" type="password" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input id="confirmPassword" type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
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
