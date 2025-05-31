
"use client";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Users, MapPin, Car, Loader2, AlertCircle } from "lucide-react";
import React, { useState, type FormEvent, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addBooking } from "@/lib/services/bookingsService";
import { auth } from "@/lib/firebase";
import type { Booking } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function BookNewRidePage() {
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(auth.currentUser);

  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [pickupDate, setPickupDate] = useState<Date | undefined>(new Date());
  const [pickupTime, setPickupTime] = useState<string>("10:00"); // Stored as string, combine with date before saving
  const [passengers, setPassengers] = useState<string>("1");
  const [vehicleType, setVehicleType] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const { mutate: addBookingMutation, isPending: isAddingBooking } = useMutation({
    mutationFn: addBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customerBookings", currentUser?.uid] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] }); // Invalidate general bookings too
      toast({
        title: "Ride Request Submitted!",
        description: "Your request has been sent. Redirecting to My Bookings...",
      });
      router.push("/customer/dashboard/my-bookings");
    },
    onError: (error) => {
      console.error("Booking submission error:", error);
      setFormError("Failed to submit your booking request. Please try again.");
      toast({
        title: "Submission Failed",
        description: error.message || "Could not submit your booking request.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!currentUser) {
      setFormError("You must be logged in to make a booking.");
      toast({ title: "Not Logged In", description: "Please log in to book a ride.", variant: "destructive" });
      return;
    }
    if (!pickupDate) {
      setFormError("Please select a pickup date.");
      toast({ title: "Missing Information", description: "Please select a pickup date.", variant: "destructive" });
      return;
    }
    if (!pickupTime) {
        setFormError("Please select a pickup time.");
        toast({ title: "Missing Information", description: "Please select a pickup time.", variant: "destructive" });
        return;
    }

    // Combine date and time
    const [hours, minutes] = pickupTime.split(':').map(Number);
    const fullPickupDate = new Date(pickupDate);
    fullPickupDate.setHours(hours, minutes, 0, 0);

    // For dropoffDate, let's assume it's the same day for now or set a sensible default
    // A more complex app might have a separate dropoff date/time picker
    const fullDropoffDate = new Date(fullPickupDate); 
    fullDropoffDate.setHours(fullPickupDate.getHours() + 1); // Example: 1 hour later

    const bookingData: Omit<Booking, "id" | "customerName" | "customerEmail" | "customerPhone"> & { customerId: string } = {
      pickupLocation,
      dropoffLocation,
      pickupDate: fullPickupDate,
      dropoffDate: fullDropoffDate, 
      passengers: parseInt(passengers, 10) || 1,
      vehicleType: vehicleType || "Any",
      notes,
      status: "Pending",
      customerId: currentUser.uid,
      // customerName, customerEmail, customerPhone will be denormalized or joined later
    };

    addBookingMutation(bookingData);
  };

  if (!currentUser && !auth.currentUser) { // Check auth.currentUser for initial load
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading user data...</p>
      </div>
    );
  }


  return (
    <>
      <PageHeader
        title="Book a New Ride"
        description="Fill in the details below to schedule your next trip with NomadX."
      />
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">New Booking Form</CardTitle>
          <CardDescription>
            Please provide your travel details. All fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {formError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="pickupLocation" className="flex items-center"><MapPin className="mr-2 h-4 w-4 text-primary" />Pickup Location *</Label>
                <Input 
                  id="pickupLocation" 
                  placeholder="e.g., 123 Main St, Cityville" 
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  required 
                  disabled={isAddingBooking}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dropoffLocation" className="flex items-center"><MapPin className="mr-2 h-4 w-4 text-primary" />Drop-off Location *</Label>
                <Input 
                  id="dropoffLocation" 
                  placeholder="e.g., Airport Terminal B" 
                  value={dropoffLocation}
                  onChange={(e) => setDropoffLocation(e.target.value)}
                  required 
                  disabled={isAddingBooking}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="pickupDate" className="flex items-center"><CalendarIcon className="mr-2 h-4 w-4 text-primary" />Pickup Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !pickupDate && "text-muted-foreground"
                      )}
                      disabled={isAddingBooking}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {pickupDate ? format(pickupDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar 
                        mode="single" 
                        selected={pickupDate} 
                        onSelect={setPickupDate} 
                        initialFocus 
                        disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pickupTime" className="flex items-center"><Clock className="mr-2 h-4 w-4 text-primary" />Pickup Time *</Label>
                <Input 
                  id="pickupTime" 
                  type="time" 
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  required 
                  disabled={isAddingBooking}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="passengers" className="flex items-center"><Users className="mr-2 h-4 w-4 text-primary" />Number of Passengers *</Label>
                <Input 
                  id="passengers" 
                  type="number" 
                  placeholder="e.g., 2" 
                  min="1" 
                  value={passengers}
                  onChange={(e) => setPassengers(e.target.value)}
                  required 
                  disabled={isAddingBooking}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicleType" className="flex items-center"><Car className="mr-2 h-4 w-4 text-primary" />Desired Vehicle Type (Optional)</Label>
                <Input 
                  id="vehicleType" 
                  placeholder="e.g., Sedan, SUV" 
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  disabled={isAddingBooking}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea 
                id="notes" 
                placeholder="Any special requests or information (e.g., flight number, luggage details)..." 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isAddingBooking}
              />
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full md:w-auto" disabled={isAddingBooking || !currentUser}>
                {isAddingBooking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Request Ride
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Your request will be saved and marked as pending. Agencies will be able to view and confirm your ride.
              </p>
            </div>
          </CardContent>
        </form>
      </Card>
    </>
  );
}
