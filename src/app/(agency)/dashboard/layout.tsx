
"use client"; // Required for SidebarProvider and its hooks

import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Helper function to get page title from pathname
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

// Create a client
const queryClient = new QueryClient();

export default function AgencyDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar userRole="agency" />
        <SidebarInset className="flex flex-col">
          <AppHeader title={pageTitle} userRole="agency"/>
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </QueryClientProvider>
  );
}
