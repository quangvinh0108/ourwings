"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { ArrowLeft, ChevronLeft, ChevronRight, Star } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface FlashcardsModeProps {
  studySetId: string;
}

export function FlashcardsMode({ studySetId }: FlashcardsModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);
  
  const { data: studySet, isLoading } = api.studySet.getById.useQuery({ id: studySetId });
  const logActivityMutation = api.studySet.logActivity.useMutation();

  // Log activity when flashcards mode is accessed
  useEffect(() => {
    if (studySet) {
      logActivityMutation.mutate({
        studySetId: studySet.id,
        type: "studied",
      });
    }
  }, [studySet?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!studySet || studySet.flashcards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="mb-4">No flashcards found</p>
        <Link href={`/sets/${studySetId}`}>
          <Button>Back to Study Set</Button>
        </Link>
      </div>
    );
  }

  const currentCard = studySet.flashcards[currentIndex];
  const totalCards = studySet.flashcards.length;

  const nextCard = () => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowDefinition(false);
    }
  };

  const previousCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowDefinition(false);
    }
  };

  const flipCard = () => {
    setShowDefinition(!showDefinition);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href={`/sets/${studySetId}`}>
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{studySet.title}</h1>
        <div className="text-sm text-muted-foreground">
          {currentIndex + 1} / {totalCards}
        </div>
      </div>

      <div className="min-h-[400px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={flipCard}
            >
              <CardContent className="min-h-[400px] flex items-center justify-center p-12">
                <div className="text-center space-y-6">
                  <p className="text-sm text-muted-foreground">
                    {showDefinition ? "Definition" : "Term"}
                  </p>
                  {currentCard?.image && (
                    <img
                      src={currentCard.image}
                      alt={currentCard.term}
                      className="max-h-64 mx-auto rounded-lg object-contain"
                    />
                  )}
                  <motion.p 
                    key={showDefinition ? "definition" : "term"}
                    initial={{ opacity: 0, rotateY: 90 }}
                    animate={{ opacity: 1, rotateY: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-3xl font-semibold"
                  >
                    {showDefinition ? currentCard?.definition : currentCard?.term}
                  </motion.p>
                  <p className="text-sm text-muted-foreground">
                    Click to flip
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={previousCard}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="flex gap-2">
          {studySet.flashcards.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <Button
          variant="outline"
          onClick={nextCard}
          disabled={currentIndex === totalCards - 1}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
