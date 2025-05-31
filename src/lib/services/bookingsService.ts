
import { db } from "@/lib/firebase";
import type { Booking } from "@/types";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
  query,
  orderBy,
  where,
  getDoc, 
} from "firebase/firestore";
import { auth } from "@/lib/firebase"; 
import { addCustomerNotification } from "./notificationsService"; 

const BOOKINGS_COLLECTION = "bookings";

// Helper to convert Firestore Timestamps to JS Dates in booking objects
const fromFirestore = (docSnapshot: any): Booking => {
  const data = docSnapshot.data();
  return {
    ...data,
    id: docSnapshot.id,
    pickupDate: (data.pickupDate as Timestamp)?.toDate(),
    dropoffDate: (data.dropoffDate as Timestamp)?.toDate(),
  } as Booking;
};

// Get bookings. If agencyId is provided, filter for that agency.
// Otherwise (e.g., for admin), get all bookings.
export const getBookings = async (agencyId?: string): Promise<Booking[]> => {
  let q;
  if (agencyId) {
    console.log(`bookingsService: Fetching bookings for agencyId: ${agencyId}`);
    q = query(
      collection(db, BOOKINGS_COLLECTION), 
      where("agencyId", "==", agencyId), 
      orderBy("pickupDate", "desc")
    );
  } else {
    console.log("bookingsService: Fetching all bookings (no agencyId provided).");
    q = query(collection(db, BOOKINGS_COLLECTION), orderBy("pickupDate", "desc"));
  }
  try {
    const snapshot = await getDocs(q);
    console.log(`bookingsService: Found ${snapshot.docs.length} bookings for query.`);
    return snapshot.docs.map(doc => fromFirestore(doc));
  } catch (error) {
    console.error("bookingsService: Error fetching bookings:", error);
    throw error; // Re-throw to be caught by useQuery
  }
};

// Get bookings for a specific customer
export const getCustomerBookings = async (customerId: string): Promise<Booking[]> => {
  if (!customerId) {
    console.warn("getCustomerBookings called without customerId");
    return [];
  }
  const q = query(
    collection(db, BOOKINGS_COLLECTION),
    where("customerId", "==", customerId),
    orderBy("pickupDate", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => fromFirestore(doc));
};

// Add a new booking
export const addBooking = async (
  bookingData: Omit<Booking, "id" | "customerName" | "customerEmail" | "customerPhone"> & { customerId?: string; agencyId?: string }
): Promise<string> => {
  const currentUser = auth.currentUser;
  let customerDetailsToAdd = {};

  // If bookingData includes customerId, it implies it's for a specific customer
  // If not, and a customer is logged in, it's their booking.
  // If an agency is logged in and no customerId, it's an agency-managed booking (potentially anonymous customer).
  const effectiveCustomerId = bookingData.customerId || (currentUser?.uid && bookingData.agencyId !== currentUser.uid ? currentUser.uid : undefined);

  if (effectiveCustomerId) {
    // Attempt to fetch customer details if UID is known
    // This part can be expanded if you have a users collection with displayNames etc.
    // For now, we'll use placeholder or rely on form input for name/email/phone.
  }
  
  // Prioritize details from bookingData (e.g. entered by agency in form)
  customerDetailsToAdd = {
    customerName: bookingData.customerName || (effectiveCustomerId ? "Registered Customer" : "Walk-in Customer"),
    customerEmail: bookingData.customerEmail || (effectiveCustomerId ? "customer@example.com" : "N/A"),
    customerPhone: bookingData.customerPhone || (effectiveCustomerId ? "N/A" : "N/A"),
  };


  const newBookingData: any = {
    ...bookingData, // includes pickupLocation, dropoffLocation, vehicleType, notes, status etc.
    ...customerDetailsToAdd,
    pickupDate: Timestamp.fromDate(new Date(bookingData.pickupDate)),
    dropoffDate: Timestamp.fromDate(new Date(bookingData.dropoffDate)),
    status: bookingData.status || "Pending",
  };
  
  if (effectiveCustomerId) {
    newBookingData.customerId = effectiveCustomerId;
  }

  // If an agencyId is explicitly passed (e.g., agency creating booking), use it.
  // Or if the current user is an agency (and not creating for a *different* agency), set them as agencyId.
  if (bookingData.agencyId) {
    newBookingData.agencyId = bookingData.agencyId;
  } else if (currentUser) {
    // Potentially check user role here if agencies can also be customers.
    // For simplicity, if not bookingData.agencyId, and currentUser exists, assume it might be an agency.
    // This logic should be tightened based on user roles.
    // If an agency user is creating the booking, their UID should be the agencyId.
    // The UI (AgencyBookingsPage) already adds agencyId from currentUser.uid.
  }


  const docRef = await addDoc(collection(db, BOOKINGS_COLLECTION), newBookingData);
  return docRef.id;
};


// Update an existing booking
export const updateBooking = async (bookingId: string, bookingData: Partial<Omit<Booking, "id">>): Promise<void> => {
  const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
  const updateData: any = { ...bookingData };
  if (bookingData.pickupDate && bookingData.pickupDate instanceof Date) {
    updateData.pickupDate = Timestamp.fromDate(bookingData.pickupDate);
  } else if (bookingData.pickupDate) { 
     updateData.pickupDate = Timestamp.fromDate(new Date(bookingData.pickupDate));
  }

  if (bookingData.dropoffDate && bookingData.dropoffDate instanceof Date) {
    updateData.dropoffDate = Timestamp.fromDate(bookingData.dropoffDate);
  } else if (bookingData.dropoffDate) {
     updateData.dropoffDate = Timestamp.fromDate(new Date(bookingData.dropoffDate));
  }
  await updateDoc(bookingRef, updateData);
};

// Delete a booking
export const deleteBooking = async (bookingId: string): Promise<void> => {
  const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
  await deleteDoc(bookingRef);
};

// Update booking status
export const updateBookingStatus = async (bookingId: string, status: Booking["status"]): Promise<void> => {
  const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
  await updateDoc(bookingRef, { status });

  if (status === "Denied") {
    try {
      const bookingSnap = await getDoc(bookingRef);
      if (bookingSnap.exists()) {
        const bookingData = fromFirestore(bookingSnap); 
        
        if (bookingData.customerId) {
          const pickupDateFormatted = bookingData.pickupDate 
            ? new Date(bookingData.pickupDate).toLocaleDateString() 
            : "the requested date";
          
          await addCustomerNotification(bookingData.customerId, {
            title: "Booking Request Update",
            description: `Unfortunately, your booking for ${bookingData.pickupLocation || 'your selected destination'} on ${pickupDateFormatted} could not be fulfilled as requested. Please try rescheduling or contact support.`,
            type: "booking_denied", 
            link: "/customer/dashboard/my-bookings" 
          });
          console.log(`Customer notification sent for denied booking ${bookingId}`);
        } else {
          console.warn(`Booking ${bookingId} denied, but no customerId found to send notification.`);
        }
      }
    } catch (error) {
      console.error("Error sending notification for denied booking:", error);
    }
  }
};

