
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
    // This assumes that bookings relevant to an agency have an 'agencyId' field 
    // storing that agency's UID. If your data model is different, adjust this query.
    q = query(
      collection(db, BOOKINGS_COLLECTION), 
      where("agencyId", "==", agencyId), 
      orderBy("pickupDate", "desc")
    );
  } else {
    // For admin or general fetches without agency scoping
    q = query(collection(db, BOOKINGS_COLLECTION), orderBy("pickupDate", "desc"));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => fromFirestore(doc));
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
export const addBooking = async (bookingData: Omit<Booking, "id" | "customerName" | "customerEmail" | "customerPhone"> & { customerId: string; agencyId?: string }): Promise<string> => {
  const currentUser = auth.currentUser;
  let customerDetails = {};

  if (currentUser && currentUser.uid === bookingData.customerId) { // Ensure booking is for the current user or being made by an authorized party
    customerDetails = {
      customerName: currentUser.displayName || currentUser.email?.split('@')[0] || "Customer",
      customerEmail: currentUser.email || "Not available",
      customerPhone: currentUser.phoneNumber || "Not available",
    };
  } else if (!currentUser && bookingData.customerId) { // Case for agency creating for known customerId but not logged in as customer
     // Potentially fetch customer details if agency is creating booking for a customer
     // For now, we'll rely on agency to input these or have them as part of bookingData.
     // This part needs careful consideration based on how agencies create bookings.
     // Assuming bookingData ALREADY contains name/email/phone if agency creates it.
  } else {
    // Fallback, should ideally be caught by UI
     customerDetails = {
      customerName: "Anonymous Customer",
      customerEmail: "anonymous@example.com",
      customerPhone: "N/A",
    }
  }

  const newBookingData: any = {
    ...bookingData,
    ...customerDetails, // This might be overwritten if bookingData already has these from agency input
    pickupDate: Timestamp.fromDate(new Date(bookingData.pickupDate)),
    dropoffDate: Timestamp.fromDate(new Date(bookingData.dropoffDate)),
    status: bookingData.status || "Pending",
  };
  
  // If an agency is creating it, they should pass their agencyId.
  // If a customer is creating it, agencyId might be null or assigned later.
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
