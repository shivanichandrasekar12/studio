
import { db } from "@/lib/firebase";
import type { NotificationItem } from "@/types";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
  Timestamp,
  writeBatch,
  where,
  limit
} from "firebase/firestore";

const NOTIFICATIONS_COLLECTION = "notifications"; // Generic collection

// Helper to convert Firestore Timestamps to JS Dates
const fromFirestore = (docSnapshot: any): NotificationItem => {
  const data = docSnapshot.data();
  return {
    ...data,
    id: docSnapshot.id,
    timestamp: (data.timestamp as Timestamp)?.toDate(),
  } as NotificationItem;
};

// --- Agency Specific Notifications ---
export const getAgencyNotifications = async (count?: number): Promise<NotificationItem[]> => {
  let q = query(
    collection(db, NOTIFICATIONS_COLLECTION), 
    where("role", "==", "agency"), // Assuming notifications for agencies have a role field
    orderBy("timestamp", "desc")
  );
  if (count) {
    q = query(
      collection(db, NOTIFICATIONS_COLLECTION), 
      where("role", "==", "agency"),
      orderBy("timestamp", "desc"), 
      limit(count)
    );
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => fromFirestore(doc));
};

export const addAgencyNotification = async (notificationData: Omit<NotificationItem, "id" | "timestamp" | "read" | "role" | "userId"> & { timestamp?: Date }): Promise<string> => {
  const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
    ...notificationData,
    timestamp: notificationData.timestamp ? Timestamp.fromDate(notificationData.timestamp) : Timestamp.now(),
    read: false,
    role: "agency", // Mark as an agency notification
  });
  return docRef.id;
};

export const markAgencyNotificationAsRead = async (notificationId: string): Promise<void> => {
  const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
  await updateDoc(notificationRef, { read: true });
};

export const markAllAgencyNotificationsAsRead = async (): Promise<void> => {
  const q = query(
    collection(db, NOTIFICATIONS_COLLECTION), 
    where("role", "==", "agency"),
    where("read", "==", false)
  );
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    return;
  }
  const batch = writeBatch(db);
  snapshot.docs.forEach(docSnapshot => {
    batch.update(docSnapshot.ref, { read: true });
  });
  await batch.commit();
};


// --- Customer Specific Notifications ---
export const getCustomerNotifications = async (customerId: string, count?: number): Promise<NotificationItem[]> => {
  if (!customerId) return [];
  let q = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    where("userId", "==", customerId), // Notifications are targeted to a specific user
    // where("role", "==", "customer"), // Optionally filter by role if general users can have other roles
    orderBy("timestamp", "desc")
  );
  if (count) {
    q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where("userId", "==", customerId),
      // where("role", "==", "customer"),
      orderBy("timestamp", "desc"),
      limit(count)
    );
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => fromFirestore(doc));
};

// Example: Adding a notification FOR a customer (e.g., system generated)
export const addCustomerNotification = async (customerId: string, notificationData: Omit<NotificationItem, "id" | "timestamp" | "read" | "role" | "userId"> & { timestamp?: Date }): Promise<string> => {
  const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
    ...notificationData,
    timestamp: notificationData.timestamp ? Timestamp.fromDate(notificationData.timestamp) : Timestamp.now(),
    read: false,
    role: "customer",
    userId: customerId,
  });
  return docRef.id;
};

export const markCustomerNotificationAsRead = async (notificationId: string): Promise<void> => {
  const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
  await updateDoc(notificationRef, { read: true });
};

export const markAllCustomerNotificationsAsRead = async (customerId: string): Promise<void> => {
  if (!customerId) return;
  const q = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    where("userId", "==", customerId),
    where("read", "==", false)
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return;
  }
  const batch = writeBatch(db);
  snapshot.docs.forEach(docSnapshot => {
    batch.update(docSnapshot.ref, { read: true });
  });
  await batch.commit();
};
