
"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, PlusCircle } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { Review } from "@/types";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

const mockReviews: Review[] = [
  { id: "R001", customerName: "Alice Wonderland", rating: 5, title: "Fantastic Service!", comment: "The driver was punctual and very courteous. The vehicle was clean and comfortable. Made our trip to the airport stress-free.", createdAt: new Date(Date.now() - 86400000 * 2), avatarUrl: "https://placehold.co/40x40.png?text=AW" },
  { id: "R002", customerName: "Bob The Builder", rating: 4, comment: "Good experience overall. Pickup was slightly delayed, but the driver apologized and was very professional.", createdAt: new Date(Date.now() - 86400000 * 5), avatarUrl: "https://placehold.co/40x40.png?text=BB" },
  { id: "R003", customerName: "Charlie Brown", rating: 3, title: "It was okay", comment: "The car was a bit older than expected. Service was average.", createdAt: new Date(Date.now() - 86400000 * 10), avatarUrl: "https://placehold.co/40x40.png?text=CB" },
];


export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [rating, setRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [comment, setComment] = useState("");

  const handleStarClick = (newRating: number) => {
    setRating(newRating);
  };

  const resetForm = () => {
    setCustomerName("");
    setRating(0);
    setReviewTitle("");
    setComment("");
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (rating === 0) {
      toast({ title: "Rating Required", description: "Please select a star rating.", variant: "destructive" });
      return;
    }
    const newReview: Review = {
      id: `R${String(Date.now()).slice(-4)}`,
      customerName: customerName || "Anonymous",
      rating,
      title: reviewTitle,
      comment,
      createdAt: new Date(),
      avatarUrl: `https://placehold.co/40x40.png?text=${customerName ? customerName.substring(0,1).toUpperCase() : 'A'}N`
    };
    setReviews([newReview, ...reviews]);
    toast({ title: "Review Submitted", description: "Thank you for your feedback!" });
    resetForm();
    setIsFormOpen(false);
  };

  return (
    <>
      <PageHeader title="Customer Reviews" description="Read feedback and manage customer experiences.">
        <Button onClick={() => setIsFormOpen(!isFormOpen)}>
          <PlusCircle className="mr-2 h-4 w-4" /> {isFormOpen ? "Cancel Review" : "Add New Review"}
        </Button>
      </PageHeader>

      {isFormOpen && (
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle>Leave a Review</CardTitle>
            <CardDescription>Share your experience with our services.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Your Name</Label>
                  <Input id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Enter your name (optional)" />
                </div>
                <div>
                  <Label>Your Rating</Label>
                  <div className="flex space-x-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "h-7 w-7 cursor-pointer transition-colors",
                          rating >= star ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground hover:text-yellow-300"
                        )}
                        onClick={() => handleStarClick(star)}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="reviewTitle">Review Title (Optional)</Label>
                <Input id="reviewTitle" value={reviewTitle} onChange={(e) => setReviewTitle(e.target.value)} placeholder="e.g., Excellent Service!" />
              </div>
              <div>
                <Label htmlFor="comment">Your Comments</Label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us about your experience..."
                  className="min-h-[120px]"
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit">Submit Review</Button>
            </CardFooter>
          </form>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
          <CardDescription>What our customers are saying about NomadX_Agency.</CardDescription>
        </CardHeader>
        <CardContent>
          {reviews.length > 0 ? (
            <ScrollArea className="h-[calc(100vh-25rem)] pr-3"> {/* Adjust height as needed */}
              <div className="space-y-6">
                {reviews.map((review) => (
                  <Card key={review.id} className="p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-10 w-10 border">
                        <AvatarImage src={review.avatarUrl || `https://placehold.co/40x40.png?text=${review.customerName.substring(0,1)}`} alt={review.customerName} data-ai-hint="customer avatar"/>
                        <AvatarFallback>{review.customerName.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                             <h4 className="text-sm font-semibold">{review.customerName}</h4>
                             {review.title && <p className="text-md font-medium text-primary">{review.title}</p>}
                          </div>
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
                          {formatDistanceToNow(review.createdAt, { addSuffix: true })}
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
              <p className="text-lg font-medium">No reviews yet.</p>
              <p className="text-sm">Be the first to share your experience!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

// Helper icon if not already imported from lucide-react elsewhere in file
import { MessageSquareText } from 'lucide-react';
