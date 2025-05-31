
import { db } from "@/lib/firebase";
import type { Employee } from "@/types";
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
  Timestamp, 
} from "firebase/firestore";

const EMPLOYEES_COLLECTION = "employees";

const fromFirestore = (employeeData: any): Employee => {
  const data = employeeData.data();
  return {
    ...data,
    id: employeeData.id,
  } as Employee;
};

// Get employees for a specific agency
export const getEmployees = async (agencyId: string): Promise<Employee[]> => {
  if (!agencyId) {
    console.warn("getEmployees called without agencyId");
    return [];
  }
  const q = query(
    collection(db, EMPLOYEES_COLLECTION), 
    where("agencyId", "==", agencyId),
    orderBy("name", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docSnapshot => fromFirestore({ id: docSnapshot.id, data: () => docSnapshot.data() }));
};

// Add a new employee, ensuring agencyId is included
export const addEmployee = async (employeeData: Omit<Employee, "id" | "avatarUrl"> & { avatarUrl?: string; agencyId: string }): Promise<string> => {
  const docRef = await addDoc(collection(db, EMPLOYEES_COLLECTION), {
    ...employeeData, 
  });
  return docRef.id;
};

// Update an existing employee (security rules will ensure agencyId cannot be changed by non-admins)
export const updateEmployee = async (employeeId: string, employeeData: Partial<Omit<Employee, "id" | "agencyId">>): Promise<void> => {
  const employeeRef = doc(db, EMPLOYEES_COLLECTION, employeeId);
  const updateData: any = { ...employeeData };
  await updateDoc(employeeRef, updateData);
};

// Delete an employee
export const deleteEmployee = async (employeeId: string): Promise<void> => {
  const employeeRef = doc(db, EMPLOYEES_COLLECTION, employeeId);
  await deleteDoc(employeeRef);
};
