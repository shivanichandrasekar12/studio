
"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Vehicle } from "@/types";
import { PlusCircle, MoreHorizontal, Edit, Trash2, Loader2, AlertCircle, Truck, Car } from "lucide-react"; 
import Image from "next/image";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, type FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getVehicles, addVehicle, updateVehicle, deleteVehicle } from "@/lib/services/vehiclesService";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


export default function AgencyVehiclesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: vehicles = [], isLoading: isLoadingVehicles, error: vehiclesError } = useQuery<Vehicle[], Error>({
    queryKey: ["vehicles"],
    queryFn: getVehicles,
  });
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Form state
  const [type, setType] = useState("");
  const [make, setMake] = useState("");
  const [modelValue, setModelValue] = useState(""); 
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [capacity, setCapacity] = useState<number | string>("");
  const [status, setStatus] = useState<Vehicle["status"]>("Available");
  const [imageUrl, setImageUrl] = useState("");


  const { mutate: addVehicleMutation, isPending: isAddingVehicle } = useMutation({
    mutationFn: addVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast({ title: "Vehicle Added", description: "The new vehicle has been successfully added to your fleet." });
      setIsFormOpen(false);
    },
    onError: (error) => {
      toast({ title: "Error Adding Vehicle", description: error.message, variant: "destructive" });
    },
  });

  const { mutate: updateVehicleMutation, isPending: isUpdatingVehicle } = useMutation({
    mutationFn: async (vehiclePayload: { id: string; data: Partial<Omit<Vehicle, "id">>}) => updateVehicle(vehiclePayload.id, vehiclePayload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast({ title: "Vehicle Updated", description: "The vehicle details have been successfully updated." });
      setIsFormOpen(false);
    },
    onError: (error) => {
      toast({ title: "Error Updating Vehicle", description: error.message, variant: "destructive" });
    },
  });

  const { mutate: deleteVehicleMutation } = useMutation({
    mutationFn: deleteVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast({ title: "Vehicle Deleted", description: "The vehicle has been successfully removed from your fleet." });
    },
    onError: (error) => {
      toast({ title: "Error Deleting Vehicle", description: error.message, variant: "destructive" });
    },
  });


  const handleOpenForm = (vehicle?: Vehicle) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setType(vehicle.type);
      setMake(vehicle.make);
      setModelValue(vehicle.model);
      setRegistrationNumber(vehicle.registrationNumber);
      setCapacity(vehicle.capacity);
      setStatus(vehicle.status);
      setImageUrl(vehicle.imageUrl || "");
    } else {
      setEditingVehicle(null);
      setType("");
      setMake("");
      setModelValue("");
      setRegistrationNumber("");
      setCapacity("");
      setStatus("Available");
      setImageUrl("");
    }
    setIsFormOpen(true);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const vehiclePayload = {
      type, make, model: modelValue, registrationNumber, 
      capacity: Number(capacity), status, imageUrl: imageUrl || undefined,
    };

    if (editingVehicle) {
      updateVehicleMutation({id: editingVehicle.id, data: vehiclePayload});
    } else {
      addVehicleMutation(vehiclePayload);
    }
  };
  
  const handleDelete = (vehicleId: string) => {
    if (window.confirm("Are you sure you want to delete this vehicle? This action cannot be undone.")) {
        deleteVehicleMutation(vehicleId);
    }
  };

  const isMutating = isAddingVehicle || isUpdatingVehicle;

  if (vehiclesError) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Fetching Vehicles</AlertTitle>
          <AlertDescription>{vehiclesError.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Vehicle Management" description="Oversee your fleet of vehicles.">
        <Button onClick={() => handleOpenForm()} disabled={isMutating}>
          <Car className="mr-2 h-4 w-4" /> Add Vehicle
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Truck className="mr-2 h-5 w-5 text-primary"/>Vehicle Fleet</CardTitle>
          <CardDescription>Details of all vehicles currently in your agency's fleet.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingVehicles ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Make & Model</TableHead>
                  <TableHead>Reg. No.</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-12 w-16 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : vehicles.length === 0 ? (
             <div className="text-center py-10">
              <Truck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No vehicles found in your fleet.</p>
              <p className="text-sm text-muted-foreground">Click "Add Vehicle" to get started.</p>
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Make & Model</TableHead>
                <TableHead>Reg. No.</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell>
                    <Image 
                      src={vehicle.imageUrl || `https://placehold.co/80x60.png?text=${vehicle.type.substring(0,10)}`} 
                      alt={`${vehicle.make} ${vehicle.model}`}
                      width={80} 
                      height={60} 
                      className="rounded object-cover"
                      data-ai-hint="vehicle image"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{vehicle.type}</TableCell>
                  <TableCell>{vehicle.make} {vehicle.model}</TableCell>
                  <TableCell>{vehicle.registrationNumber}</TableCell>
                  <TableCell>{vehicle.capacity} seats</TableCell>
                  <TableCell>
                    <Badge variant={vehicle.status === 'Available' ? 'default' : vehicle.status === 'In Use' ? 'secondary' : 'destructive'}
                      className={
                        vehicle.status === 'Available' ? 'bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30' :
                        vehicle.status === 'In Use' ? 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30 hover:bg-yellow-500/30' :
                        'bg-red-500/20 text-red-700 border-red-500/30 hover:bg-red-500/30'
                      }
                    >
                      {vehicle.status}
                    </Badge>
                  </TableCell>
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
                        <DropdownMenuItem onClick={() => handleOpenForm(vehicle)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => handleDelete(vehicle.id)}>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}</DialogTitle>
            <DialogDescription>
              {editingVehicle ? "Update vehicle details." : "Enter the information for the new vehicle."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">Type</Label>
                <Input id="type" value={type} onChange={(e) => setType(e.target.value)} className="col-span-3" placeholder="e.g., Sedan, SUV, Van" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="make" className="text-right">Make</Label>
                <Input id="make" value={make} onChange={(e) => setMake(e.target.value)} className="col-span-3" placeholder="e.g., Toyota" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="model" className="text-right">Model</Label>
                <Input id="model" value={modelValue} onChange={(e) => setModelValue(e.target.value)} className="col-span-3" placeholder="e.g., Camry" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="registrationNumber" className="text-right">Reg. No.</Label>
                <Input id="registrationNumber" value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} className="col-span-3" placeholder="e.g., ABC 123" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="capacity" className="text-right">Capacity</Label>
                <Input id="capacity" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} className="col-span-3" placeholder="e.g., 5" required min="1" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Status</Label>
                <Select value={status} onValueChange={(value: Vehicle["status"]) => setStatus(value)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="In Use">In Use</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="imageUrl" className="text-right">Image URL</Label>
                <Input id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="col-span-3" placeholder="https://placehold.co/80x60.png"/>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={isMutating}>Cancel</Button>
              <Button type="submit" disabled={isMutating}>
                 {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingVehicle ? "Save Changes" : "Add Vehicle"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

    