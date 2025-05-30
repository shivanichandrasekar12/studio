
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
  WriteBatch,
  writeBatch
} from "firebase/firestore";

const BOOKINGS_COLLECTION = "bookings";

// Helper to convert Firestore Timestamps to JS Dates in booking objects
const fromFirestore = (bookingData: any): Booking => {
  const data = bookingData.data();
  return {
    ...data,
    id: bookingData.id,
    pickupDate: (data.pickupDate as Timestamp)?.toDate(),
    dropoffDate: (data.dropoffDate as Timestamp)?.toDate(),
  } as Booking;
};


// Get all bookings
export const getBookings = async (): Promise<Booking[]> => {
  const q = query(collection(db, BOOKINGS_COLLECTION), orderBy("pickupDate", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => fromFirestore({ id: doc.id, data: () => doc.data() }));
};

// Add a new booking
export const addBooking = async (bookingData: Omit<Booking, "id">): Promise<string> => {
  const docRef = await addDoc(collection(db, BOOKINGS_COLLECTION), {
    ...bookingData,
    pickupDate: Timestamp.fromDate(bookingData.pickupDate),
    dropoffDate: Timestamp.fromDate(bookingData.dropoffDate),
  });
  return docRef.id;
};

// Update an existing booking
export const updateBooking = async (bookingId: string, bookingData: Partial<Omit<Booking, "id">>): Promise<void> => {
  const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
  const updateData: any = { ...bookingData };
  if (bookingData.pickupDate) {
    updateData.pickupDate = Timestamp.fromDate(bookingData.pickupDate);
  }
  if (bookingData.dropoffDate) {
    updateData.dropoffDate = Timestamp.fromDate(bookingData.dropoffDate);
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
};
