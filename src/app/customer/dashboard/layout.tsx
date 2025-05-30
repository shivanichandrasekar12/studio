"use client";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
  const pageTitle = getPageTitle(pathname);

  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar userRole="customer" />
        <SidebarInset className="flex flex-col">
          <AppHeader title={pageTitle} userRole="customer" />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </QueryClientProvider>
  );
}
