
export type UserRole = 'customer' | 'agency' | 'admin';

export type Employee = {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  agencyId: string; 
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
  agencyId: string; 
};

export type Waypoint = {
  location: string;
  stopover: boolean;
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
  waypoints?: Waypoint[]; 
  estimatedDistance?: string;
  estimatedDuration?: string;
  vehicleId?: string;
  vehicleType?: string; 
  employeeId?: string; 
  status: "Pending" | "Confirmed" | "Denied" | "Completed" | "Cancelled";
  notes?: string;
  agencyId?: string; 
  customerId?: string; 
  passengers?: number;
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
  trend?: string; 
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
  userId?: string; 
  role?: UserRole; 
  type?: 'booking' | 'booking_update' | 'booking_completed' | 'system' | 'reminder' | 'promotion' | 'booking_denied' | string;
};

export type Review = {
  id: string;
  bookingId?: string; 
  reviewerId?: string; 
  customerName: string; 
  agencyId?: string; 
  rating: number; 
  title?: string;
  comment: string;
  createdAt: Date;
  avatarUrl?: string; 
  reviewType: 'customer_feedback' | 'driver_report' | 'agency_assessment' | 'user_submitted';
};

export interface UserProfileData {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
}
