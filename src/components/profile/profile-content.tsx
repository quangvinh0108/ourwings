"use client";

import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { StudySetCard } from "~/components/dashboard/study-set-card";
import { BookOpen, Trophy, Clock, Target } from "lucide-react";

export function ProfileContent() {
  const { data: session } = useSession();
  const { data: studySets } = api.studySet.getAll.useQuery();
  const { data: results } = api.result.getByUser.useQuery();
  const { data: stats } = api.result.getStats.useQuery();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={session?.user?.image || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-3xl">
                {session?.user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">{session?.user?.name}</h1>
              <p className="text-muted-foreground mb-4">{session?.user?.email}</p>
              
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center md:text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                    <span className="text-2xl font-bold">{studySets?.length || 0}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Study Sets</p>
                </div>
                
                <div className="text-center md:text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className="text-2xl font-bold">{stats?.totalTests || 0}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Tests Taken</p>
                </div>
                
                <div className="text-center md:text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-green-500" />
                    <span className="text-2xl font-bold">{stats?.averageScore || 0}%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Avg Score</p>
                </div>
                
                <div className="text-center md:text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <span className="text-2xl font-bold">
                      {Math.floor((stats?.totalTimeSpent || 0) / 60)}m
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Study Time</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="sets" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="sets">My Study Sets</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="sets" className="space-y-4">
          {studySets && studySets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {studySets.map((set) => (
                <StudySetCard key={set.id} studySet={set} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No study sets yet
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {results && results.length > 0 ? (
            <div className="space-y-3">
              {results.map((result) => (
                <Card key={result.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{result.studySet?.title}</CardTitle>
                        <CardDescription>
                          {result.mode.charAt(0).toUpperCase() + result.mode.slice(1)} Mode
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {Math.round((result.score / result.totalQuestions) * 100)}%
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {result.score}/{result.totalQuestions}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {result.timeSpent ? `${Math.floor(result.timeSpent / 60)}m ${result.timeSpent % 60}s` : 'N/A'}
                      </div>
                      <div>
                        {new Date(result.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No test results yet. Complete a test to see your results here!
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
