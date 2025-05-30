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
import { Calendar as CalendarIcon, Clock, Users, MapPin, Car } from "lucide-react";
import React from "react"; // Required for useState

export default function BookNewRidePage() {
  const [pickupDate, setPickupDate] = React.useState<Date | undefined>();
  const [pickupTime, setPickupTime] = React.useState<string>("10:00");

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
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="pickupLocation" className="flex items-center"><MapPin className="mr-2 h-4 w-4 text-primary" />Pickup Location *</Label>
              <Input id="pickupLocation" placeholder="e.g., 123 Main St, Cityville" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dropoffLocation" className="flex items-center"><MapPin className="mr-2 h-4 w-4 text-primary" />Drop-off Location *</Label>
              <Input id="dropoffLocation" placeholder="e.g., Airport Terminal B" required />
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
            <div className="space-y-2">
              <Label htmlFor="pickupTime" className="flex items-center"><Clock className="mr-2 h-4 w-4 text-primary" />Pickup Time *</Label>
              <Input 
                id="pickupTime" 
                type="time" 
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="passengers" className="flex items-center"><Users className="mr-2 h-4 w-4 text-primary" />Number of Passengers *</Label>
              <Input id="passengers" type="number" placeholder="e.g., 2" min="1" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleType" className="flex items-center"><Car className="mr-2 h-4 w-4 text-primary" />Desired Vehicle Type (Optional)</Label>
              <Input id="vehicleType" placeholder="e.g., Sedan, SUV" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea id="notes" placeholder="Any special requests or information (e.g., flight number, luggage details)..." />
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full md:w-auto">
              Request Ride
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Your request will be sent to available agencies. You'll be notified once an agency confirms your ride.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
