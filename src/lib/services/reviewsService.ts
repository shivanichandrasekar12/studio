
import { db } from "@/lib/firebase";
import type { Review } from "@/types";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
  where,
} from "firebase/firestore";
import type { User } from "firebase/auth";

const REVIEWS_COLLECTION = "reviews";

// Helper to convert Firestore Timestamps to JS Dates
const fromFirestore = (docSnapshot: any): Review => {
  const data = docSnapshot.data();
  return {
    ...data,
    id: docSnapshot.id,
    createdAt: (data.createdAt as Timestamp)?.toDate(),
  } as Review;
};

// Get all reviews (e.g., for agency to see all customer_feedback they've logged)
export const getReviews = async (reviewType?: Review['reviewType']): Promise<Review[]> => {
  let q;
  if (reviewType) {
    q = query(collection(db, REVIEWS_COLLECTION), where("reviewType", "==", reviewType), orderBy("createdAt", "desc"));
  } else {
    q = query(collection(db, REVIEWS_COLLECTION), orderBy("createdAt", "desc"));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => fromFirestore(doc));
};

// Get reviews submitted by a specific customer
export const getCustomerSubmittedReviews = async (customerId: string): Promise<Review[]> => {
  const q = query(
    collection(db, REVIEWS_COLLECTION), 
    where("reviewerId", "==", customerId),
    where("reviewType", "==", "user_submitted"),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => fromFirestore(doc));
};

// Add a new review (generic, used by agency to log customer_feedback or by customer to submit their own)
export const addReview = async (reviewData: Omit<Review, "id" | "createdAt"> & { createdAt?: Date }): Promise<string> => {
  const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), {
    ...reviewData,
    createdAt: reviewData.createdAt ? Timestamp.fromDate(reviewData.createdAt) : Timestamp.now(),
  });
  return docRef.id;
};


// Update an existing review
export const updateReview = async (reviewId: string, reviewData: Partial<Omit<Review, "id">>): Promise<void> => {
  const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
  const updateData: any = { ...reviewData };
  if (reviewData.createdAt && reviewData.createdAt instanceof Date) { // Ensure it's a Date object before converting
    updateData.createdAt = Timestamp.fromDate(reviewData.createdAt);
  }
  await updateDoc(reviewRef, updateData);
};

// Delete a review
export const deleteReview = async (reviewId: string): Promise<void> => {
  const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
  await deleteDoc(reviewRef);
};

// Specific function for customers to add their review
export const addCustomerSubmittedReview = async (
  reviewPayload: {
    bookingId: string;
    rating: number;
    comment: string;
    title?: string;
  },
  user: User
): Promise<string> => {
  const reviewData: Omit<Review, "id" | "createdAt"> = {
    bookingId: reviewPayload.bookingId,
    reviewerId: user.uid,
    customerName: user.displayName || user.email || "Anonymous",
    rating: reviewPayload.rating,
    comment: reviewPayload.comment,
    title: reviewPayload.title,
    avatarUrl: user.photoURL || `https://placehold.co/40x40.png?text=${(user.displayName || user.email || "A").substring(0,1).toUpperCase()}`,
    reviewType: 'user_submitted',
    createdAt: new Date(), // Will be converted to Timestamp in addReview
  };
  return addReview(reviewData);
};
