"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Header } from "~/components/layout/header";

interface Flashcard {
  term: string;
  definition: string;
  image?: string;
}

export default function CreateSetPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([
    { term: "", definition: "" },
    { term: "", definition: "" },
  ]);

  const createMutation = api.studySet.create.useMutation({
    onSuccess: (data) => {
      router.push(`/sets/${data.id}`);
    },
  });

  const addFlashcard = () => {
    setFlashcards([...flashcards, { term: "", definition: "" }]);
  };

  const removeFlashcard = (index: number) => {
    if (flashcards.length > 2) {
      setFlashcards(flashcards.filter((_, i) => i !== index));
    }
  };

  const updateFlashcard = (
    index: number,
    field: "term" | "definition" | "image",
    value: string
  ) => {
    const newFlashcards = [...flashcards];
    newFlashcards[index]![field] = value;
    setFlashcards(newFlashcards);
  };

  const handleImageUpload = (index: number, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      updateFlashcard(index, "image", reader.result as string);
    };
    reader.readAsDataURL(file);
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
      title: title.trim(),
      description: description.trim() || "",
      isPublic,
      flashcards: validFlashcards,
    };

    console.log("Sending payload:", payload);
    createMutation.mutate(payload);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-8">Create a new study set</h1>

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
                  onCheckedChange={(checked) => setIsPublic(checked as boolean)}
                />
                <Label
                  htmlFor="isPublic"
                  className="text-sm font-normal cursor-pointer"
                >
                  Make this study set public (other users can view and study it)
                </Label>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {flashcards.map((card, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium">{index + 1}</CardTitle>
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
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`term-${index}`} className="text-xs uppercase text-muted-foreground">
                        Term
                      </Label>
                      <Textarea
                        id={`term-${index}`}
                        value={card.term}
                        onChange={(e) =>
                          updateFlashcard(index, "term", e.target.value)
                        }
                        placeholder="Enter term"
                        className="min-h-[100px] resize-none"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`definition-${index}`} className="text-xs uppercase text-muted-foreground">
                        Definition
                      </Label>
                      <Textarea
                        id={`definition-${index}`}
                        value={card.definition}
                        onChange={(e) =>
                          updateFlashcard(index, "definition", e.target.value)
                        }
                        placeholder="Enter definition"
                        className="min-h-[100px] resize-none"
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Image Upload */}
                  <div className="mt-4 space-y-2">
                    <Label className="text-xs uppercase text-muted-foreground">
                      Image (Optional)
                    </Label>
                    {card.image ? (
                      <div className="relative">
                        <img
                          src={card.image}
                          alt="Flashcard preview"
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => removeImage(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed rounded-lg p-6 text-center">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(index, file);
                          }}
                          className="hidden"
                          id={`image-${index}`}
                        />
                        <Label
                          htmlFor={`image-${index}`}
                          className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
                        >
                          Click to upload image
                        </Label>
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
              disabled={createMutation.isPending}
              className="flex-1"
            >
              {createMutation.isPending ? "Creating..." : "Create Study Set"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
