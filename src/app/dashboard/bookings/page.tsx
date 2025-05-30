"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Booking } from "@/types";
import { PlusCircle, MoreHorizontal, CheckCircle, XCircle, Edit, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const mockBookings: Booking[] = [
  { id: "B001", customerName: "Diana Prince", customerEmail: "diana@example.com", customerPhone: "555-0201", pickupDate: new Date(2024, 6, 15, 10, 0), dropoffDate: new Date(2024, 6, 15, 14, 0), pickupLocation: "Themyscira Port", dropoffLocation: "Stark Tower", vehicleId: "1", vehicleType: "Sedan", status: "Confirmed", notes: "VIP client, ensure punctuality." },
  { id: "B002", customerName: "Bruce Wayne", customerEmail: "bruce@example.com", customerPhone: "555-0202", pickupDate: new Date(2024, 6, 16, 18, 0), dropoffDate: new Date(2024, 6, 17, 9, 0), pickupLocation: "Wayne Manor", dropoffLocation: "LexCorp HQ", vehicleId: "4", vehicleType: "Luxury", status: "Pending", notes: "Requires discreet driver." },
  { id: "B003", customerName: "Clark Kent", customerEmail: "clark@example.com", customerPhone: "555-0203", pickupDate: new Date(2024, 6, 18, 9, 30), dropoffDate: new Date(2024, 6, 18, 10, 30), pickupLocation: "Daily Planet", dropoffLocation: "Smallville Farm", vehicleType: "SUV", status: "Denied", notes: "Unavailable vehicle type for that date." },
];

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [pickupDate, setPickupDate] = useState<Date | undefined>();
  const [dropoffDate, setDropoffDate] = useState<Date | undefined>();
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<Booking["status"]>("Pending");


  const handleOpenForm = (booking?: Booking) => {
    if (booking) {
      setEditingBooking(booking);
      setCustomerName(booking.customerName);
      setCustomerEmail(booking.customerEmail);
      setCustomerPhone(booking.customerPhone);
      setPickupDate(booking.pickupDate);
      setDropoffDate(booking.dropoffDate);
      setPickupLocation(booking.pickupLocation);
      setDropoffLocation(booking.dropoffLocation);
      setVehicleType(booking.vehicleType || "");
      setNotes(booking.notes || "");
      setStatus(booking.status);
    } else {
      setEditingBooking(null);
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setPickupDate(new Date());
      setDropoffDate(new Date(Date.now() + 3600 * 1000 * 2)); // 2 hours later
      setPickupLocation("");
      setDropoffLocation("");
      setVehicleType("");
      setNotes("");
      setStatus("Pending");
    }
    setIsFormOpen(true);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!pickupDate || !dropoffDate) {
      alert("Please select pickup and dropoff dates."); // Replace with proper toast later
      return;
    }
    const newBooking: Booking = {
      id: editingBooking ? editingBooking.id : `B${String(Date.now()).slice(-4)}`,
      customerName, customerEmail, customerPhone,
      pickupDate, dropoffDate, pickupLocation, dropoffLocation,
      vehicleType, status, notes,
    };
    if (editingBooking) {
      setBookings(bookings.map(b => b.id === editingBooking.id ? newBooking : b));
    } else {
      setBookings([...bookings, newBooking]);
    }
    setIsFormOpen(false);
  };

  const handleDelete = (bookingId: string) => {
    setBookings(bookings.filter(b => b.id !== bookingId));
  };
  
  const handleUpdateStatus = (bookingId: string, newStatus: Booking["status"]) => {
     setBookings(bookings.map(b => b.id === bookingId ? {...b, status: newStatus} : b));
  };

  const bookingsForSelectedDate = selectedDate
    ? bookings.filter(
        (booking) =>
          new Date(booking.pickupDate).toDateString() === selectedDate.toDateString() ||
          new Date(booking.dropoffDate).toDateString() === selectedDate.toDateString()
      )
    : bookings;

  return (
    <>
      <PageHeader title="Booking Calendar & Management" description="View and manage all your agency bookings.">
        <Button onClick={() => handleOpenForm()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Booking
        </Button>
      </PageHeader>

      <Tabs defaultValue="month" className="mb-8">
        <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
          <TabsTrigger value="day">Day View</TabsTrigger>
          <TabsTrigger value="week">Week View</TabsTrigger>
          <TabsTrigger value="month">Month View</TabsTrigger>
        </TabsList>
        <TabsContent value="month">
          <Card>
            <CardContent className="p-0 md:p-4 flex flex-col lg:flex-row gap-4">
              <div className="mx-auto lg:mx-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border shadow-sm"
                  modifiers={{ booked: bookings.map(b => b.pickupDate) }}
                  modifiersStyles={{ booked: { border: "2px solid hsl(var(--primary))" } }}
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2 px-4 lg:px-0">
                  Bookings for: {selectedDate ? format(selectedDate, "PPP") : "All Dates"}
                </h3>
                {bookingsForSelectedDate.length > 0 ? (
                  <div className="max-h-[300px] overflow-y-auto">
                    <ul className="space-y-2 px-4 lg:px-0 pb-4">
                    {bookingsForSelectedDate.map(booking => (
                      <li key={booking.id} className="p-3 border rounded-md shadow-sm bg-card">
                        <p className="font-medium">{booking.customerName} - {booking.vehicleType}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(booking.pickupDate, "Pp")} to {format(booking.dropoffDate, "Pp")}
                        </p>
                        <Badge variant={booking.status === 'Confirmed' ? 'default' : booking.status === 'Pending' ? 'secondary' : 'destructive'} className="mt-1">
                          {booking.status}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                  </div>
                ) : (
                  <p className="text-muted-foreground px-4 lg:px-0 py-4">No bookings for this date.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="day">
          <Card>
            <CardHeader><CardTitle>Day View</CardTitle><CardDescription>Detailed schedule for the selected day. (Conceptual)</CardDescription></CardHeader>
            <CardContent><p className="text-muted-foreground">Day view not fully implemented. Showing all bookings for now.</p></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="week">
          <Card>
            <CardHeader><CardTitle>Week View</CardTitle><CardDescription>Overview of bookings for the selected week. (Conceptual)</CardDescription></CardHeader>
            <CardContent><p className="text-muted-foreground">Week view not fully implemented. Showing all bookings for now.</p></CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>A comprehensive list of all bookings.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Vehicle Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.customerName}</TableCell>
                  <TableCell>
                    {format(booking.pickupDate, "PPp")} - <br/> {format(booking.dropoffDate, "PPp")}
                  </TableCell>
                  <TableCell>{booking.vehicleType}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={booking.status === 'Confirmed' ? 'default' : booking.status === 'Pending' ? 'secondary' : 'destructive'}
                      className={
                        booking.status === 'Confirmed' ? 'bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30' :
                        booking.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30 hover:bg-yellow-500/30' :
                        booking.status === 'Denied' ? 'bg-red-500/20 text-red-700 border-red-500/30 hover:bg-red-500/30' : ''
                      }
                    >
                      {booking.status}
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
                        <DropdownMenuItem onClick={() => handleOpenForm(booking)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        {booking.status === "Pending" && (
                          <>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(booking.id, "Confirmed")} className="text-green-600 focus:text-green-600">
                              <CheckCircle className="mr-2 h-4 w-4" /> Confirm
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(booking.id, "Denied")} className="text-red-600 focus:text-red-600">
                              <XCircle className="mr-2 h-4 w-4" /> Deny
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => handleDelete(booking.id)}>
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingBooking ? "Edit Booking" : "Add New Booking"}</DialogTitle>
            <DialogDescription>
              {editingBooking ? "Update the details for this booking." : "Fill in the details for the new booking."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto p-1 pr-3">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="customerName" className="text-right">Customer Name</Label>
                <Input id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="customerEmail" className="text-right">Email</Label>
                <Input id="customerEmail" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="customerPhone" className="text-right">Phone</Label>
                <Input id="customerPhone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="col-span-3" required />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pickupDate" className="text-right">Pickup Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "col-span-3 justify-start text-left font-normal",
                        !pickupDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {pickupDate ? format(pickupDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={pickupDate} onSelect={setPickupDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dropoffDate" className="text-right">Dropoff Date</Label>
                 <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "col-span-3 justify-start text-left font-normal",
                        !dropoffDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dropoffDate ? format(dropoffDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={dropoffDate} onSelect={setDropoffDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pickupLocation" className="text-right">Pickup Location</Label>
                <Input id="pickupLocation" value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dropoffLocation" className="text-right">Dropoff Location</Label>
                <Input id="dropoffLocation" value={dropoffLocation} onChange={(e) => setDropoffLocation(e.target.value)} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="vehicleType" className="text-right">Vehicle Type</Label>
                <Input id="vehicleType" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className="col-span-3" placeholder="e.g., Sedan, SUV" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Status</Label>
                <Select value={status} onValueChange={(value: Booking["status"]) => setStatus(value)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                    <SelectItem value="Denied">Denied</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="notes" className="text-right pt-2">Notes</Label>
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="col-span-3" placeholder="Any special requests or information." />
              </div>
            </div>
            <DialogFooter className="sticky bottom-0 bg-background py-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button type="submit">{editingBooking ? "Save Changes" : "Create Booking"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
