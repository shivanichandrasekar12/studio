
import { db } from "@/lib/firebase";
import type { UserRole } from "@/types";
import { collection, doc, getDoc, getDocs, setDoc, query, orderBy } from "firebase/firestore";

const USERS_COLLECTION = "users";

export interface UserProfileData {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
  // Add other profile fields as needed
}

export const createUserProfile = async (
  uid: string,
  email: string,
  role: UserRole,
  displayName?: string
): Promise<void> => {
  const userRef = doc(db, USERS_COLLECTION, uid);
  const profileData: UserProfileData = { uid, email, role };
  if (displayName) {
    profileData.displayName = displayName;
  }
  // You can add a createdAt timestamp here if desired
  // profileData.createdAt = Timestamp.now();
  await setDoc(userRef, profileData);
  console.log(`User profile created for UID: ${uid} with role: ${role}`);
};

export const getUserRole = async (uid: string): Promise<UserRole | null> => {
  const userRef = doc(db, USERS_COLLECTION, uid);
  try {
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      const userData = docSnap.data() as UserProfileData;
      console.log(`Role for UID ${uid}: ${userData?.role}`);
      return userData?.role || null;
    } else {
      console.log(`No profile found for UID: ${uid}`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
};

export const getAllUserProfiles = async (): Promise<UserProfileData[]> => {
  const usersQuery = query(collection(db, USERS_COLLECTION), orderBy("displayName", "asc")); // Optional: order by name
  const snapshot = await getDocs(usersQuery);
  return snapshot.docs.map(doc => doc.data() as UserProfileData);
};
