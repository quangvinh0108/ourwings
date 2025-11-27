"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { BookOpen, Edit, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { api } from "~/trpc/react";

interface StudySet {
  id: string;
  title: string;
  description: string | null;
  flashcards: Array<{ id: string }>;
  user?: {
    id: string;
    name: string | null;
    image: string | null;
  };
  createdAt: Date;
}

interface StudySetCardProps {
  studySet: StudySet;
  showAuthor?: boolean;
}

const StudySetCardComponent = ({ studySet, showAuthor = false }: StudySetCardProps) => {
  // Only fetch rating if showing author (public sets)
  const { data: ratingData } = api.review.getAverageRating.useQuery(
    { studySetId: studySet.id },
    { enabled: showAuthor } // Only fetch when needed
  );

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="truncate">{studySet.title}</span>
          <BookOpen className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {studySet.description || "No description"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {showAuthor && studySet.user && (
            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={studySet.user.image || undefined} />
                <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {studySet.user.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground truncate">
                {studySet.user.name}
              </span>
              {ratingData && ratingData.totalReviews > 0 && (
                <div className="flex items-center gap-1 ml-auto">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">
                    {ratingData.averageRating.toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({ratingData.totalReviews})
                  </span>
                </div>
              )}
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {studySet.flashcards.length} terms
            </span>
            <div className="flex gap-2">
              <Link href={`/sets/${studySet.id}`}>
                <Button size="sm">Study</Button>
              </Link>
              {!showAuthor && (
                <Link href={`/sets/${studySet.id}/edit`}>
                  <Button size="sm" variant="outline">
                    <Edit className="w-4 h-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Memoize component to prevent unnecessary re-renders
export const StudySetCard = React.memo(StudySetCardComponent);
