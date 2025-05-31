
import { db } from "@/lib/firebase";
import type { Booking, Waypoint } from "@/types";
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
    // waypoints are already stored in the correct format (array of objects)
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
  let customerDetailsToAdd: Partial<Pick<Booking, "customerName" | "customerEmail" | "customerPhone">> = {};

  const effectiveCustomerId = bookingData.customerId || (currentUser?.uid && bookingData.agencyId !== currentUser.uid ? currentUser.uid : undefined);

  // If booking is by a customer, get their details from auth
  if (effectiveCustomerId && currentUser && currentUser.uid === effectiveCustomerId) {
    customerDetailsToAdd = {
      customerName: currentUser.displayName || "Customer",
      customerEmail: currentUser.email || "N/A",
      customerPhone: currentUser.phoneNumber || "N/A", 
    };
  } else if (bookingData.agencyId && currentUser && currentUser.uid === bookingData.agencyId) {
    // Agency is creating booking, customer details should come from bookingData if provided
     customerDetailsToAdd = {
      customerName: bookingData.customerName || "Walk-in Customer",
      customerEmail: bookingData.customerEmail || "N/A",
      customerPhone: bookingData.customerPhone || "N/A",
    };
  } else {
     customerDetailsToAdd = {
      customerName: "Walk-in Customer",
      customerEmail: "N/A",
      customerPhone: "N/A",
    };
  }
  
  const newBookingData: any = {
    ...bookingData, 
    ...customerDetailsToAdd,
    pickupDate: Timestamp.fromDate(new Date(bookingData.pickupDate)),
    dropoffDate: Timestamp.fromDate(new Date(bookingData.dropoffDate)),
    status: bookingData.status || "Pending",
    passengers: bookingData.passengers || 1,
    // waypoints, estimatedDistance, estimatedDuration will be part of bookingData
  };
  
  if (effectiveCustomerId) {
    newBookingData.customerId = effectiveCustomerId;
  }

  if (bookingData.agencyId) {
    newBookingData.agencyId = bookingData.agencyId;
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
  // waypoints, estimatedDistance, estimatedDuration are updated directly if present in bookingData
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

  // Send notification if booking is denied
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
