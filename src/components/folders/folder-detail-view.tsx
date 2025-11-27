"use client";

import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";

interface FolderDetailViewProps {
  folderId: string;
}

export function FolderDetailView({ folderId }: FolderDetailViewProps) {
  const { data: folder, isLoading } = api.folder.getById.useQuery({ id: folderId });

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!folder) {
    return (
      <div className="text-center py-12">
        <p className="mb-4">Folder not found</p>
        <Link href="/folders">
          <Button>Back to Folders</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/folders">
        <Button variant="ghost">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Folders
        </Button>
      </Link>

      <div>
        <h1 className="text-4xl font-bold mb-2">{folder.name}</h1>
        {folder.description && (
          <p className="text-muted-foreground">{folder.description}</p>
        )}
        <p className="text-sm text-muted-foreground mt-2">
          {folder.studySets.length} study sets
        </p>
      </div>

      {folder.studySets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {folder.studySets.map((item) => (
            <Card key={item.studySet.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <span className="truncate">{item.studySet.title}</span>
                </CardTitle>
                {item.studySet.description && (
                  <CardDescription className="line-clamp-2">
                    {item.studySet.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {item.studySet.flashcards.length} cards
                  </span>
                  <Link href={`/sets/${item.studySet.id}`}>
                    <Button size="sm">Study</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              This folder is empty
            </p>
            <Link href="/dashboard">
              <Button>Go to Study Sets</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
