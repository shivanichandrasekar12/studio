
"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Booking, Waypoint } from "@/types";
import { PlusCircle, MoreHorizontal, CheckCircle, XCircle, Edit, Trash2, Loader2, AlertCircle, Route, Timer } from "lucide-react";
import { useState, type FormEvent, useEffect } from "react";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBookings, addBooking, updateBooking, deleteBooking, updateBookingStatus } from "@/lib/services/bookingsService";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { auth } from "@/lib/firebase"; 
import type { User } from "firebase/auth"; 


export default function AgencyBookingsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser); 

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);


  const { data: bookings = [], isLoading: isLoadingBookings, error: bookingsError } = useQuery<Booking[], Error>({
    queryKey: ["bookings", currentUser?.uid], 
    queryFn: () => {
      if (!currentUser?.uid) return Promise.resolve([]);
      return getBookings(currentUser.uid);
    },
    enabled: !!currentUser?.uid,
  });

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
  const [formCustomerId, setFormCustomerId] = useState<string | undefined>(undefined);
  const [formWaypoints, setFormWaypoints] = useState<string[]>([]);
  const [formEstimatedDistance, setFormEstimatedDistance] = useState<string | undefined>("");
  const [formEstimatedDuration, setFormEstimatedDuration] = useState<string | undefined>("");


  const { mutate: addBookingMutation, isPending: isAddingBooking } = useMutation({
    mutationFn: addBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", currentUser?.uid] });
      queryClient.invalidateQueries({ queryKey: ["agencyBookingsDashboard", currentUser?.uid] });
      toast({ title: "Booking Added", description: "The new booking has been successfully created." });
      setIsFormOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: "Error Adding Booking", description: (error as Error).message, variant: "destructive" });
    },
  });

  const { mutate: updateBookingMutation, isPending: isUpdatingBooking } = useMutation({
    mutationFn: async (bookingData: { id: string; data: Partial<Omit<Booking, "id">>}) => updateBooking(bookingData.id, bookingData.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", currentUser?.uid] });
      queryClient.invalidateQueries({ queryKey: ["agencyBookingsDashboard", currentUser?.uid] });
      toast({ title: "Booking Updated", description: "The booking has been successfully updated." });
      setIsFormOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: "Error Updating Booking", description: (error as Error).message, variant: "destructive" });
    },
  });

  const { mutate: deleteBookingMutation } = useMutation({
    mutationFn: deleteBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", currentUser?.uid] });
      queryClient.invalidateQueries({ queryKey: ["agencyBookingsDashboard", currentUser?.uid] });
      toast({ title: "Booking Deleted", description: "The booking has been successfully deleted." });
    },
    onError: (error) => {
      toast({ title: "Error Deleting Booking", description: (error as Error).message, variant: "destructive" });
    },
  });
  
  const { mutate: updateStatusMutation } = useMutation({
    mutationFn: async (data: { id: string; status: Booking["status"]}) => updateBookingStatus(data.id, data.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", currentUser?.uid] });
      queryClient.invalidateQueries({ queryKey: ["agencyBookingsDashboard", currentUser?.uid] });
      toast({ title: "Booking Status Updated", description: "The booking status has been changed." });
    },
    onError: (error) => {
      toast({ title: "Error Updating Status", description: (error as Error).message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setEditingBooking(null);
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setPickupDate(new Date());
    setDropoffDate(new Date(Date.now() + 3600 * 1000 * 2));
    setPickupLocation("");
    setDropoffLocation("");
    setVehicleType("");
    setNotes("");
    setStatus("Pending");
    setFormCustomerId(undefined);
    setFormWaypoints([]);
    setFormEstimatedDistance("");
    setFormEstimatedDuration("");
  }

  const handleOpenForm = (booking?: Booking) => {
    if (booking) {
      setEditingBooking(booking);
      setCustomerName(booking.customerName);
      setCustomerEmail(booking.customerEmail);
      setCustomerPhone(booking.customerPhone);
      setPickupDate(booking.pickupDate ? new Date(booking.pickupDate) : undefined);
      setDropoffDate(booking.dropoffDate ? new Date(booking.dropoffDate) : undefined);
      setPickupLocation(booking.pickupLocation);
      setDropoffLocation(booking.dropoffLocation);
      setVehicleType(booking.vehicleType || "");
      setNotes(booking.notes || "");
      setStatus(booking.status);
      setFormCustomerId(booking.customerId);
      setFormWaypoints(booking.waypoints?.map(wp => wp.location) || []);
      setFormEstimatedDistance(booking.estimatedDistance || "");
      setFormEstimatedDuration(booking.estimatedDuration || "");
    } else {
      resetForm();
    }
    setIsFormOpen(true);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!pickupDate || !dropoffDate) {
      toast({ title: "Validation Error", description: "Please select pickup and dropoff dates.", variant: "destructive" });
      return;
    }
    if (!currentUser?.uid) {
      toast({ title: "Authentication Error", description: "Agency user not identified.", variant: "destructive" });
      return;
    }

    const waypointsToSave: Waypoint[] = formWaypoints.map(loc => ({ location: loc, stopover: true }));

    const bookingPayload: Omit<Booking, "id"> & { agencyId: string; customerId?: string } = {
      customerName, customerEmail, customerPhone,
      pickupDate, dropoffDate, pickupLocation, dropoffLocation,
      waypoints: waypointsToSave.length > 0 ? waypointsToSave : undefined,
      estimatedDistance: formEstimatedDistance || undefined,
      estimatedDuration: formEstimatedDuration || undefined,
      vehicleType, status, notes,
      agencyId: currentUser.uid, 
      customerId: formCustomerId, 
      passengers: 1, // Default or add a field for this
    };

    if (editingBooking) {
      const updatePayload = { ...bookingPayload };
      if (editingBooking.agencyId && !updatePayload.agencyId) {
        updatePayload.agencyId = editingBooking.agencyId;
      }
      updateBookingMutation({id: editingBooking.id, data: updatePayload});
    } else {
      addBookingMutation(bookingPayload);
    }
  };

  const handleDelete = (bookingId: string) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      deleteBookingMutation(bookingId);
    }
  };
  
  const handleUpdateStatus = (bookingId: string, newStatus: Booking["status"]) => {
     updateStatusMutation({ id: bookingId, status: newStatus });
  };

  const bookingsForSelectedDate = selectedDate && bookings
    ? bookings.filter(
        (booking) =>
          (booking.pickupDate && new Date(booking.pickupDate).toDateString() === selectedDate.toDateString()) ||
          (booking.dropoffDate && new Date(booking.dropoffDate).toDateString() === selectedDate.toDateString())
      )
    : bookings || [];

  const isMutating = isAddingBooking || isUpdatingBooking;

  const safeFormat = (date: Date | undefined | string, formatString: string) => {
    if (!date) return "N/A";
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return "Invalid Date";
      return format(d, formatString);
    } catch {
      return "Invalid Date";
    }
  }
  
  const bookedDatesModifier = bookings.reduce((acc, booking) => {
    if (booking.pickupDate) acc.push(new Date(booking.pickupDate));
    return acc;
  }, [] as Date[]);


  if (bookingsError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Fetching Bookings</AlertTitle>
        <AlertDescription>{(bookingsError as Error).message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <PageHeader title="Booking Calendar & Management" description="View and manage all your agency bookings.">
        <Button onClick={() => handleOpenForm()} disabled={isMutating}>
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
                  modifiers={{ booked: bookedDatesModifier }}
                  modifiersStyles={{ booked: { border: "2px solid hsl(var(--primary))" } }}
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2 px-4 lg:px-0">
                  Bookings for: {selectedDate ? format(selectedDate, "PPP") : "All Dates"}
                </h3>
                {isLoadingBookings ? (
                  <div className="space-y-2 px-4 lg:px-0 pb-4">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-md" />)}
                  </div>
                ) : bookingsForSelectedDate.length > 0 ? (
                  <div className="max-h-[300px] overflow-y-auto">
                    <ul className="space-y-2 px-4 lg:px-0 pb-4">
                    {bookingsForSelectedDate.map(booking => (
                      <li key={booking.id} className="p-3 border rounded-md shadow-sm bg-card">
                        <p className="font-medium">{booking.customerName} - {booking.vehicleType}</p>
                        <p className="text-sm text-muted-foreground">
                          {safeFormat(booking.pickupDate, "Pp")} to {safeFormat(booking.dropoffDate, "Pp")}
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
            <CardContent><p className="text-muted-foreground">Day view not fully implemented. Showing bookings for selected date for now.</p></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="week">
          <Card>
            <CardHeader><CardTitle>Week View</CardTitle><CardDescription>Overview of bookings for the selected week. (Conceptual)</CardDescription></CardHeader>
            <CardContent><p className="text-muted-foreground">Week view not fully implemented. Showing bookings for selected week for now.</p></CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>A comprehensive list of all bookings.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingBookings ? (
             <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Route Info</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
            </Table>
          ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Route Info</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.customerName}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {safeFormat(booking.pickupDate, "PPp")} - <br/> {safeFormat(booking.dropoffDate, "PPp")}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        {booking.pickupLocation} to {booking.dropoffLocation}
                        {booking.waypoints && booking.waypoints.length > 0 && (
                          <div className="text-muted-foreground">Stops: {booking.waypoints.map(wp => wp.location).join(', ')}</div>
                        )}
                        {booking.estimatedDistance && (
                           <span className="flex items-center text-muted-foreground"><Route className="mr-1 h-3 w-3"/> {booking.estimatedDistance}</span>
                        )}
                        {booking.estimatedDuration && (
                           <span className="flex items-center text-muted-foreground"><Timer className="mr-1 h-3 w-3"/> {booking.estimatedDuration}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{booking.vehicleType}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={booking.status === 'Confirmed' ? 'default' : booking.status === 'Pending' ? 'secondary' : 'destructive'}
                        className={
                          booking.status === 'Confirmed' ? 'bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30' :
                          booking.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30 hover:bg-yellow-500/30' :
                          booking.status === 'Denied' || booking.status === 'Cancelled' ? 'bg-red-500/20 text-red-700 border-red-500/30 hover:bg-red-500/30' : 
                          'bg-blue-500/20 text-blue-700 border-blue-500/30 hover:bg-blue-500/30' // Completed
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
                          {(booking.status === "Pending" || booking.status === "Denied") && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(booking.id, "Confirmed")} className="text-green-600 focus:text-green-600">
                                <CheckCircle className="mr-2 h-4 w-4" /> Confirm
                              </DropdownMenuItem>
                          )}
                          {booking.status === "Pending" && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(booking.id, "Denied")} className="text-red-600 focus:text-red-600">
                                <XCircle className="mr-2 h-4 w-4" /> Deny
                              </DropdownMenuItem>
                          )}
                           {booking.status === "Confirmed" && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(booking.id, "Completed")} className="text-blue-600 focus:text-blue-600">
                                <CheckCircle className="mr-2 h-4 w-4" /> Mark as Completed
                              </DropdownMenuItem>
                          )}
                           {(booking.status === "Confirmed" || booking.status === "Pending") && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(booking.id, "Cancelled")} className="text-orange-600 focus:text-orange-600">
                                <XCircle className="mr-2 h-4 w-4" /> Cancel Booking
                              </DropdownMenuItem>
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
          </div>
          )}
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
              {!editingBooking && ( 
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="formCustomerId" className="text-right">Customer ID (Opt)</Label>
                  <Input id="formCustomerId" value={formCustomerId || ""} onChange={(e) => setFormCustomerId(e.target.value)} className="col-span-3" placeholder="Existing Customer UID"/>
                </div>
              )}
              
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
                {/* Waypoints, Distance, Duration - for Agency manual entry/override */}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="formWaypoints" className="text-right">Stops (comma sep.)</Label>
                    <Input id="formWaypoints" value={formWaypoints.join(", ")} onChange={(e) => setFormWaypoints(e.target.value.split(",").map(s => s.trim()))} className="col-span-3" placeholder="Stop 1, Stop 2" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="formEstimatedDistance" className="text-right">Est. Distance</Label>
                    <Input id="formEstimatedDistance" value={formEstimatedDistance} onChange={(e) => setFormEstimatedDistance(e.target.value)} className="col-span-3" placeholder="e.g., 15 km" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="formEstimatedDuration" className="text-right">Est. Duration</Label>
                    <Input id="formEstimatedDuration" value={formEstimatedDuration} onChange={(e) => setFormEstimatedDuration(e.target.value)} className="col-span-3" placeholder="e.g., 30 mins" />
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
              <Button type="button" variant="outline" onClick={() => { setIsFormOpen(false); resetForm();}} disabled={isMutating}>Cancel</Button>
              <Button type="submit" disabled={isMutating}>
                {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingBooking ? "Save Changes" : "Create Booking"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
