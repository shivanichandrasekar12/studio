
"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, PlusCircle, MessageSquareText, Loader2, AlertCircle, Edit, Trash2 } from "lucide-react"; 
import { useState, type FormEvent } from "react";
import type { Review } from "@/types";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getReviews, addReview, updateReview, deleteReview } from "@/lib/services/reviewsService";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";


export default function AgencyReviewsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: reviews = [], isLoading: isLoadingReviews, error: reviewsError } = useQuery<Review[], Error>({
    queryKey: ["reviews"],
    queryFn: getReviews,
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  // Form state
  const [formCustomerName, setFormCustomerName] = useState("");
  const [formRating, setFormRating] = useState(0);
  const [formReviewTitle, setFormReviewTitle] = useState("");
  const [formComment, setFormComment] = useState("");
  const [formAvatarUrl, setFormAvatarUrl] = useState("");

  const { mutate: addReviewMutation, isPending: isAddingReview } = useMutation({
    mutationFn: addReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast({ title: "Customer Review Logged", description: "The customer's feedback has been saved." });
      resetForm();
      setIsFormOpen(false);
    },
    onError: (error) => {
      toast({ title: "Error Logging Review", description: error.message, variant: "destructive" });
    },
  });

  const { mutate: updateReviewMutation, isPending: isUpdatingReview } = useMutation({
    mutationFn: async (reviewPayload: { id: string; data: Partial<Omit<Review, "id">>}) => updateReview(reviewPayload.id, reviewPayload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast({ title: "Review Updated", description: "The review has been successfully updated." });
      resetForm();
      setIsFormOpen(false);
    },
    onError: (error) => {
      toast({ title: "Error Updating Review", description: error.message, variant: "destructive" });
    },
  });
  
  const { mutate: deleteReviewMutation } = useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast({ title: "Review Deleted", description: "The review has been successfully deleted." });
    },
    onError: (error) => {
      toast({ title: "Error Deleting Review", description: error.message, variant: "destructive" });
    },
  });

  const handleStarClick = (newRating: number) => {
    setFormRating(newRating);
  };

  const resetForm = () => {
    setEditingReview(null);
    setFormCustomerName("");
    setFormRating(0);
    setFormReviewTitle("");
    setFormComment("");
    setFormAvatarUrl("");
  }
  
  const handleOpenForm = (review?: Review) => {
    if (review) {
      setEditingReview(review);
      setFormCustomerName(review.customerName);
      setFormRating(review.rating);
      setFormReviewTitle(review.title || "");
      setFormComment(review.comment);
      setFormAvatarUrl(review.avatarUrl || "");
    } else {
      resetForm();
    }
    setIsFormOpen(true);
  };


  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (formRating === 0) {
      toast({ title: "Rating Required", description: "Please select a star rating for the customer.", variant: "destructive" });
      return;
    }
    const reviewPayload = {
      customerName: formCustomerName || "Anonymous Customer",
      rating: formRating,
      title: formReviewTitle,
      comment: formComment,
      avatarUrl: formAvatarUrl || `https://placehold.co/40x40.png?text=${formCustomerName ? formCustomerName.substring(0,1).toUpperCase() : 'C'}U`,
      reviewType: "customer" as Review["reviewType"], 
      createdAt: new Date(), // Firestore service will convert this to Timestamp
    };
    
    if (editingReview) {
      updateReviewMutation({id: editingReview.id, data: reviewPayload});
    } else {
      addReviewMutation(reviewPayload);
    }
  };

  const handleDelete = (reviewId: string) => {
    if (window.confirm("Are you sure you want to delete this review? This action cannot be undone.")) {
      deleteReviewMutation(reviewId);
    }
  };
  
  const getReviewTypeLabel = (type: Review["reviewType"]) => {
    switch (type) {
      case "customer": return "Customer Review";
      case "driver_report": return "Driver Report";
      case "agency_assessment": return "Agency Assessment";
      default: return "Review";
    }
  };

  const isMutating = isAddingReview || isUpdatingReview;

  if (reviewsError) {
     return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Fetching Reviews</AlertTitle>
          <AlertDescription>{reviewsError.message}</AlertDescription>
        </Alert>
      </div>
    );
  }


  return (
    <>
      <PageHeader title="Customer Reviews Management" description="Log and view customer feedback.">
        <Button onClick={() => handleOpenForm()} disabled={isMutating}>
          <PlusCircle className="mr-2 h-4 w-4" /> {isFormOpen && !editingReview ? "Cancel Logging" : (editingReview ? "Cancel Editing" : "Log Customer Review")}
        </Button>
      </PageHeader>

      {(isFormOpen || editingReview) && (
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle>{editingReview ? "Edit Customer Review" : "Log Customer Review"}</CardTitle>
            <CardDescription>{editingReview ? "Update the details of this customer feedback." : "Enter the feedback received from a customer about their experience."}</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="formCustomerName">Customer Name</Label>
                  <Input id="formCustomerName" value={formCustomerName} onChange={(e) => setFormCustomerName(e.target.value)} placeholder="Enter customer's name" required/>
                </div>
                <div>
                  <Label>Customer Rating *</Label>
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
                <Label htmlFor="formComment">Customer Comments *</Label>
                <Textarea
                  id="formComment"
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  placeholder="Enter the customer's comments..."
                  className="min-h-[120px]"
                  required
                />
              </div>
              <div>
                <Label htmlFor="formAvatarUrl">Customer Avatar URL (Optional)</Label>
                <Input id="formAvatarUrl" value={formAvatarUrl} onChange={(e) => setFormAvatarUrl(e.target.value)} placeholder="https://placehold.co/40x40.png" />
              </div>
            </CardContent>
            <CardFooter className="gap-2">
              <Button type="submit" disabled={isMutating}>
                {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingReview ? "Save Changes" : "Save Customer Review"}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setIsFormOpen(false); resetForm(); }}>Cancel</Button>
            </CardFooter>
          </form>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><MessageSquareText className="mr-2 h-5 w-5 text-primary"/>Feedback Log</CardTitle>
          <CardDescription>All logged feedback for your agency.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingReviews ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
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
          ) : reviews.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageSquareText className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg font-medium">No reviews logged yet.</p>
              <p className="text-sm">Use the 'Log Customer Review' button to add feedback.</p>
            </div>
          ) : (
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
                            {review.createdAt ? formatDistanceToNow(new Date(review.createdAt), { addSuffix: true }) : 'N/A'}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant={review.reviewType === 'customer' ? 'secondary' : 'outline'}>
                              {getReviewTypeLabel(review.reviewType)}
                            </Badge>
                             <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenForm(review)}>
                                  <Edit className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(review.id)} className="text-red-600 focus:text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
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

    