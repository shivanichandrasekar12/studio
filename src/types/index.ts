
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
  role?: UserRole; // For role-specific notifications
};

export type Review = {
  id: string;
  bookingId?: string;
  customerName: string; // Could be customerId in future
  agencyId?: string;
  reviewerRole?: UserRole; // Who wrote this review
  subjectRole?: UserRole; // Who/what is being reviewed (e.g. customer reviews agency, agency reviews customer)
  rating: number; // e.g., 1-5
  title?: string;
  comment: string;
  createdAt: Date;
  avatarUrl?: string;
  reviewType: 'customer' | 'driver_report' | 'agency_assessment'; // more specific agency review types
};
