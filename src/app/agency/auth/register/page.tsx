
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function AgencyRegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [agencyName, setAgencyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      // Note: agencyName is not directly used by createUserWithEmailAndPassword
      // It would typically be saved to a Firestore document linked to the user's UID
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("Agency Registered:", userCredential.user);
      toast({
        title: "Registration Successful",
        description: "Your agency account has been created. Redirecting to dashboard...",
      });
      // Potentially save agencyName to Firestore here associated with userCredential.user.uid
      router.push("/agency/dashboard");
    } catch (error: any) {
      console.error("Agency Registration failed:", error);
      let errorMessage = "An unknown error occurred. Please try again.";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered. Please try logging in.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "The email address is not valid.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "The password is too weak. Please choose a stronger password.";
      }
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Register Your Agency</CardTitle>
        <CardDescription>
          Create an account to start managing your travel agency with NomadX.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="agencyName">Agency Name</Label>
            <Input
              id="agencyName"
              type="text"
              placeholder="Your Travel Agency"
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@agency.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/agency/auth/login" className="font-semibold text-primary hover:underline">
              Login here
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
