
"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MessageSquareText, Edit3, Loader2, AlertCircle } from "lucide-react";
import React, { useState, type FormEvent, useEffect, useMemo } from "react";
import type { Review, Booking } from "@/types";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCustomerSubmittedReviews, addCustomerSubmittedReview } from "@/lib/services/reviewsService";
import { getCustomerBookings } from "@/lib/services/bookingsService";
import { auth } from "@/lib/firebase";
import type { User } from "firebase/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function MyReviewsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);

  const [showReviewFormForBookingId, setShowReviewFormForBookingId] = useState<string | null>(null);
  const [formRating, setFormRating] = useState(0);
  const [formComment, setFormComment] = useState("");
  const [formTitle, setFormTitle] = useState("");


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const customerId = currentUser?.uid;

  const { data: submittedReviews = [], isLoading: isLoadingSubmittedReviews, error: submittedReviewsError } = useQuery<Review[], Error>({
    queryKey: ["customerSubmittedReviews", customerId],
    queryFn: () => {
      if (!customerId) return Promise.resolve([]);
      return getCustomerSubmittedReviews(customerId);
    },
    enabled: !!customerId,
  });

  const { data: customerBookings = [], isLoading: isLoadingBookings, error: bookingsError } = useQuery<Booking[], Error>({
    queryKey: ["customerBookingsForReview", customerId], // Distinct query key
    queryFn: () => {
      if (!customerId) return Promise.resolve([]);
      return getCustomerBookings(customerId);
    },
    enabled: !!customerId,
  });

  const bookingsToReview = useMemo(() => {
    return customerBookings
      .filter(booking => booking.status === "Completed" && !submittedReviews.some(review => review.bookingId === booking.id))
      .sort((a,b) => new Date(b.dropoffDate).getTime() - new Date(a.dropoffDate).getTime()); // Show most recent completed first
  }, [customerBookings, submittedReviews]);


  const { mutate: submitReviewMutation, isPending: isSubmittingReview } = useMutation({
    mutationFn: (payload: { bookingId: string; rating: number; comment: string; title?: string}) => {
        if (!currentUser) throw new Error("User not authenticated.");
        return addCustomerSubmittedReview(payload, currentUser);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customerSubmittedReviews", customerId] });
      queryClient.invalidateQueries({ queryKey: ["customerBookingsForReview", customerId] }); // To refresh bookingsToReview list potentially
      toast({ title: "Review Submitted", description: "Thank you for your feedback!" });
      handleCloseReviewForm();
    },
    onError: (error: any) => {
      toast({ title: "Submission Failed", description: error.message || "Could not submit your review.", variant: "destructive" });
    },
  });


  const handleStarClick = (newRating: number) => {
    setFormRating(newRating);
  };

  const handleOpenReviewForm = (bookingId: string) => {
    setShowReviewFormForBookingId(bookingId);
    setFormRating(0);
    setFormComment("");
    setFormTitle("");
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
    if (!formComment.trim()) {
        toast({ title: "Comment Required", description: "Please write a comment.", variant: "destructive" });
        return;
    }
    submitReviewMutation({ bookingId, rating: formRating, comment: formComment, title: formTitle });
  };
  
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

  if (!currentUser && !auth.currentUser) { // More robust initial check
     return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading user data...</p>
      </div>
    );
  }

  const pageError = submittedReviewsError || bookingsError;

  return (
    <>
      <PageHeader
        title="My Reviews"
        description="View your submitted reviews and rate past experiences."
      />

      {pageError && (
        <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Data</AlertTitle>
            <AlertDescription>{pageError.message || "Could not load review data. Please try again later."}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center"><Edit3 className="mr-2 h-5 w-5 text-primary"/>Rate Your Past Trips</CardTitle>
          <CardDescription>Share your feedback on recent completed bookings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {isLoadingBookings || isLoadingSubmittedReviews ? (
                [...Array(2)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-md"/>)
            ) : bookingsToReview.length === 0 && !showReviewFormForBookingId ? (
                <p className="text-muted-foreground text-sm py-4 text-center">No recent trips awaiting review, or you've reviewed them all!</p>
            ) : (
                bookingsToReview.map((booking) => (
                <div key={booking.id} className="p-4 border rounded-md shadow-sm">
                  {showReviewFormForBookingId === booking.id ? (
                    <form onSubmit={(e) => handleSubmitReview(e, booking.id)}>
                      <h3 className="font-medium mb-1 text-md">Reviewing: Trip to {booking.dropoffLocation} on {safeFormat(booking.pickupDate, "PP")}</h3>
                      <div className="my-3">
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
                        <Label htmlFor={`title-${booking.id}`} className="mb-1 block">Review Title (Optional)</Label>
                        <input id={`title-${booking.id}`} value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="e.g. Great Service!" className="w-full p-2 border rounded-md"/>
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
                      <div className="flex gap-2 mt-4">
                        <Button type="submit" disabled={isSubmittingReview}>
                            {isSubmittingReview && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Review
                        </Button>
                        <Button type="button" variant="outline" onClick={handleCloseReviewForm} disabled={isSubmittingReview}>Cancel</Button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-medium">Trip to {booking.dropoffLocation}</p>
                            <p className="text-sm text-muted-foreground">Completed on {safeFormat(booking.dropoffDate, "PPp")}</p>
                        </div>
                        <Button onClick={() => handleOpenReviewForm(booking.id)} size="sm" variant="outline" className="whitespace-nowrap">
                            <Edit3 className="mr-2 h-4 w-4" /> Write a Review
                        </Button>
                    </div>
                  )}
                </div>
              ))
            )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><MessageSquareText className="mr-2 h-5 w-5 text-primary"/>My Submitted Reviews</CardTitle>
          <CardDescription>A log of all feedback you've provided.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingSubmittedReviews ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <Card key={i} className="p-4 shadow-sm">
                  <div className="flex items-start space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : submittedReviews.length === 0 ? (
             <div className="text-center text-muted-foreground py-8">
              <MessageSquareText className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg font-medium">No reviews submitted yet.</p>
              <p className="text-sm">Share your feedback on past trips to help us improve!</p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-35rem)] pr-3"> {/* Adjust height as needed */}
              <div className="space-y-6">
                {submittedReviews.map((review) => (
                  <Card key={review.id} className="p-4 shadow-sm">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-10 w-10 border">
                        <AvatarImage src={review.avatarUrl || `https://placehold.co/40x40.png?text=CU`} alt={review.customerName} data-ai-hint="user avatar"/>
                        <AvatarFallback>{review.customerName?.substring(0, 2).toUpperCase() || "CU"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                           <h4 className="text-md font-semibold">{review.title || `Review for Booking ${review.bookingId || 'N/A'}`}</h4>
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
                          {review.createdAt ? formatDistanceToNow(new Date(review.createdAt), { addSuffix: true }) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </>
  );
}
