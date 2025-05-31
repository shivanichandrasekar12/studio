
"use client";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { auth } from "@/lib/firebase";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { Loader2 } from "lucide-react";

function getPageTitle(pathname: string): string {
  if (pathname === "/customer/dashboard") return "Customer Dashboard";
  if (pathname.startsWith("/customer/dashboard/my-bookings")) return "My Bookings";
  if (pathname.startsWith("/customer/dashboard/book-new")) return "Book New Ride";
  if (pathname.startsWith("/customer/dashboard/notifications")) return "My Notifications";
  if (pathname.startsWith("/customer/dashboard/my-reviews")) return "My Reviews";
  if (pathname.startsWith("/customer/dashboard/profile")) return "My Profile";
  if (pathname.startsWith("/customer/dashboard/settings")) return "Settings";
  return "NomadX Customer Portal";
}

const queryClient = new QueryClient();

export default function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const pageTitle = getPageTitle(pathname);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      if (!user) {
        router.push("/customer/auth/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!currentUser) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar userRole="customer" currentUser={currentUser} />
        <SidebarInset className="flex flex-col">
          <AppHeader title={pageTitle} userRole="customer" currentUser={currentUser}/>
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </QueryClientProvider>
  );
}
