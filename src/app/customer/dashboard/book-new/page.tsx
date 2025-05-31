
"use client";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Users, MapPin, Car, Loader2, AlertCircle, Route, Timer, PlusCircle, MinusCircle } from "lucide-react";
import React, { useState, type FormEvent, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addBooking } from "@/lib/services/bookingsService";
import { auth } from "@/lib/firebase";
import type { Booking, Waypoint } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useJsApiLoader, DirectionsService } from "@react-google-maps/api";

const libraries: ("places" | "directions")[] = ["places", "directions"];

export default function BookNewRidePage() {
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(auth.currentUser);

  const [pickupLocation, setPickupLocation] = useState("Eiffel Tower, Paris, France");
  const [dropoffLocation, setDropoffLocation] = useState("Louvre Museum, Paris, France");
  const [waypointsInputs, setWaypointsInputs] = useState<string[]>([""]); // Store waypoint addresses as strings
  const [pickupDate, setPickupDate] = useState<Date | undefined>(new Date());
  const [pickupTime, setPickupTime] = useState<string>("10:00");
  const [passengers, setPassengers] = useState<string>("1");
  const [vehicleType, setVehicleType] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = useState<string | null>(null);
  const [duration, setDuration] = useState<string | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

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
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
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
        description: (error as Error).message || "Could not submit your booking request.",
        variant: "destructive",
      });
    },
  });

  const handleWaypointChange = (index: number, value: string) => {
    const newWaypoints = [...waypointsInputs];
    newWaypoints[index] = value;
    setWaypointsInputs(newWaypoints);
  };

  const addWaypointField = () => {
    setWaypointsInputs([...waypointsInputs, ""]);
  };

  const removeWaypointField = (index: number) => {
    const newWaypoints = waypointsInputs.filter((_, i) => i !== index);
    setWaypointsInputs(newWaypoints);
  };
  
  const calculateRoute = useCallback(async () => {
    if (!isLoaded) {
      setFormError("Google Maps script not loaded yet. Please wait.");
      return;
    }
    if (!pickupLocation || !dropoffLocation) {
      setFormError("Please enter both pickup and dropoff locations.");
      return;
    }

    setIsCalculatingRoute(true);
    setDistance(null);
    setDuration(null);
    setDirectionsResponse(null);
    setFormError(null);

    const directionsService = new window.google.maps.DirectionsService();
    const activeWaypoints: google.maps.DirectionsWaypoint[] = waypointsInputs
      .map(loc => loc.trim())
      .filter(loc => loc !== "")
      .map(loc => ({ location: loc, stopover: true }));

    try {
      const results = await directionsService.route({
        origin: pickupLocation,
        destination: dropoffLocation,
        waypoints: activeWaypoints,
        travelMode: window.google.maps.TravelMode.DRIVING,
      });
      setDirectionsResponse(results);
      if (results.routes && results.routes.length > 0 && results.routes[0].legs && results.routes[0].legs.length > 0) {
        let totalDistance = 0;
        let totalDuration = 0;
        results.routes[0].legs.forEach(leg => {
            totalDistance += leg.distance?.value || 0;
            totalDuration += leg.duration?.value || 0;
        });
        setDistance((totalDistance / 1000).toFixed(1) + " km"); // Convert meters to km
        setDuration(Math.ceil(totalDuration / 60) + " mins"); // Convert seconds to minutes
      } else {
         setFormError("Could not calculate route. Check locations.");
      }
    } catch (e: any) {
      console.error("Directions request failed", e);
      setFormError(`Route calculation failed: ${e.message || 'Unknown error'}`);
    } finally {
      setIsCalculatingRoute(false);
    }
  }, [isLoaded, pickupLocation, dropoffLocation, waypointsInputs]);


  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!currentUser) {
      setFormError("You must be logged in to make a booking.");
      toast({ title: "Not Logged In", description: "Please log in to book a ride.", variant: "destructive" });
      return;
    }
    if (!pickupDate || !pickupTime) {
      setFormError("Please select a pickup date and time.");
      toast({ title: "Missing Information", description: "Please select a pickup date and time.", variant: "destructive" });
      return;
    }
     if (!distance || !duration) {
      setFormError("Please calculate the route first to get distance and duration estimates.");
      toast({ title: "Route Not Calculated", description: "Click 'Calculate Route' before submitting.", variant: "destructive" });
      return;
    }

    const [hours, minutes] = pickupTime.split(':').map(Number);
    const fullPickupDate = new Date(pickupDate);
    fullPickupDate.setHours(hours, minutes, 0, 0);

    const fullDropoffDate = new Date(fullPickupDate);
    // Approximate dropoff time based on calculated duration
    const durationMinutes = parseInt(duration.replace(' mins', ''), 10);
    if (!isNaN(durationMinutes)) {
        fullDropoffDate.setMinutes(fullPickupDate.getMinutes() + durationMinutes);
    } else {
        fullDropoffDate.setHours(fullPickupDate.getHours() + 1); // Fallback to 1 hour
    }
    
    const finalWaypoints: Waypoint[] = waypointsInputs
        .map(loc => loc.trim())
        .filter(loc => loc !== "")
        .map(loc => ({ location: loc, stopover: true }));

    const bookingData: Omit<Booking, "id" | "customerName" | "customerEmail" | "customerPhone"> & { customerId: string } = {
      pickupLocation,
      dropoffLocation,
      waypoints: finalWaypoints.length > 0 ? finalWaypoints : undefined,
      estimatedDistance: distance,
      estimatedDuration: duration,
      pickupDate: fullPickupDate,
      dropoffDate: fullDropoffDate, 
      passengers: parseInt(passengers, 10) || 1,
      vehicleType: vehicleType || "Any",
      notes,
      status: "Pending",
      customerId: currentUser.uid,
    };

    addBookingMutation(bookingData);
  };

  if (!currentUser && !auth.currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading user data...</p>
      </div>
    );
  }
  
  if (loadError) {
    return (
         <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Map Error</AlertTitle>
            <AlertDescription>Could not load Google Maps. Please check your API key and internet connection. {loadError.message}</AlertDescription>
        </Alert>
    )
  }


  return (
    <>
      <PageHeader
        title="Book a New Ride"
        description="Plan your route, add stops, and get an estimated distance and time for your trip."
      />
      <Card className="max-w-3xl mx-auto shadow-lg">
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
                  disabled={isAddingBooking || isCalculatingRoute}
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
                  disabled={isAddingBooking || isCalculatingRoute}
                />
              </div>
            </div>

            <div className="space-y-4">
                <Label className="flex items-center"><Route className="mr-2 h-4 w-4 text-primary" />Stops (Optional)</Label>
                {waypointsInputs.map((waypoint, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <Input
                            type="text"
                            placeholder={`Stop ${index + 1} address`}
                            value={waypoint}
                            onChange={(e) => handleWaypointChange(index, e.target.value)}
                            disabled={isAddingBooking || isCalculatingRoute}
                            className="flex-grow"
                        />
                        {waypointsInputs.length > 1 && (
                             <Button type="button" variant="ghost" size="icon" onClick={() => removeWaypointField(index)} disabled={isAddingBooking || isCalculatingRoute} aria-label="Remove stop">
                                <MinusCircle className="h-5 w-5 text-destructive" />
                            </Button>
                        )}
                         {index === waypointsInputs.length - 1 && (
                             <Button type="button" variant="ghost" size="icon" onClick={addWaypointField} disabled={isAddingBooking || isCalculatingRoute || waypointsInputs.length >= 5} aria-label="Add stop"> {/* Limit stops e.g. to 5 */}
                                <PlusCircle className="h-5 w-5 text-primary" />
                            </Button>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex justify-center my-4">
                 <Button type="button" onClick={calculateRoute} disabled={!isLoaded || isCalculatingRoute || isAddingBooking || !pickupLocation || !dropoffLocation}>
                    {isCalculatingRoute ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Route className="mr-2 h-4 w-4" />}
                    Calculate Route & Estimate
                </Button>
            </div>
            
            {(distance || duration) && (
                <Card className="bg-muted/50 p-4">
                    <CardHeader className="p-2 pb-1">
                        <CardTitle className="text-lg flex items-center"><Timer className="mr-2 h-5 w-5 text-primary"/>Route Estimate</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2 space-y-1 text-sm">
                        {distance && <p><strong>Distance:</strong> {distance}</p>}
                        {duration && <p><strong>Estimated Duration:</strong> {duration}</p>}
                        <p className="text-xs text-muted-foreground">This is an estimate and may vary based on traffic and other conditions.</p>
                    </CardContent>
                </Card>
            )}


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
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
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-2 pt-4">
              <Button type="submit" className="w-full md:w-auto" disabled={isAddingBooking || !currentUser || !isLoaded || !distance || !duration}>
                {isAddingBooking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Request Ride
              </Button>
              {!isLoaded && <p className="text-xs text-amber-600">Google Maps is loading. Please wait to calculate route and submit.</p>}
               {isLoaded && (!distance || !duration) && <p className="text-xs text-amber-600">Please calculate the route to enable ride request submission.</p>}
              <p className="text-xs text-muted-foreground mt-1">
                Your request will be saved and marked as pending. Agencies will be able to view and confirm your ride.
              </p>
          </CardFooter>
        </form>
      </Card>
    </>
  );
}
