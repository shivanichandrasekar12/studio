"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Vehicle } from "@/types";
import { PlusCircle, MoreHorizontal, Edit, Trash2, Car } from "lucide-react";
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

const mockVehicles: Vehicle[] = [
  { id: "1", type: "Sedan", make: "Toyota", model: "Camry", registrationNumber: "XYZ 123", capacity: 5, status: "Available", imageUrl: "https://placehold.co/80x60.png?text=Sedan" },
  { id: "2", type: "SUV", make: "Honda", model: "CR-V", registrationNumber: "ABC 456", capacity: 5, status: "In Use", imageUrl: "https://placehold.co/80x60.png?text=SUV" },
  { id: "3", type: "Van", make: "Ford", model: "Transit", registrationNumber: "DEF 789", capacity: 12, status: "Maintenance", imageUrl: "https://placehold.co/80x60.png?text=Van" },
  { id: "4", type: "Luxury", make: "Mercedes", model: "S-Class", registrationNumber: "GHI 012", capacity: 4, status: "Available", imageUrl: "https://placehold.co/80x60.png?text=Luxury" },
];

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Form state
  const [type, setType] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [capacity, setCapacity] = useState<number | string>("");
  const [status, setStatus] = useState<Vehicle["status"]>("Available");


  const handleOpenForm = (vehicle?: Vehicle) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setType(vehicle.type);
      setMake(vehicle.make);
      setModel(vehicle.model);
      setRegistrationNumber(vehicle.registrationNumber);
      setCapacity(vehicle.capacity);
      setStatus(vehicle.status);
    } else {
      setEditingVehicle(null);
      setType("");
      setMake("");
      setModel("");
      setRegistrationNumber("");
      setCapacity("");
      setStatus("Available");
    }
    setIsFormOpen(true);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const newVehicle: Vehicle = {
      id: editingVehicle ? editingVehicle.id : String(Date.now()),
      type,
      make,
      model,
      registrationNumber,
      capacity: Number(capacity),
      status,
    };
    if (editingVehicle) {
      setVehicles(vehicles.map(v => v.id === editingVehicle.id ? newVehicle : v));
    } else {
      setVehicles([...vehicles, newVehicle]);
    }
    setIsFormOpen(false);
  };
  
  const handleDelete = (vehicleId: string) => {
    setVehicles(vehicles.filter(v => v.id !== vehicleId));
  };


  return (
    <>
      <PageHeader title="Vehicle Management" description="Oversee your fleet of vehicles.">
        <Button onClick={() => handleOpenForm()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Vehicle
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle Fleet</CardTitle>
          <CardDescription>Details of all vehicles currently in your agency's fleet.</CardDescription>
        </CardHeader>
        <CardContent>
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
                      src={vehicle.imageUrl || `https://placehold.co/80x60.png?text=${vehicle.type}`} 
                      alt={vehicle.type}
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
                <Input id="model" value={model} onChange={(e) => setModel(e.target.value)} className="col-span-3" placeholder="e.g., Camry" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="registrationNumber" className="text-right">Reg. No.</Label>
                <Input id="registrationNumber" value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} className="col-span-3" placeholder="e.g., ABC 123" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="capacity" className="text-right">Capacity</Label>
                <Input id="capacity" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} className="col-span-3" placeholder="e.g., 5" required />
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
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button type="submit">{editingVehicle ? "Save Changes" : "Add Vehicle"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
