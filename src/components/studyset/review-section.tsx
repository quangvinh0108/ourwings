"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Star, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";

interface ReviewSectionProps {
  studySetId: string;
}

export function ReviewSection({ studySetId }: ReviewSectionProps) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const utils = api.useUtils();
  const { data: reviews } = api.review.getByStudySet.useQuery({ studySetId });
  const { data: userReview } = api.review.getUserReview.useQuery({ studySetId });
  const { data: averageData } = api.review.getAverageRating.useQuery({ studySetId });

  const createOrUpdateMutation = api.review.createOrUpdate.useMutation({
    onSuccess: () => {
      setIsEditing(false);
      setRating(0);
      setComment("");
      utils.review.getByStudySet.invalidate({ studySetId });
      utils.review.getAverageRating.invalidate({ studySetId });
      utils.review.getUserReview.invalidate({ studySetId });
    },
  });

  const deleteMutation = api.review.delete.useMutation({
    onSuccess: () => {
      utils.review.getByStudySet.invalidate({ studySetId });
      utils.review.getAverageRating.invalidate({ studySetId });
      utils.review.getUserReview.invalidate({ studySetId });
    },
  });

  const handleSubmit = () => {
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    createOrUpdateMutation.mutate({
      studySetId,
      rating,
      comment: comment.trim() || undefined,
    });
  };

  const handleEdit = () => {
    if (userReview) {
      setRating(userReview.rating);
      setComment(userReview.comment ?? "");
      setIsEditing(true);
    }
  };

  const handleDelete = (reviewId: string) => {
    if (confirm("Are you sure you want to delete your review?")) {
      deleteMutation.mutate({ id: reviewId });
    }
  };

  const StarRating = ({ 
    value, 
    onChange, 
    readonly = false 
  }: { 
    value: number; 
    onChange?: (rating: number) => void; 
    readonly?: boolean;
  }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange?.(star)}
            onMouseEnter={() => !readonly && setHoverRating(star)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <Star
              className={`w-6 h-6 ${
                star <= (readonly ? value : (hoverRating || rating))
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Average Rating Display */}
      <Card>
        <CardHeader>
          <CardTitle>Reviews & Ratings</CardTitle>
        </CardHeader>
        <CardContent>
          {averageData && averageData.totalReviews > 0 ? (
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold">
                {averageData.averageRating.toFixed(1)}
              </div>
              <div>
                <StarRating value={Math.round(averageData.averageRating)} readonly />
                <p className="text-sm text-muted-foreground mt-1">
                  {averageData.totalReviews} {averageData.totalReviews === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Review Form */}
      {session && (
        <Card>
          <CardHeader>
            <CardTitle>{userReview && !isEditing ? 'Your Review' : isEditing ? 'Edit Review' : 'Write a Review'}</CardTitle>
          </CardHeader>
          <CardContent>
            {userReview && !isEditing ? (
              <div className="space-y-4">
                <StarRating value={userReview.rating} readonly />
                {userReview.comment && (
                  <p className="text-sm">{userReview.comment}</p>
                )}
                <div className="flex gap-2">
                  <Button onClick={handleEdit} variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(userReview.id)}
                    variant="destructive"
                    size="sm"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Rating</label>
                  <StarRating value={rating} onChange={setRating} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Comment (optional)</label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts about this study set..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSubmit}
                    disabled={createOrUpdateMutation.isPending || rating === 0}
                  >
                    {createOrUpdateMutation.isPending ? "Submitting..." : "Submit Review"}
                  </Button>
                  {isEditing && (
                    <Button
                      onClick={() => {
                        setIsEditing(false);
                        setRating(0);
                        setComment("");
                      }}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      {reviews && reviews.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">All Reviews</h3>
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={review.user.image ?? undefined} />
                    <AvatarFallback>
                      {review.user.name?.charAt(0).toUpperCase() ?? 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{review.user.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <StarRating value={review.rating} readonly />
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(review.createdAt), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="mt-2 text-sm">{review.comment}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
