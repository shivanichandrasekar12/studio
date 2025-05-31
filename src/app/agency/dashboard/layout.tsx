
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
  if (pathname === "/agency/dashboard") return "Agency Overview";
  if (pathname.startsWith("/agency/dashboard/employees")) return "Employee Management";
  if (pathname.startsWith("/agency/dashboard/vehicles")) return "Vehicle Management";
  if (pathname.startsWith("/agency/dashboard/bookings")) return "Booking Calendar";
  if (pathname.startsWith("/agency/dashboard/reviews")) return "Customer Reviews";
  if (pathname.startsWith("/agency/dashboard/ai-vehicle-allocation")) return "AI Vehicle Allocation";
  if (pathname.startsWith("/agency/dashboard/notifications")) return "Notifications";
  if (pathname.startsWith("/agency/dashboard/profile")) return "Agency Profile";
  if (pathname.startsWith("/agency/dashboard/settings")) return "Agency Settings";
  return "NomadX Agency Dashboard";
}

const queryClient = new QueryClient();

export default function AgencyDashboardLayout({
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
        router.push("/agency/auth/login");
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
        <AppSidebar userRole="agency" currentUser={currentUser} />
        <SidebarInset className="flex flex-col">
          <AppHeader title={pageTitle} userRole="agency" currentUser={currentUser}/>
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </QueryClientProvider>
  );
}
