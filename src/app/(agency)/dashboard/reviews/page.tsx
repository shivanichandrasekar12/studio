
"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, PlusCircle, MessageSquareText } from "lucide-react"; 
import { useState, type FormEvent } from "react";
import type { Review } from "@/types";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const mockReviews: Review[] = [
  { id: "R001", customerName: "Alice Wonderland", rating: 5, title: "Fantastic Service!", comment: "The driver was punctual and very courteous. The vehicle was clean and comfortable. Made our trip to the airport stress-free.", createdAt: new Date(Date.now() - 86400000 * 2), avatarUrl: "https://placehold.co/40x40.png?text=AW", reviewType: "customer" },
  { id: "R002", customerName: "Bob The Builder", rating: 4, comment: "Good experience overall. Pickup was slightly delayed, but the driver apologized and was very professional.", createdAt: new Date(Date.now() - 86400000 * 5), avatarUrl: "https://placehold.co/40x40.png?text=BB", reviewType: "customer" },
  { id: "R003", customerName: "Charlie Brown", rating: 3, title: "It was okay", comment: "The car was a bit older than expected. Service was average.", createdAt: new Date(Date.now() - 86400000 * 10), avatarUrl: "https://placehold.co/40x40.png?text=CB", reviewType: "customer" },
];


export default function AgencyReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formCustomerName, setFormCustomerName] = useState("");
  const [formRating, setFormRating] = useState(0);
  const [formReviewTitle, setFormReviewTitle] = useState("");
  const [formComment, setFormComment] = useState("");

  const handleStarClick = (newRating: number) => {
    setFormRating(newRating);
  };

  const resetForm = () => {
    setFormCustomerName("");
    setFormRating(0);
    setFormReviewTitle("");
    setFormComment("");
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (formRating === 0) {
      toast({ title: "Rating Required", description: "Please select a star rating for the customer.", variant: "destructive" });
      return;
    }
    const newReview: Review = {
      id: `R${String(Date.now()).slice(-4)}`,
      customerName: formCustomerName || "Anonymous Customer",
      rating: formRating,
      title: formReviewTitle,
      comment: formComment,
      createdAt: new Date(),
      avatarUrl: `https://placehold.co/40x40.png?text=${formCustomerName ? formCustomerName.substring(0,1).toUpperCase() : 'C'}U`,
      reviewType: "customer" 
    };
    setReviews([newReview, ...reviews]);
    toast({ title: "Customer Review Logged", description: "The customer's feedback has been saved." });
    resetForm();
    setIsFormOpen(false);
  };
  
  const getReviewTypeLabel = (type: Review["reviewType"]) => {
    switch (type) {
      case "customer": return "Customer Review";
      case "driver_report": return "Driver Report";
      case "agency_assessment": return "Agency Assessment";
      default: return "Review";
    }
  };

  return (
    <>
      <PageHeader title="Customer Reviews Management" description="Log and view customer feedback.">
        <Button onClick={() => setIsFormOpen(!isFormOpen)}>
          <PlusCircle className="mr-2 h-4 w-4" /> {isFormOpen ? "Cancel Logging" : "Log Customer Review"}
        </Button>
      </PageHeader>

      {isFormOpen && (
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle>Log Customer Review</CardTitle>
            <CardDescription>Enter the feedback received from a customer about their experience.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="formCustomerName">Customer Name</Label>
                  <Input id="formCustomerName" value={formCustomerName} onChange={(e) => setFormCustomerName(e.target.value)} placeholder="Enter customer's name" />
                </div>
                <div>
                  <Label>Customer Rating</Label>
                  <div className="flex space-x-1 mt-2">
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
              </div>
              <div>
                <Label htmlFor="formReviewTitle">Review Title (Optional)</Label>
                <Input id="formReviewTitle" value={formReviewTitle} onChange={(e) => setFormReviewTitle(e.target.value)} placeholder="e.g., Excellent Service!" />
              </div>
              <div>
                <Label htmlFor="formComment">Customer Comments</Label>
                <Textarea
                  id="formComment"
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  placeholder="Enter the customer's comments..."
                  className="min-h-[120px]"
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit">Save Customer Review</Button>
            </CardFooter>
          </form>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Feedback Log</CardTitle>
          <CardDescription>All logged feedback for your agency.</CardDescription>
        </CardHeader>
        <CardContent>
          {reviews.length > 0 ? (
            <ScrollArea className="h-[calc(100vh-25rem)] pr-3">
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
                        <div className="mt-2 flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(review.createdAt, { addSuffix: true })}
                          </p>
                          <Badge variant={review.reviewType === 'customer' ? 'secondary' : 'outline'}>
                            {getReviewTypeLabel(review.reviewType)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <MessageSquareText className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg font-medium">No reviews logged yet.</p>
              <p className="text-sm">Use the 'Log Customer Review' button to add feedback.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
