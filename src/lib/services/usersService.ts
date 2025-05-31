
import { db } from "@/lib/firebase";
import type { UserRole, UserProfileData } from "@/types"; // Import UserProfileData from types
import { collection, doc, getDoc, getDocs, setDoc, query, orderBy } from "firebase/firestore";

const USERS_COLLECTION = "users";

// UserProfileData is now imported from @/types

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
  await setDoc(userRef, profileData);
  console.log(`User profile created for UID: ${uid} with role: ${role}`);
};

export const getUserRole = async (uid: string): Promise<UserRole | null> => {
  const userRef = doc(db, USERS_COLLECTION, uid);
  try {
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      const userData = docSnap.data() as UserProfileData; // Cast to UserProfileData
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
  const usersQuery = query(collection(db, USERS_COLLECTION), orderBy("displayName", "asc"));
  const snapshot = await getDocs(usersQuery);
  return snapshot.docs.map(docSnapshot => {
    const data = docSnapshot.data();
    const userProfile: UserProfileData = {
      uid: docSnapshot.id, // Correctly map document ID to uid
      email: data.email,
      role: data.role,
      displayName: data.displayName,
      // any other fields defined in UserProfileData should be mapped here
    };
    return userProfile;
  });
};
