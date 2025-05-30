
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

const AGENCY_NOTIFICATIONS_COLLECTION = "agency-notifications"; // Specific for agency

// Helper to convert Firestore Timestamps to JS Dates
const fromFirestore = (notificationData: any): NotificationItem => {
  const data = notificationData.data();
  return {
    ...data,
    id: notificationData.id,
    timestamp: (data.timestamp as Timestamp)?.toDate(),
  } as NotificationItem;
};

// Get notifications for the agency
export const getAgencyNotifications = async (count?: number): Promise<NotificationItem[]> => {
  let q = query(collection(db, AGENCY_NOTIFICATIONS_COLLECTION), orderBy("timestamp", "desc"));
  if (count) {
    q = query(collection(db, AGENCY_NOTIFICATIONS_COLLECTION), orderBy("timestamp", "desc"), limit(count));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docSnapshot => fromFirestore({ id: docSnapshot.id, data: () => docSnapshot.data() }));
};

// Add a new notification for the agency
export const addAgencyNotification = async (notificationData: Omit<NotificationItem, "id" | "timestamp" | "read"> & { timestamp?: Date }): Promise<string> => {
  const docRef = await addDoc(collection(db, AGENCY_NOTIFICATIONS_COLLECTION), {
    ...notificationData,
    timestamp: notificationData.timestamp ? Timestamp.fromDate(notificationData.timestamp) : Timestamp.now(),
    read: false, // New notifications are unread by default
  });
  return docRef.id;
};

// Mark a specific notification as read
export const markAgencyNotificationAsRead = async (notificationId: string): Promise<void> => {
  const notificationRef = doc(db, AGENCY_NOTIFICATIONS_COLLECTION, notificationId);
  await updateDoc(notificationRef, { read: true });
};

// Mark all unread agency notifications as read
export const markAllAgencyNotificationsAsRead = async (): Promise<void> => {
  const q = query(collection(db, AGENCY_NOTIFICATIONS_COLLECTION), where("read", "==", false));
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
