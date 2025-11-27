"use client";

import { useState, useMemo, useEffect } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { ArrowLeft, Check, X } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface LearnModeProps {
  studySetId: string;
}

export function LearnMode({ studySetId }: LearnModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  
  const { data: studySet, isLoading } = api.studySet.getById.useQuery({ id: studySetId });
  const logActivityMutation = api.studySet.logActivity.useMutation();

  // Log activity when learn mode is accessed
  useEffect(() => {
    if (studySet) {
      logActivityMutation.mutate({
        studySetId: studySet.id,
        type: "studied",
      });
    }
  }, [studySet?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
    }
    return shuffled;
  };

  const questions = useMemo(() => {
    if (!studySet) return [];
    
    return studySet.flashcards.map((card, index) => {
      const wrongAnswers = studySet.flashcards
        .filter((_, i) => i !== index)
        .map(c => c.definition)
        .slice(0, 3);
      
      const allAnswers = shuffleArray([card.definition, ...wrongAnswers]);
      
      return {
        term: card.term,
        correctAnswer: card.definition,
        answers: allAnswers,
      };
    });
  }, [studySet]);

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!studySet || questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="mb-4">No questions available</p>
        <Link href={`/sets/${studySetId}`}>
          <Button>Back to Study Set</Button>
        </Link>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isComplete = currentIndex >= questions.length;

  const handleAnswer = (answerIndex: number) => {
    if (showResult) return;
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    const isCorrect = currentQuestion?.answers[answerIndex] === currentQuestion?.correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    setCurrentIndex(currentIndex + 1);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
  };

  if (isComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <h1 className="text-4xl font-bold">Quiz Complete!</h1>
        <Card>
          <CardContent className="py-12">
            <div className="text-6xl font-bold text-primary mb-4">
              {percentage}%
            </div>
            <p className="text-xl mb-2">
              {score} out of {questions.length} correct
            </p>
            <p className="text-muted-foreground">
              {percentage >= 80 ? "Great job!" : percentage >= 60 ? "Good effort!" : "Keep practicing!"}
            </p>
          </CardContent>
        </Card>
        <div className="flex gap-4 justify-center">
          <Button onClick={handleRestart}>Try Again</Button>
          <Link href={`/sets/${studySetId}`}>
            <Button variant="outline">Back to Study Set</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href={`/sets/${studySetId}`}>
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{studySet.title}</h1>
        <div className="text-sm text-muted-foreground">
          Question {currentIndex + 1} / {questions.length}
        </div>
      </div>

      <Card>
        <CardContent className="py-8">
          <p className="text-sm text-muted-foreground mb-4">Definition</p>
          <h2 className="text-2xl font-semibold mb-8">
            {currentQuestion?.term}
          </h2>

          <div className="space-y-3">
            {currentQuestion?.answers.map((answer, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = answer === currentQuestion.correctAnswer;
              
              let buttonVariant: "outline" | "default" = "outline";
              let className = "";
              
              if (showResult && isSelected) {
                if (isCorrect) {
                  className = "border-green-500 bg-green-50 dark:bg-green-950";
                } else {
                  className = "border-red-500 bg-red-50 dark:bg-red-950";
                }
              } else if (showResult && isCorrect) {
                className = "border-green-500 bg-green-50 dark:bg-green-950";
              }
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Button
                    variant={buttonVariant}
                    className={`w-full justify-start text-left h-auto py-4 ${className}`}
                    onClick={() => handleAnswer(index)}
                    disabled={showResult}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{answer}</span>
                      {showResult && isSelected && (
                        isCorrect ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : (
                          <X className="w-5 h-5 text-red-600" />
                        )
                      )}
                      {showResult && !isSelected && isCorrect && (
                        <Check className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                  </Button>
                </motion.div>
              );
            })}
          </div>

          {showResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6"
            >
              <Button onClick={handleNext} className="w-full">
                Next Question
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
