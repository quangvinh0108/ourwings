"use client";

import { useState, useMemo, useEffect } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface MatchModeProps {
  studySetId: string;
}

interface MatchItem {
  id: string;
  text: string;
  type: "term" | "definition";
  matched: boolean;
}

export function MatchMode({ studySetId }: MatchModeProps) {
  const [items, setItems] = useState<MatchItem[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [matches, setMatches] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  
  const { data: studySet, isLoading } = api.studySet.getByIdPublic.useQuery({ id: studySetId });
  const createResult = api.result.create.useMutation();

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
    }
    return shuffled;
  };

  useEffect(() => {
    if (studySet && studySet.flashcards.length > 0) {
      const cards = studySet.flashcards.slice(0, 6); // Limit to 6 pairs
      
      const matchItems: MatchItem[] = cards.flatMap((card, index) => [
        {
          id: `term-${index}`,
          text: card.term,
          type: "term" as const,
          matched: false,
        },
        {
          id: `def-${index}`,
          text: card.definition,
          type: "definition" as const,
          matched: false,
        },
      ]);
      
      setItems(shuffleArray(matchItems));
      setStartTime(Date.now());
    }
  }, [studySet]);

  const handleItemClick = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item || item.matched) return;
    
    if (!selected) {
      setSelected(itemId);
    } else {
      const selectedItem = items.find(i => i.id === selected);
      if (!selectedItem) return;
      
      // Check if they match (same index, different type)
      const selectedIndex = selected.split('-')[1];
      const currentIndex = itemId.split('-')[1];
      
      if (selectedIndex === currentIndex && selectedItem.type !== item.type) {
        // Match!
        setItems(items.map(i => 
          i.id === selected || i.id === itemId 
            ? { ...i, matched: true }
            : i
        ));
        setMatches(matches + 1);
        
        // Check if game is complete
        if (matches + 1 === items.length / 2) {
          const gameEndTime = Date.now();
          setEndTime(gameEndTime);
          
          // Save result
          if (startTime) {
            const timeSpent = Math.floor((gameEndTime - startTime) / 1000);
            createResult.mutate({
              studySetId,
              mode: "match",
              score: items.length / 2, // All matches are correct
              totalQuestions: items.length / 2,
              timeSpent,
            });
          }
        }
      }
      
      setSelected(null);
    }
  };

  const handleRestart = () => {
    if (studySet && studySet.flashcards.length > 0) {
      const cards = studySet.flashcards.slice(0, 6);
      
      const matchItems: MatchItem[] = cards.flatMap((card, index) => [
        {
          id: `term-${index}`,
          text: card.term,
          type: "term" as const,
          matched: false,
        },
        {
          id: `def-${index}`,
          text: card.definition,
          type: "definition" as const,
          matched: false,
        },
      ]);
      
      setItems(shuffleArray(matchItems));
      setSelected(null);
      setMatches(0);
      setStartTime(Date.now());
      setEndTime(null);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!studySet || studySet.flashcards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="mb-4">No flashcards available</p>
        <Link href={`/sets/${studySetId}`}>
          <Button>Back to Study Set</Button>
        </Link>
      </div>
    );
  }

  const isComplete = endTime !== null;
  const elapsedTime = endTime && startTime ? Math.round((endTime - startTime) / 1000) : 0;

  if (isComplete) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <h1 className="text-4xl font-bold">Congratulations!</h1>
        <Card>
          <CardContent className="py-12">
            <div className="text-6xl font-bold text-primary mb-4">
              {elapsedTime}s
            </div>
            <p className="text-xl mb-2">
              You matched all {matches} pairs!
            </p>
            <p className="text-muted-foreground">
              {elapsedTime < 30 ? "Amazing speed!" : elapsedTime < 60 ? "Great job!" : "Keep practicing!"}
            </p>
          </CardContent>
        </Card>
        <div className="flex gap-4 justify-center">
          <Button onClick={handleRestart}>Play Again</Button>
          <Link href={`/sets/${studySetId}`}>
            <Button variant="outline">Back to Study Set</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href={`/sets/${studySetId}`}>
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{studySet.title} - Match Game</h1>
        <div className="text-sm text-muted-foreground">
          {matches} / {items.length / 2} matched
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 1, scale: 1 }}
            animate={{ 
              opacity: item.matched ? 0.3 : 1,
              scale: item.matched ? 0.9 : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            <Button
              variant={selected === item.id ? "default" : "outline"}
              className={`w-full h-32 text-sm p-4 ${
                item.matched ? "opacity-50 cursor-not-allowed" : ""
              } ${
                item.type === "term" ? "border-blue-500" : "border-green-500"
              }`}
              onClick={() => handleItemClick(item.id)}
              disabled={item.matched}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <span className="text-xs text-muted-foreground mb-2">
                  {item.type === "term" ? "Term" : "Definition"}
                </span>
                <span className="line-clamp-3">{item.text}</span>
              </div>
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
