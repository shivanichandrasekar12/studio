
import { db } from "@/lib/firebase";
import type { Review } from "@/types";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc, // If you plan to allow editing reviews
  deleteDoc, // If you plan to allow deleting reviews
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";

const REVIEWS_COLLECTION = "reviews";

// Helper to convert Firestore Timestamps to JS Dates
const fromFirestore = (reviewData: any): Review => {
  const data = reviewData.data();
  return {
    ...data,
    id: reviewData.id,
    createdAt: (data.createdAt as Timestamp)?.toDate(),
  } as Review;
};

// Get all reviews (agency might want to see all logged customer reviews)
export const getReviews = async (): Promise<Review[]> => {
  // For agency, they probably want to see all reviews they've logged, or all reviews for their agency.
  // For simplicity now, fetching all. Later could add agencyId filter.
  const q = query(collection(db, REVIEWS_COLLECTION), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docSnapshot => fromFirestore({ id: docSnapshot.id, data: () => docSnapshot.data() }));
};

// Add a new review (logged by the agency)
export const addReview = async (reviewData: Omit<Review, "id" | "createdAt"> & { createdAt?: Date }): Promise<string> => {
  const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), {
    ...reviewData,
    createdAt: reviewData.createdAt ? Timestamp.fromDate(reviewData.createdAt) : Timestamp.now(),
  });
  return docRef.id;
};

// Optional: Update an existing review
export const updateReview = async (reviewId: string, reviewData: Partial<Omit<Review, "id">>): Promise<void> => {
  const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
  const updateData: any = { ...reviewData };
  if (reviewData.createdAt) {
    updateData.createdAt = Timestamp.fromDate(reviewData.createdAt);
  }
  await updateDoc(reviewRef, updateData);
};

// Optional: Delete a review
export const deleteReview = async (reviewId: string): Promise<void> => {
  const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
  await deleteDoc(reviewRef);
};
