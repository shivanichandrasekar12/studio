
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
  if (pathname === "/admin/dashboard") return "Admin Overview";
  if (pathname.startsWith("/admin/dashboard/users")) return "User Management";
  if (pathname.startsWith("/admin/dashboard/agencies")) return "Agency Management";
  if (pathname.startsWith("/admin/dashboard/all-bookings")) return "Platform Bookings";
  if (pathname.startsWith("/admin/dashboard/system-settings")) return "System Settings";
  if (pathname.startsWith("/admin/dashboard/profile")) return "Admin Profile";
  return "NomadX Admin";
}

const queryClient = new QueryClient();

export default function AdminDashboardLayout({
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
        router.push("/admin/auth/login");
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
    // This case should ideally be handled by the redirect in onAuthStateChanged,
    // but as a fallback, prevent rendering the dashboard for unauthenticated users.
    return null; 
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar userRole="admin" currentUser={currentUser} />
        <SidebarInset className="flex flex-col">
          <AppHeader title={pageTitle} userRole="admin" currentUser={currentUser} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </QueryClientProvider>
  );
}
