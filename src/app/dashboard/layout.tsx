"use client"; // Required for SidebarProvider and its hooks

import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import React from "react";

// Helper function to get page title from pathname
function getPageTitle(pathname: string): string {
  if (pathname === "/dashboard") return "Overview";
  if (pathname.startsWith("/dashboard/employees")) return "Employee Management";
  if (pathname.startsWith("/dashboard/vehicles")) return "Vehicle Management";
  if (pathname.startsWith("/dashboard/bookings")) return "Booking Calendar";
  if (pathname.startsWith("/dashboard/ai-vehicle-allocation")) return "AI Vehicle Allocation";
  return "NomadX_Agency Dashboard";
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="flex flex-col">
        <AppHeader title={pageTitle} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
