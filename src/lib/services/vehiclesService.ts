
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
} from "firebase/firestore";

const VEHICLES_COLLECTION = "vehicles";

// Helper (currently no date fields in Vehicle type)
const fromFirestore = (vehicleData: any): Vehicle => {
  const data = vehicleData.data();
  return {
    ...data,
    id: vehicleData.id,
  } as Vehicle;
};

// Get all vehicles
export const getVehicles = async (): Promise<Vehicle[]> => {
  const q = query(collection(db, VEHICLES_COLLECTION), orderBy("make", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docSnapshot => fromFirestore({ id: docSnapshot.id, data: () => docSnapshot.data() }));
};

// Add a new vehicle
export const addVehicle = async (vehicleData: Omit<Vehicle, "id" | "imageUrl"> & { imageUrl?: string }): Promise<string> => {
  const docRef = await addDoc(collection(db, VEHICLES_COLLECTION), {
    ...vehicleData,
    capacity: Number(vehicleData.capacity) // Ensure capacity is stored as a number
  });
  return docRef.id;
};

// Update an existing vehicle
export const updateVehicle = async (vehicleId: string, vehicleData: Partial<Omit<Vehicle, "id">>): Promise<void> => {
  const vehicleRef = doc(db, VEHICLES_COLLECTION, vehicleId);
  const updateData: any = { ...vehicleData };
  if (vehicleData.capacity !== undefined) {
    updateData.capacity = Number(vehicleData.capacity); // Ensure capacity is stored as a number
  }
  await updateDoc(vehicleRef, updateData);
};

// Delete a vehicle
export const deleteVehicle = async (vehicleId: string): Promise<void> => {
  const vehicleRef = doc(db, VEHICLES_COLLECTION, vehicleId);
  await deleteDoc(vehicleRef);
};
