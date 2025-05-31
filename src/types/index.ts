
export type UserRole = 'customer' | 'agency' | 'admin';

export type Employee = {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  avatarUrl?: string;
};

export type Vehicle = {
  id: string;
  type: string;
  make: string;
  model: string;
  registrationNumber: string;
  capacity: number;
  status: "Available" | "In Use" | "Maintenance";
  imageUrl?: string;
};

export type Booking = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupDate: Date;
  dropoffDate: Date;
  pickupLocation: string;
  dropoffLocation: string;
  vehicleId?: string;
  vehicleType?: string; // Fallback if specific vehicle not yet assigned
  employeeId?: string; // Driver
  status: "Pending" | "Confirmed" | "Denied" | "Completed" | "Cancelled";
  notes?: string;
  agencyId?: string; // To associate booking with an agency
  customerId?: string; // To associate booking with a customer
};

export type NavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
  disabled?: boolean;
  external?: boolean;
  label?: string;
  description?: string;
};

export type DashboardCardItem = {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string; // e.g., "+5% from last month"
  actionLabel?: string;
  actionHref?: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  link?: string;
  userId?: string; // For user-specific notifications
  role?: UserRole; // For role-specific notifications for agency/admin or to tag customer notifs
  type?: 'booking' | 'booking_update' | 'booking_completed' | 'system' | 'reminder' | 'promotion' | 'booking_denied' | string;
};

export type Review = {
  id: string;
  bookingId?: string; // Optional: Link to a specific booking
  reviewerId?: string; // UID of the user who wrote/submitted the review (customer or agency staff)
  customerName: string; // Name of the customer the review is about or who wrote it
  agencyId?: string; // Optional: UID of the agency (if a multi-tenant platform or for filtering)
  rating: number; // e.g., 1-5
  title?: string;
  comment: string;
  createdAt: Date;
  avatarUrl?: string; // Avatar of the customer (if agency logs it) or reviewer
  reviewType: 'customer_feedback' | 'driver_report' | 'agency_assessment' | 'user_submitted';
};

// This type is already in usersService.ts, but good to have in main types if used elsewhere.
// Redefining or importing might be needed based on project structure.
export interface UserProfileData {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
}
