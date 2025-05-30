"use client";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function getPageTitle(pathname: string): string {
  if (pathname === "/admin/dashboard") return "Admin Overview";
  if (pathname.startsWith("/admin/dashboard/users")) return "User Management";
  if (pathname.startsWith("/admin/dashboard/agencies")) return "Agency Management";
  if (pathname.startsWith("/admin/dashboard/all-bookings")) return "Platform Bookings";
  if (pathname.startsWith("/admin/dashboard/system-settings")) return "System Settings";
  if (pathname.startsWith("/admin/dashboard/profile")) return "Admin Profile";
  // Add other admin specific titles here
  return "NomadX Admin";
}

const queryClient = new QueryClient();

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar userRole="admin" />
        <SidebarInset className="flex flex-col">
          <AppHeader title={pageTitle} userRole="admin" />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </QueryClientProvider>
  );
}
