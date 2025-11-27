"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Plus, Folder, Trash2 } from "lucide-react";
import Link from "next/link";

export function FoldersView() {
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDesc, setNewFolderDesc] = useState("");

  const { data: folders, isLoading, refetch } = api.folder.getAll.useQuery();
  
  const createMutation = api.folder.create.useMutation({
    onSuccess: () => {
      setIsCreating(false);
      setNewFolderName("");
      setNewFolderDesc("");
      refetch();
    },
  });

  const deleteMutation = api.folder.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleCreate = () => {
    if (newFolderName.trim()) {
      createMutation.mutate({
        name: newFolderName,
        description: newFolderDesc || undefined,
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this folder?")) {
      deleteMutation.mutate({ id });
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Folders</h1>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Folder
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Folder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
              />
            </div>
            <div>
              <Label htmlFor="folder-desc">Description (Optional)</Label>
              <Textarea
                id="folder-desc"
                value={newFolderDesc}
                onChange={(e) => setNewFolderDesc(e.target.value)}
                placeholder="Enter description"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleCreate}
                disabled={createMutation.isPending || !newFolderName.trim()}
              >
                Create
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCreating(false);
                  setNewFolderName("");
                  setNewFolderDesc("");
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {folders && folders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {folders.map((folder) => (
            <Card key={folder.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Folder className="w-5 h-5 text-primary" />
                    <span className="truncate">{folder.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(folder.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardTitle>
                {folder.description && (
                  <CardDescription className="line-clamp-2">
                    {folder.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {folder.studySets.length} study sets
                  </span>
                  <Link href={`/folders/${folder.id}`}>
                    <Button size="sm">View</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Folder className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              You don't have any folders yet
            </p>
            <Button onClick={() => setIsCreating(true)}>
              Create your first folder
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
