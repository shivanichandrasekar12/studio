
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
  Timestamp, // Added Timestamp
} from "firebase/firestore";

const EMPLOYEES_COLLECTION = "employees";

// Helper to convert Firestore Timestamps to JS Dates if any date fields were present
// For Employee, currently no date fields, but good practice for future.
const fromFirestore = (employeeData: any): Employee => {
  const data = employeeData.data();
  return {
    ...data,
    id: employeeData.id,
    // Example if Employee had a date field:
    // joinDate: (data.joinDate as Timestamp)?.toDate(), 
  } as Employee;
};

// Get all employees
export const getEmployees = async (): Promise<Employee[]> => {
  const q = query(collection(db, EMPLOYEES_COLLECTION), orderBy("name", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docSnapshot => fromFirestore({ id: docSnapshot.id, data: () => docSnapshot.data() }));
};

// Add a new employee
export const addEmployee = async (employeeData: Omit<Employee, "id" | "avatarUrl"> & { avatarUrl?: string }): Promise<string> => {
  const docRef = await addDoc(collection(db, EMPLOYEES_COLLECTION), {
    ...employeeData,
    // If Employee had a date field:
    // joinDate: Timestamp.fromDate(employeeData.joinDate),
  });
  return docRef.id;
};

// Update an existing employee
export const updateEmployee = async (employeeId: string, employeeData: Partial<Omit<Employee, "id">>): Promise<void> => {
  const employeeRef = doc(db, EMPLOYEES_COLLECTION, employeeId);
  const updateData: any = { ...employeeData };
  // If Employee had a date field to update:
  // if (employeeData.joinDate) {
  //   updateData.joinDate = Timestamp.fromDate(employeeData.joinDate);
  // }
  await updateDoc(employeeRef, updateData);
};

// Delete an employee
export const deleteEmployee = async (employeeId: string): Promise<void> => {
  const employeeRef = doc(db, EMPLOYEES_COLLECTION, employeeId);
  await deleteDoc(employeeRef);
};
