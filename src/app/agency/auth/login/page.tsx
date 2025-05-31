
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
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { getUserRole } from "@/lib/services/usersService";
import type { UserRole } from "@/types";

export default function AgencyLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const expectedRole: UserRole = "agency";

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userRole = await getUserRole(user.uid);

      if (userRole === expectedRole) {
        toast({
          title: "Login Successful",
          description: "Redirecting to agency dashboard...",
        });
        router.push("/agency/dashboard");
      } else {
        await signOut(auth);
        toast({
          title: "Access Denied",
          description: `Your account is not configured as an ${expectedRole}.`,
          variant: "destructive",
        });
         if (userRole) {
           console.info(`Agency login attempt failed: User ${user.email} has role '${userRole}', expected '${expectedRole}'.`);
        } else {
           console.info(`Agency login attempt failed: User ${user.email} has no role defined in Firestore.`);
        }
      }
    } catch (error: any) {
      let errorMessage = "An unknown error occurred. Please try again.";
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password. Please try again.";
        console.info(`Agency login attempt failed (handled): ${error.code}`);
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "The email address is not valid.";
        console.info(`Agency login attempt failed (handled): ${error.code}`);
      } else {
        console.error("Agency Login failed with unexpected error:", error);
      }
      toast({
        title: "Login Failed",
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
        <CardTitle className="text-2xl">Agency Login</CardTitle>
        <CardDescription>
          Enter your email and password to access your agency dashboard.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
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
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Login"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an agency account?{" "}
            <Link href="/agency/auth/register" className="font-semibold text-primary hover:underline">
              Register here
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
