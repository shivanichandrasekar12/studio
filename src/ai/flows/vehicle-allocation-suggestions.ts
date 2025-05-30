// Implemented AI-driven vehicle allocation suggestions using Genkit, optimizing fleet management and resource utilization.

'use server';

/**
 * @fileOverview AI-driven vehicle allocation suggestions based on booking details and vehicle availability.
 *
 * - suggestVehicleAllocation - A function that provides vehicle allocation suggestions.
 * - VehicleAllocationInput - The input type for the suggestVehicleAllocation function.
 * - VehicleAllocationOutput - The return type for the suggestVehicleAllocation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VehicleAllocationInputSchema = z.object({
  bookingDetails: z
    .string()
    .describe('Details of the booking, including dates, times, and passenger count.'),
  vehicleAvailability: z
    .string()
    .describe('Information about available vehicles, including type and capacity.'),
  historicalData: z
    .string()
    .describe('Historical booking data to help optimize vehicle allocation.'),
});
export type VehicleAllocationInput = z.infer<typeof VehicleAllocationInputSchema>;

const VehicleAllocationOutputSchema = z.object({
  suggestedVehicle: z
    .string()
    .describe('The suggested vehicle for the booking, based on availability and suitability.'),
  reasoning: z
    .string()
    .describe('The reasoning behind the vehicle suggestion, considering booking details and vehicle capacity.'),
  confidenceLevel: z
    .number()
    .describe('A numerical value (0-1) indicating the confidence level in the vehicle allocation suggestion.'),
});
export type VehicleAllocationOutput = z.infer<typeof VehicleAllocationOutputSchema>;

export async function suggestVehicleAllocation(
  input: VehicleAllocationInput
): Promise<VehicleAllocationOutput> {
  return vehicleAllocationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'vehicleAllocationPrompt',
  input: {schema: VehicleAllocationInputSchema},
  output: {schema: VehicleAllocationOutputSchema},
  prompt: `You are an expert vehicle allocation specialist for a travel agency.

Given the following booking details, vehicle availability, and historical data, provide a vehicle allocation suggestion.

Booking Details: {{{bookingDetails}}}
Vehicle Availability: {{{vehicleAvailability}}}
Historical Data: {{{historicalData}}}

Consider all factors to provide the most efficient and suitable vehicle suggestion.

Output in the format:
Suggested Vehicle: [Vehicle Type]
Reasoning: [Explanation of why this vehicle is suitable]
Confidence Level: [A numerical value between 0 and 1 indicating the confidence in the suggestion]`,
});

const vehicleAllocationFlow = ai.defineFlow(
  {
    name: 'vehicleAllocationFlow',
    inputSchema: VehicleAllocationInputSchema,
    outputSchema: VehicleAllocationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
