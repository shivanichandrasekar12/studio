
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
  getDoc, // Import getDoc
} from "firebase/firestore";
import { auth } from "@/lib/firebase"; // Import auth for current user details
import { addCustomerNotification } from "./notificationsService"; // Import notification service

const BOOKINGS_COLLECTION = "bookings";

// Helper to convert Firestore Timestamps to JS Dates in booking objects
const fromFirestore = (docSnapshot: any): Booking => {
  const data = docSnapshot.data();
  return {
    ...data,
    id: docSnapshot.id,
    pickupDate: (data.pickupDate as Timestamp)?.toDate(),
    dropoffDate: (data.dropoffDate as Timestamp)?.toDate(),
    // Ensure related date fields are converted if added in future
  } as Booking;
};

// Get all bookings (primarily for agency/admin use)
export const getBookings = async (): Promise<Booking[]> => {
  const q = query(collection(db, BOOKINGS_COLLECTION), orderBy("pickupDate", "desc"));
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
// The bookingData here should be what the customer provides, plus their customerId
export const addBooking = async (bookingData: Omit<Booking, "id" | "customerName" | "customerEmail" | "customerPhone"> & { customerId: string }): Promise<string> => {
  const currentUser = auth.currentUser;
  let customerDetails = {};

  if (currentUser) {
    customerDetails = {
      customerName: currentUser.displayName || currentUser.email?.split('@')[0] || "Customer",
      customerEmail: currentUser.email || "Not available",
      customerPhone: currentUser.phoneNumber || "Not available", // Assuming phone might be available on user profile
    };
  } else {
    // This case should ideally be prevented by UI checks
    // but as a fallback:
    customerDetails = {
      customerName: "Anonymous Customer",
      customerEmail: "anonymous@example.com",
      customerPhone: "N/A",
    }
  }


  const newBookingData = {
    ...bookingData,
    ...customerDetails,
    pickupDate: Timestamp.fromDate(new Date(bookingData.pickupDate)),
    dropoffDate: Timestamp.fromDate(new Date(bookingData.dropoffDate)),
    status: bookingData.status || "Pending", // Ensure status is set
  };

  const docRef = await addDoc(collection(db, BOOKINGS_COLLECTION), newBookingData);
  return docRef.id;
};


// Update an existing booking
export const updateBooking = async (bookingId: string, bookingData: Partial<Omit<Booking, "id">>): Promise<void> => {
  const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
  const updateData: any = { ...bookingData };
  if (bookingData.pickupDate && bookingData.pickupDate instanceof Date) {
    updateData.pickupDate = Timestamp.fromDate(bookingData.pickupDate);
  } else if (bookingData.pickupDate) { // Handle if it's already a string/number timestamp
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
        const bookingData = fromFirestore(bookingSnap); // Use our helper to convert
        
        if (bookingData.customerId) {
          const pickupDateFormatted = bookingData.pickupDate 
            ? new Date(bookingData.pickupDate).toLocaleDateString() 
            : "the requested date";
          
          await addCustomerNotification(bookingData.customerId, {
            title: "Booking Request Update",
            description: `Unfortunately, your booking for ${bookingData.pickupLocation || 'your selected destination'} on ${pickupDateFormatted} could not be confirmed at this time. Please consider rescheduling or contact support.`,
            type: "booking_denied", // Specific type for this scenario
            link: "/customer/dashboard/my-bookings" 
          });
          console.log(`Customer notification sent for denied booking ${bookingId}`);
        } else {
          console.warn(`Booking ${bookingId} denied, but no customerId found to send notification.`);
        }
      }
    } catch (error) {
      console.error("Error sending notification for denied booking:", error);
      // Do not let notification failure block the status update.
      // In a production app, you might queue this or add more robust error handling.
    }
  }
};
