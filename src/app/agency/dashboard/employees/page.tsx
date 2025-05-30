
"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Employee } from "@/types";
import { PlusCircle, MoreHorizontal, Edit, Trash2, Loader2, AlertCircle, UserPlus, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, type FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEmployees, addEmployee, updateEmployee, deleteEmployee } from "@/lib/services/employeesService";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


export default function AgencyEmployeesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: employees = [], isLoading: isLoadingEmployees, error: employeesError } = useQuery<Employee[], Error>({
    queryKey: ["employees"],
    queryFn: getEmployees,
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");


  const { mutate: addEmployeeMutation, isPending: isAddingEmployee } = useMutation({
    mutationFn: addEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast({ title: "Employee Added", description: "The new employee has been successfully created." });
      setIsFormOpen(false);
    },
    onError: (error) => {
      toast({ title: "Error Adding Employee", description: error.message, variant: "destructive" });
    },
  });

  const { mutate: updateEmployeeMutation, isPending: isUpdatingEmployee } = useMutation({
    mutationFn: async (employeeData: { id: string; data: Partial<Omit<Employee, "id">>}) => updateEmployee(employeeData.id, employeeData.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast({ title: "Employee Updated", description: "The employee details have been successfully updated." });
      setIsFormOpen(false);
    },
    onError: (error) => {
      toast({ title: "Error Updating Employee", description: error.message, variant: "destructive" });
    },
  });

  const { mutate: deleteEmployeeMutation } = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast({ title: "Employee Deleted", description: "The employee has been successfully deleted." });
    },
    onError: (error) => {
      toast({ title: "Error Deleting Employee", description: error.message, variant: "destructive" });
    },
  });


  const handleOpenForm = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee);
      setName(employee.name);
      setRole(employee.role);
      setEmail(employee.email);
      setPhone(employee.phone);
      setAvatarUrl(employee.avatarUrl || "");
    } else {
      setEditingEmployee(null);
      setName("");
      setRole("");
      setEmail("");
      setPhone("");
      setAvatarUrl("");
    }
    setIsFormOpen(true);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const employeePayload = { name, role, email, phone, avatarUrl: avatarUrl || undefined };

    if (editingEmployee) {
      updateEmployeeMutation({id: editingEmployee.id, data: employeePayload});
    } else {
      addEmployeeMutation(employeePayload);
    }
  };
  
  const handleDelete = (employeeId: string) => {
     if (window.confirm("Are you sure you want to delete this employee? This action cannot be undone.")) {
        deleteEmployeeMutation(employeeId);
    }
  };

  const isMutating = isAddingEmployee || isUpdatingEmployee;

  if (employeesError) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Fetching Employees</AlertTitle>
          <AlertDescription>{employeesError.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Employee Management" description="Manage your agency's staff and their roles.">
        <Button onClick={() => handleOpenForm()} disabled={isMutating}>
          <UserPlus className="mr-2 h-4 w-4" /> Add Employee
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5 text-primary"/>Employee List</CardTitle>
          <CardDescription>A comprehensive list of all employees in your agency.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingEmployees ? (
             <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><div className="flex items-center gap-3"><Skeleton className="h-9 w-9 rounded-full" /><Skeleton className="h-5 w-24" /></div></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
            </Table>
          ) : employees.length === 0 ? (
            <div className="text-center py-10">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No employees found.</p>
              <p className="text-sm text-muted-foreground">Click "Add Employee" to get started.</p>
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={employee.avatarUrl || `https://placehold.co/40x40.png?text=${employee.name.substring(0,2)}`} alt={employee.name} data-ai-hint="employee avatar"/>
                        <AvatarFallback>{employee.name.substring(0,2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      {employee.name}
                    </div>
                  </TableCell>
                  <TableCell>{employee.role}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.phone}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleOpenForm(employee)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => handleDelete(employee.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingEmployee ? "Edit Employee" : "Add New Employee"}</DialogTitle>
            <DialogDescription>
              {editingEmployee ? "Update the details for this employee." : "Fill in the details for the new employee."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">Role</Label>
                <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">Phone</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="avatarUrl" className="text-right">Avatar URL</Label>
                <Input id="avatarUrl" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} className="col-span-3" placeholder="https://placehold.co/40x40.png"/>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={isMutating}>Cancel</Button>
              <Button type="submit" disabled={isMutating}>
                {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingEmployee ? "Save Changes" : "Add Employee"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

    