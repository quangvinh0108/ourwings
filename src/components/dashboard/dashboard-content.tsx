"use client";

import { api } from "~/trpc/react";
import { StudySetCard } from "~/components/dashboard/study-set-card";
import { StudySetSkeleton } from "~/components/dashboard/study-set-skeleton";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useState, useMemo, useCallback } from "react";
import { useDebounce } from "~/hooks/use-debounce";

export function DashboardContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  
  const { data: popularSets, isLoading: popularLoading } = api.studySet.getPopular.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });
  const { data: recentSets, isLoading: recentLoading } = api.studySet.getRecent.useQuery(undefined, {
    staleTime: 2 * 60 * 1000,
  });
  const { data: searchResults, isLoading: searchLoading } = api.studySet.search.useQuery(
    { query: debouncedSearch },
    { enabled: debouncedSearch.length > 0 }
  );

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-background border-b">
        <div className="container mx-auto px-4 py-24 text-center">
          <div className="mb-4">
            <span className="text-primary font-bold text-lg">OurWings</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Modern solution to
            <br />
            memorize everything
          </h1>
          <Link href="/create">
            <Button size="lg" className="mt-4">
              <Plus className="w-5 h-5 mr-2" />
              Create Study Set
            </Button>
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search study sets by title or description..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 h-12 text-lg"
            />
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="container mx-auto px-4 pb-12">
          <h2 className="text-2xl font-bold mb-6">
            Search Results {searchResults && `(${searchResults.length})`}
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {searchLoading ? (
              <>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-80">
                    <StudySetSkeleton />
                  </div>
                ))}
              </>
            ) : searchResults && searchResults.length > 0 ? (
              searchResults.map((set: typeof searchResults[number]) => (
                <div key={set.id} className="flex-shrink-0 w-80">
                  <StudySetCard studySet={set} showAuthor />
                </div>
              ))
            ) : (
              <div className="w-full text-center py-12 text-muted-foreground">
                No study sets found
              </div>
            )}
          </div>
        </div>
      )}

      {/* Popular Study Sets from Others */}
      {!searchQuery && (
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Study sets from other users</h2>
            <Link href="/explore">
              <Button variant="ghost" size="sm">
                See all
              </Button>
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {popularLoading ? (
              <>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-80">
                    <StudySetSkeleton />
                  </div>
                ))}
              </>
            ) : popularSets && popularSets.length > 0 ? (
              popularSets.map((set: typeof popularSets[number]) => (
                <div key={set.id} className="flex-shrink-0 w-80">
                  <StudySetCard studySet={set} showAuthor />
                </div>
              ))
            ) : (
              <div className="w-full text-center py-12 text-muted-foreground">
                No public study sets yet
              </div>
            )}
          </div>

          {/* Recently Interacted Study Sets */}
          <div className="flex items-center justify-between mb-6 mt-12">
            <h2 className="text-2xl font-bold">Recently interacted</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {recentLoading ? (
              <>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-80">
                    <StudySetSkeleton />
                  </div>
                ))}
              </>
            ) : recentSets && recentSets.length > 0 ? (
              recentSets.map((set: typeof recentSets[number]) => (
                <div key={set.id} className="flex-shrink-0 w-80">
                  <StudySetCard studySet={set} showAuthor />
                </div>
              ))
            ) : (
              <div className="w-full text-center py-12 text-muted-foreground">
                No recent study sets
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
