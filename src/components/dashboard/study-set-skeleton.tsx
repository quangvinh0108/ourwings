import { Card, CardContent, CardHeader } from "~/components/ui/card";

export function StudySetSkeleton() {
  return (
    <Card className="group relative overflow-hidden border-2 border-transparent hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 animate-pulse">
      <CardHeader className="space-y-3">
        <div className="h-6 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-5/6" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-muted rounded-full" />
          <div className="h-4 bg-muted rounded w-24" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 bg-muted rounded flex-1" />
          <div className="h-9 bg-muted rounded w-9" />
        </div>
      </CardContent>
    </Card>
  );
}

export function StudySetGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <StudySetSkeleton key={i} />
      ))}
    </>
  );
}
