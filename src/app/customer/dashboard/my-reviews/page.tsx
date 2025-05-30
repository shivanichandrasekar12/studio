
"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MessageSquareText, Edit3 } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { Review } from "@/types";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// Mock data for reviews submitted by the customer
const mockCustomerSubmittedReviews: Review[] = [
  { id: "CSR001", customerName: "Current User", rating: 5, title: "Excellent Ride!", comment: "The trip to the airport was smooth and the driver was very professional. Highly recommend!", createdAt: new Date(Date.now() - 86400000 * 3), reviewType: "customer", bookingId: "CB001", avatarUrl: "https://placehold.co/40x40.png?text=CU" },
  { id: "CSR002", customerName: "Current User", rating: 4, comment: "Good service, but the AC could have been cooler.", createdAt: new Date(Date.now() - 86400000 * 15), reviewType: "customer", bookingId: "CB_OLD_002", avatarUrl: "https://placehold.co/40x40.png?text=CU" },
];

// Mock data for past bookings that customer can review (simplified)
const mockPastBookingsToReview = [
    { id: "CB004", description: "Trip to Seaside Resort on " + format(new Date(Date.now() - 86400000 * 5), "PP") },
    { id: "CB005", description: "Airport Transfer on " + format(new Date(Date.now() - 86400000 * 20), "PP") },
    { id: "CB001", description: "Trip to City Airport on " + format(new Date(Date.now() - 86400000 * 2), "PP") }, // Already reviewed example
];


export default function MyReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(mockCustomerSubmittedReviews);
  const [showReviewFormForBookingId, setShowReviewFormForBookingId] = useState<string | null>(null);
  const [formRating, setFormRating] = useState(0);
  const [formComment, setFormComment] = useState("");
  const { toast } = useToast();

  const handleStarClick = (newRating: number) => {
    setFormRating(newRating);
  };

  const handleOpenReviewForm = (bookingId: string) => {
    setShowReviewFormForBookingId(bookingId);
    setFormRating(0);
    setFormComment("");
  };

  const handleCloseReviewForm = () => {
    setShowReviewFormForBookingId(null);
  }

  const handleSubmitReview = (event: FormEvent, bookingId: string) => {
    event.preventDefault();
    if (formRating === 0) {
        toast({ title: "Rating Required", description: "Please select a star rating.", variant: "destructive" });
        return;
    }
    const newReview: Review = {
      id: `CSR_NEW_${Date.now()}`,
      customerName: "Current User", 
      rating: formRating,
      comment: formComment,
      createdAt: new Date(),
      reviewType: "customer",
      bookingId: bookingId,
      avatarUrl: "https://placehold.co/40x40.png?text=CU",
      title: `Review for booking ${bookingId}`
    };
    setReviews([newReview, ...reviews]);
    toast({ title: "Review Submitted", description: "Thank you for your feedback!" });
    handleCloseReviewForm();
  };

  return (
    <>
      <PageHeader
        title="My Reviews"
        description="View your submitted reviews and rate past experiences."
      />

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center"><Edit3 className="mr-2 h-5 w-5 text-primary"/>Rate Your Past Trips</CardTitle>
          <CardDescription>Share your feedback on recent bookings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {mockPastBookingsToReview.filter(b => !reviews.some(r => r.bookingId === b.id)).length === 0 && !showReviewFormForBookingId && (
                <p className="text-muted-foreground text-sm">No recent trips awaiting review, or you've reviewed them all!</p>
            )}
            {mockPastBookingsToReview.map((booking) => {
                if (reviews.some(r => r.bookingId === booking.id) && showReviewFormForBookingId !== booking.id) return null;

                return (
                <div key={booking.id} className="p-4 border rounded-md">
                  {showReviewFormForBookingId === booking.id ? (
                    <form onSubmit={(e) => handleSubmitReview(e, booking.id)}>
                      <h3 className="font-medium mb-1">Reviewing: {booking.description}</h3>
                      <div className="mb-3">
                        <Label className="mb-1 block">Your Rating *</Label>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                "h-7 w-7 cursor-pointer transition-colors",
                                formRating >= star ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground hover:text-yellow-300"
                              )}
                              onClick={() => handleStarClick(star)}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="mb-3">
                        <Label htmlFor={`comment-${booking.id}`} className="mb-1 block">Your Comments *</Label>
                        <Textarea
                          id={`comment-${booking.id}`}
                          value={formComment}
                          onChange={(e) => setFormComment(e.target.value)}
                          placeholder="Share your experience..."
                          className="min-h-[100px]"
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit">Submit Review</Button>
                        <Button type="button" variant="outline" onClick={handleCloseReviewForm}>Cancel</Button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex justify-between items-center">
                        <p>{booking.description}</p>
                        <Button onClick={() => handleOpenReviewForm(booking.id)} size="sm" variant="outline" disabled={reviews.some(r => r.bookingId === booking.id)}>
                            <Edit3 className="mr-2 h-4 w-4" /> {reviews.some(r => r.bookingId === booking.id) ? "Reviewed" : "Write a Review"}
                        </Button>
                    </div>
                  )}
                </div>
              )}
            )}
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><MessageSquareText className="mr-2 h-5 w-5 text-primary"/>My Submitted Reviews</CardTitle>
          <CardDescription>A log of all feedback you've provided.</CardDescription>
        </CardHeader>
        <CardContent>
          {reviews.length > 0 ? (
            <ScrollArea className="h-[calc(100vh-35rem)] pr-3">
              <div className="space-y-6">
                {reviews.map((review) => (
                  <Card key={review.id} className="p-4 shadow-sm">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-10 w-10 border">
                        <AvatarImage src={review.avatarUrl || `https://placehold.co/40x40.png?text=CU`} alt={review.customerName} data-ai-hint="user avatar"/>
                        <AvatarFallback>{review.customerName.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                           <h4 className="text-sm font-semibold">{review.title || "Review for " + mockPastBookingsToReview.find(b => b.id === review.bookingId)?.description || `Booking ID: ${review.bookingId}`}</h4>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "h-5 w-5",
                                  review.rating > i ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
                                )}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : (
             <div className="text-center text-muted-foreground py-8">
              <MessageSquareText className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg font-medium">No reviews submitted yet.</p>
              <p className="text-sm">Share your feedback on past trips to help us improve!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

    