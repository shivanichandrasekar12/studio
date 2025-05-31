"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { suggestVehicleAllocation, type VehicleAllocationInput, type VehicleAllocationOutput } from "@/ai/flows/vehicle-allocation-suggestions";
import { useState, type FormEvent } from "react";
import { Wand2, Loader2, Lightbulb, BarChart3 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AiVehicleAllocationPage() {
  const [bookingDetails, setBookingDetails] = useState("Couple, 2 passengers, weekend trip, 2 large bags, airport pickup to city hotel.");
  const [vehicleAvailability, setVehicleAvailability] = useState("Sedan (Toyota Camry, 4 passengers, 2 bags), SUV (Honda CR-V, 5 passengers, 4 bags), Van (Ford Transit, 10 passengers, 8 bags). Sedan XYZ-123 is booked for maintenance.");
  const [historicalData, setHistoricalData] = useState("Couples usually prefer sedans or compact SUVs. Weekend trips often have more luggage. Airport pickups require timely service.");
  
  const [suggestion, setSuggestion] = useState<VehicleAllocationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuggestion(null);

    const input: VehicleAllocationInput = {
      bookingDetails,
      vehicleAvailability,
      historicalData,
    };

    try {
      const result = await suggestVehicleAllocation(input);
      setSuggestion(result);
    } catch (e) {
      console.error(e);
      setError("Failed to get vehicle allocation suggestion. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="AI Vehicle Allocation Assistant"
        description="Get smart suggestions for assigning vehicles to bookings based on current data."
      />

      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wand2 className="mr-2 h-5 w-5 text-primary" /> Input Details
            </CardTitle>
            <CardDescription>
              Provide the necessary information for the AI to generate a vehicle suggestion.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bookingDetails">Booking Details</Label>
                <Textarea
                  id="bookingDetails"
                  value={bookingDetails}
                  onChange={(e) => setBookingDetails(e.target.value)}
                  placeholder="e.g., Dates, times, passenger count, luggage, special requests..."
                  className="min-h-[100px]"
                  required
                />
              </div>
              <div>
                <Label htmlFor="vehicleAvailability">Vehicle Availability</Label>
                <Textarea
                  id="vehicleAvailability"
                  value={vehicleAvailability}
                  onChange={(e) => setVehicleAvailability(e.target.value)}
                  placeholder="e.g., Available vehicle types, capacities, current status..."
                  className="min-h-[100px]"
                  required
                />
              </div>
              <div>
                <Label htmlFor="historicalData">Historical Data / Preferences</Label>
                <Textarea
                  id="historicalData"
                  value={historicalData}
                  onChange={(e) => setHistoricalData(e.target.value)}
                  placeholder="e.g., Past booking patterns, common vehicle choices for similar trips..."
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Getting Suggestion...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Get AI Suggestion
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading && (
             <Card className="flex flex-col items-center justify-center min-h-[200px]">
                <CardContent className="text-center p-6">
                    <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">Generating suggestion...</p>
                    <p className="text-sm text-muted-foreground">The AI is analyzing the data. This might take a moment.</p>
                </CardContent>
            </Card>
          )}

          {suggestion && !isLoading && (
            <Card className="shadow-lg border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center text-primary">
                  <Lightbulb className="mr-2 h-6 w-6" /> AI Suggestion Result
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground">Suggested Vehicle</h3>
                  <p className="text-lg font-bold">{suggestion.suggestedVehicle}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground">Reasoning</h3>
                  <p className="text-base">{suggestion.reasoning}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground flex items-center">
                     <BarChart3 className="mr-1 h-4 w-4" /> Confidence Level
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div 
                        className="bg-primary h-2.5 rounded-full" 
                        style={{ width: `${suggestion.confidenceLevel * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-base font-semibold text-primary">
                        {(suggestion.confidenceLevel * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-xs text-muted-foreground">
                  This suggestion is AI-generated. Please review carefully before confirming any allocation.
                </p>
              </CardFooter>
            </Card>
          )}

          {!isLoading && !suggestion && !error && (
            <Card className="flex flex-col items-center justify-center min-h-[200px] border-dashed">
                <CardContent className="text-center p-6">
                    <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">Your AI suggestion will appear here.</p>
                    <p className="text-sm text-muted-foreground">Fill in the details and click "Get AI Suggestion".</p>
                </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
