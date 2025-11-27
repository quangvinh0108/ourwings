"use client";

import { useState, useMemo, useEffect } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface TestModeProps {
  studySetId: string;
}

interface TestQuestion {
  type: "multiple-choice" | "true-false" | "written";
  question: string;
  correctAnswer: string;
  options?: string[];
  userAnswer?: string;
}

export function TestMode({ studySetId }: TestModeProps) {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [startTime, setStartTime] = useState<number>(Date.now());
  
  const { data: studySet, isLoading } = api.studySet.getByIdPublic.useQuery({ id: studySetId });
  const createResult = api.result.create.useMutation({
    onSuccess: () => {
      console.log("Result saved successfully");
    },
  });

  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
    }
    return shuffled;
  };

  const questions: TestQuestion[] = useMemo(() => {
    if (!studySet) return [];
    
    const allQuestions: TestQuestion[] = [];
    
    // Multiple choice questions
    studySet.flashcards.slice(0, 5).forEach((card, index) => {
      const wrongAnswers = studySet.flashcards
        .filter((_, i) => i !== index)
        .map(c => c.definition)
        .slice(0, 3);
      
      allQuestions.push({
        type: "multiple-choice",
        question: card.term,
        correctAnswer: card.definition,
        options: shuffleArray([card.definition, ...wrongAnswers]),
      });
    });
    
    // True/False questions
    studySet.flashcards.slice(5, 8).forEach((card, index) => {
      const useCorrect = Math.random() > 0.5;
      const wrongDef = studySet.flashcards[
        (index + 5) % studySet.flashcards.length
      ]?.definition || "";
      
      allQuestions.push({
        type: "true-false",
        question: `"${card.term}" means "${useCorrect ? card.definition : wrongDef}"`,
        correctAnswer: useCorrect ? "True" : "False",
        options: ["True", "False"],
      });
    });
    
    // Written questions
    studySet.flashcards.slice(8, 10).forEach((card) => {
      allQuestions.push({
        type: "written",
        question: card.term,
        correctAnswer: card.definition,
      });
    });
    
    return allQuestions;
  }, [studySet]);

  const handleSubmit = () => {
    const score = calculateScore();
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    // Save result to database
    createResult.mutate({
      studySetId,
      mode: "test",
      score,
      totalQuestions: questions.length,
      timeSpent,
    });
    
    setSubmitted(true);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, index) => {
      const userAnswer = answers[index]?.toLowerCase().trim();
      const correctAnswer = q.correctAnswer.toLowerCase().trim();
      
      if (q.type === "written") {
        // For written answers, check if the answer contains key words
        if (userAnswer && correctAnswer.includes(userAnswer)) {
          correct++;
        }
      } else {
        if (userAnswer === correctAnswer) {
          correct++;
        }
      }
    });
    return correct;
  };

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

  if (submitted) {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href={`/sets/${studySetId}`}>
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Study Set
          </Button>
        </Link>
        
        <Card>
          <CardContent className="py-12 text-center">
            <h1 className="text-4xl font-bold mb-4">Test Complete!</h1>
            <div className="text-6xl font-bold text-primary mb-4">
              {percentage}%
            </div>
            <p className="text-xl mb-2">
              {score} out of {questions.length} correct
            </p>
            <p className="text-muted-foreground mb-8">
              {percentage >= 80 ? "Excellent!" : percentage >= 60 ? "Good job!" : "Keep studying!"}
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => { setSubmitted(false); setAnswers({}); }}>
                Retake Test
              </Button>
              <Link href={`/sets/${studySetId}`}>
                <Button variant="outline">Back to Study Set</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Review Answers</h2>
          {questions.map((q, index) => {
            const userAnswer = answers[index] || "";
            const isCorrect = userAnswer.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
            
            return (
              <Card key={index} className={isCorrect ? "border-green-500" : "border-red-500"}>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-2">
                    Question {index + 1} ({q.type})
                  </p>
                  <p className="font-semibold mb-4">{q.question}</p>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="text-muted-foreground">Your answer: </span>
                      <span className={isCorrect ? "text-green-600" : "text-red-600"}>
                        {userAnswer || "(No answer)"}
                      </span>
                    </p>
                    {!isCorrect && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">Correct answer: </span>
                        <span className="text-green-600">{q.correctAnswer}</span>
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
        <h1 className="text-2xl font-bold">{studySet.title} - Test</h1>
        <div className="text-sm text-muted-foreground">
          {questions.length} questions
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((question, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="mb-4">
                <Label className="text-sm text-muted-foreground">
                  Question {index + 1} ({question.type})
                </Label>
                <p className="text-lg font-semibold mt-2">{question.question}</p>
              </div>

              {question.type === "written" ? (
                <Input
                  value={answers[index] || ""}
                  onChange={(e) => setAnswers({ ...answers, [index]: e.target.value })}
                  placeholder="Type your answer..."
                />
              ) : (
                <div className="space-y-2">
                  {question.options?.map((option) => (
                    <Button
                      key={option}
                      variant={answers[index] === option ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setAnswers({ ...answers, [index]: option })}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Button 
        onClick={handleSubmit} 
        className="w-full" 
        size="lg"
        disabled={Object.keys(answers).length < questions.length}
      >
        Submit Test
      </Button>
    </div>
  );
}
