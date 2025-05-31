
import { db } from "@/lib/firebase";
import type { Vehicle } from "@/types";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where, // Import where
} from "firebase/firestore";

const VEHICLES_COLLECTION = "vehicles";

const fromFirestore = (vehicleData: any): Vehicle => {
  const data = vehicleData.data();
  return {
    ...data,
    id: vehicleData.id,
  } as Vehicle;
};

// Get vehicles for a specific agency
export const getVehicles = async (agencyId: string): Promise<Vehicle[]> => {
  if (!agencyId) {
    console.warn("getVehicles called without agencyId");
    return [];
  }
  const q = query(
    collection(db, VEHICLES_COLLECTION), 
    where("agencyId", "==", agencyId),
    orderBy("make", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docSnapshot => fromFirestore({ id: docSnapshot.id, data: () => docSnapshot.data() }));
};

// Add a new vehicle, ensuring agencyId is included
export const addVehicle = async (vehicleData: Omit<Vehicle, "id" | "imageUrl"> & { imageUrl?: string; agencyId: string }): Promise<string> => {
  const docRef = await addDoc(collection(db, VEHICLES_COLLECTION), {
    ...vehicleData,
    capacity: Number(vehicleData.capacity) 
  });
  return docRef.id;
};

// Update an existing vehicle (security rules will ensure agencyId cannot be changed by non-admins)
export const updateVehicle = async (vehicleId: string, vehicleData: Partial<Omit<Vehicle, "id" | "agencyId">>): Promise<void> => {
  const vehicleRef = doc(db, VEHICLES_COLLECTION, vehicleId);
  const updateData: any = { ...vehicleData };
  if (vehicleData.capacity !== undefined) {
    updateData.capacity = Number(vehicleData.capacity); 
  }
  await updateDoc(vehicleRef, updateData);
};

// Delete a vehicle
export const deleteVehicle = async (vehicleId: string): Promise<void> => {
  const vehicleRef = doc(db, VEHICLES_COLLECTION, vehicleId);
  await deleteDoc(vehicleRef);
};
