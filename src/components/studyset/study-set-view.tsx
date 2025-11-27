"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { 
  BookOpen, 
  Brain, 
  Gamepad2, 
  FileText, 
  Edit, 
  Trash2, 
  Download,
  Printer,
  ArrowLeft,
  Volume2,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Settings,
  Star,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ReviewSection } from "~/components/studyset/review-section";

interface StudySetViewProps {
  studySetId: string;
}

export function StudySetView({ studySetId }: StudySetViewProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);
  
  const { data: studySet, isLoading } = api.studySet.getByIdPublic.useQuery(
    { id: studySetId }
  );
  const logActivityMutation = api.studySet.logActivity.useMutation();
  const { data: ratingData } = api.review.getAverageRating.useQuery({ studySetId });
  const { data: studyCount } = api.studySet.getStudyCount.useQuery({ id: studySetId });
  const deleteMutation = api.studySet.delete.useMutation({
    onSuccess: () => {
      router.push("/dashboard");
    },
  });

  // Log activity when study set is viewed
  useEffect(() => {
    if (studySet) {
      logActivityMutation.mutate({
        studySetId: studySet.id,
        type: "viewed",
      });
    }
  }, [studySet?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const isOwner = session?.user?.id === studySet?.userId;

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this study set?")) {
      deleteMutation.mutate({ id: studySetId });
    }
  };

  const handleExport = () => {
    if (!studySet) return;
    
    const data = {
      title: studySet.title,
      description: studySet.description,
      flashcards: studySet.flashcards,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${studySet.title}.json`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const nextCard = () => {
    if (studySet && currentCardIndex < studySet.flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const shuffleCards = () => {
    const randomIndex = Math.floor(Math.random() * (studySet?.flashcards.length ?? 1));
    setCurrentCardIndex(randomIndex);
    setIsFlipped(false);
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const now = Date.now();
      const isDoubleClick = now - lastClickTime < 400; // 400ms để phát hiện double click
      setLastClickTime(now);
      
      // Kiểm tra nếu text chứa tiếng Anh (có ký tự Latin)
      const isEnglish = /[a-zA-Z]/.test(text);
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = isEnglish ? 'en-US' : 'vi-VN';
      
      // Double click = đọc chậm, single click = đọc bình thường
      utterance.rate = isDoubleClick ? 0.6 : 1.0;
      
      window.speechSynthesis.speak(utterance);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!studySet) {
    return <div className="text-center py-12">Study set not found</div>;
  }

  return (
    <div className="space-y-6">
      <Link href="/dashboard">
        <Button variant="ghost">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>

      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{studySet.title}</h1>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
              {studySet.user?.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm font-medium">Created by</p>
                <p className="text-sm text-muted-foreground">{studySet.user?.name ?? 'User'}</p>
              </div>
              
              {/* Rating Display */}
              {ratingData && ratingData.totalReviews > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-semibold">
                    {ratingData.averageRating.toFixed(1)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({ratingData.totalReviews} {ratingData.totalReviews === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              )}
              
              {/* Study Count Display */}
              {studyCount !== undefined && studyCount > 0 && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {studyCount} {studyCount === 1 ? 'person' : 'people'} studied
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {isOwner && (
              <>
                <Link href={`/sets/${studySetId}/edit`}>
                  <Button variant="outline" size="icon">
                    <Edit className="w-4 h-4" />
                  </Button>
                </Link>
              </>
            )}
            <Button variant="outline" size="icon" onClick={handleExport}>
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handlePrint}>
              <Printer className="w-4 h-4" />
            </Button>
            {isOwner && (
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8">
        <Link href={`/sets/${studySetId}/flashcards`}>
          <Button variant="outline" className="w-full h-12 justify-start gap-2">
            <BookOpen className="w-5 h-5" />
            Flashcards
          </Button>
        </Link>

        <Link href={`/sets/${studySetId}/learn`}>
          <Button variant="outline" className="w-full h-12 justify-start gap-2">
            <Brain className="w-5 h-5" />
            Learn
          </Button>
        </Link>

        <Link href={`/sets/${studySetId}/test`}>
          <Button variant="outline" className="w-full h-12 justify-start gap-2">
            <FileText className="w-5 h-5" />
            Test
          </Button>
        </Link>

        <Link href={`/sets/${studySetId}/match`}>
          <Button variant="outline" className="w-full h-12 justify-start gap-2">
            <Gamepad2 className="w-5 h-5" />
            Match
          </Button>
        </Link>
      </div>

      {/* Flashcard Preview */}
      {studySet.flashcards.length > 0 && (
        <div className="mb-8 max-w-2xl mx-auto">
          <div 
            className="relative h-[400px] cursor-pointer perspective-1000"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div 
              className={`relative w-full h-full transition-all duration-500 preserve-3d ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* Front of card (Term) */}
              <Card 
                className="absolute inset-0 backface-hidden bg-card hover:shadow-lg"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <CardContent className="h-full flex flex-col">
                  <div className="flex items-start justify-between p-6 pb-0">
                    <p className="text-sm text-muted-foreground">TERM</p>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => {
                        e.stopPropagation();
                        speakText(studySet.flashcards[currentCardIndex]?.term ?? '');
                      }}
                    >
                      <Volume2 className="w-5 h-5" />
                    </Button>
                  </div>
                  
                  <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
                    {studySet.flashcards[currentCardIndex]?.image && (
                      <img
                        src={studySet.flashcards[currentCardIndex]?.image}
                        alt={studySet.flashcards[currentCardIndex]?.term}
                        className="max-h-48 rounded-lg object-contain"
                      />
                    )}
                    <p className="text-2xl md:text-3xl font-medium text-center whitespace-pre-line">
                      {studySet.flashcards[currentCardIndex]?.term}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Back of card (Definition) */}
              <Card 
                className="absolute inset-0 backface-hidden bg-card hover:shadow-lg"
                style={{ 
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                <CardContent className="h-full flex flex-col">
                  <div className="flex items-start justify-between p-6 pb-0">
                    <p className="text-sm text-muted-foreground">DEFINITION</p>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => {
                        e.stopPropagation();
                        speakText(studySet.flashcards[currentCardIndex]?.definition ?? '');
                      }}
                    >
                      <Volume2 className="w-5 h-5" />
                    </Button>
                  </div>
                  
                  <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
                    {studySet.flashcards[currentCardIndex]?.image && (
                      <img
                        src={studySet.flashcards[currentCardIndex]?.image}
                        alt={studySet.flashcards[currentCardIndex]?.definition}
                        className="max-h-48 rounded-lg object-contain"
                      />
                    )}
                    <p className="text-2xl md:text-3xl font-medium text-center whitespace-pre-line">
                      {studySet.flashcards[currentCardIndex]?.definition}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mt-4">
            <Button variant="ghost" size="icon" onClick={shuffleCards}>
              <Shuffle className="w-5 h-5" />
            </Button>

            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={prevCard}
                disabled={currentCardIndex === 0}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>

              <span className="text-sm font-medium">
                {currentCardIndex + 1} / {studySet.flashcards.length}
              </span>

              <Button 
                variant="ghost" 
                size="icon"
                onClick={nextCard}
                disabled={currentCardIndex === studySet.flashcards.length - 1}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Terms in this set ({studySet.flashcards.length})</h2>
        <div className="space-y-2">
          {studySet.flashcards.map((card) => (
            <Card key={card.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                  {card.image && (
                    <div className="flex-shrink-0">
                      <img
                        src={card.image}
                        alt={card.term}
                        className="w-full sm:w-24 h-24 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm whitespace-pre-line break-words">{card.term}</p>
                  </div>
                  <Separator orientation="vertical" className="hidden sm:block h-auto" />
                  <Separator className="sm:hidden" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground whitespace-pre-line break-words">{card.definition}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <ReviewSection studySetId={studySetId} />
      </div>
    </div>
  );
}
