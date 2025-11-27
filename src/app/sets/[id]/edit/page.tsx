"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Plus, Trash2, ArrowLeft, Loader2, Upload, X } from "lucide-react";
import Link from "next/link";
import { Header } from "~/components/layout/header";
import Image from "next/image";

interface Flashcard {
  id?: string;
  term: string;
  definition: string;
  image?: string;
}

export default function EditSetPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  const { data: studySet, isLoading } = api.studySet.getById.useQuery(
    { id },
    { enabled: !!id }
  );

  const updateMutation = api.studySet.update.useMutation({
    onSuccess: () => {
      router.push(`/sets/${id}`);
    },
  });

  useEffect(() => {
    if (studySet) {
      setTitle(studySet.title);
      setDescription(studySet.description ?? "");
      setIsPublic(studySet.isPublic ?? false);
      setFlashcards(
        studySet.flashcards.map((card: { id: string; term: string; definition: string; image?: string | null }) => ({
          id: card.id,
          term: card.term,
          definition: card.definition,
          image: card.image ?? undefined,
        }))
      );
    }
  }, [studySet]);

  const addFlashcard = () => {
    setFlashcards([...flashcards, { term: "", definition: "", image: undefined }]);
  };

  const removeFlashcard = (index: number) => {
    if (flashcards.length > 2) {
      setFlashcards(flashcards.filter((_, i) => i !== index));
    }
  };

  const updateFlashcard = (
    index: number,
    field: "term" | "definition",
    value: string
  ) => {
    const newFlashcards = [...flashcards];
    newFlashcards[index]![field] = value;
    setFlashcards(newFlashcards);
  };

  const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newFlashcards = [...flashcards];
        newFlashcards[index]!.image = reader.result as string;
        setFlashcards(newFlashcards);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    const newFlashcards = [...flashcards];
    newFlashcards[index]!.image = undefined;
    setFlashcards(newFlashcards);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validFlashcards = flashcards.filter(
      (card) => card.term.trim() && card.definition.trim()
    );

    if (!title.trim() || validFlashcards.length < 2) {
      alert("Please provide a title and at least 2 complete flashcards");
      return;
    }

    const payload = {
      id,
      title: title.trim(),
      description: description.trim() || "",
      isPublic,
      flashcards: validFlashcards,
    };

    console.log('EDIT FORM - Submitting with isPublic:', isPublic);
    console.log('Full payload:', payload);

    updateMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Link href={`/sets/${id}`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Study Set
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-8">Edit study set</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Study Set Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title, like 'Biology - Chapter 1'"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description (optional)"
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPublic"
                  checked={isPublic}
                  onCheckedChange={(checked) => {
                    console.log('Checkbox changed to:', checked);
                    setIsPublic(!!checked);
                  }}
                />
                <Label htmlFor="isPublic" className="cursor-pointer">
                  Make this study set public (visible to everyone)
                </Label>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {flashcards.map((card, index) => (
              <Card key={card.id ?? index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Card {index + 1}</CardTitle>
                    {flashcards.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFlashcard(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor={`term-${index}`}>Term</Label>
                    <Input
                      id={`term-${index}`}
                      value={card.term}
                      onChange={(e) =>
                        updateFlashcard(index, "term", e.target.value)
                      }
                      placeholder="Enter term"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`definition-${index}`}>Definition</Label>
                    <Textarea
                      id={`definition-${index}`}
                      value={card.definition}
                      onChange={(e) =>
                        updateFlashcard(index, "definition", e.target.value)
                      }
                      placeholder="Enter definition"
                      rows={3}
                      required
                    />
                  </div>
                  <div>
                    <Label>Image (optional)</Label>
                    {card.image ? (
                      <div className="relative mt-2">
                        <Image
                          src={card.image}
                          alt="Flashcard image"
                          width={200}
                          height={200}
                          className="rounded-lg object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => removeImage(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <label
                          htmlFor={`image-${index}`}
                          className="flex items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                        >
                          <div className="text-center">
                            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              Click to upload image
                            </p>
                          </div>
                          <input
                            id={`image-${index}`}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(index, e)}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={addFlashcard}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Card
          </Button>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
