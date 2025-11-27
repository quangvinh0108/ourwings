"use client";

import { Card } from "~/components/ui/card";
import { formatDistanceToNow } from "date-fns";

interface Activity {
  id: string;
  type: string;
  entityType: string;
  entityTitle: string | null;
  createdAt: Date;
}

interface ActivityFeedProps {
  activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground text-center">No recent activity</p>
      </Card>
    );
  }

  const getActivityText = (activity: Activity) => {
    const actions: Record<string, string> = {
      created: "created",
      studied: "studied",
      completed: "completed",
    };

    return `${actions[activity.type] || activity.type} ${activity.entityType}`;
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="border-b pb-3 last:border-0">
            <p className="text-sm">
              {getActivityText(activity)}
              {activity.entityTitle && (
                <span className="font-semibold"> "{activity.entityTitle}"</span>
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDistanceToNow(new Date(activity.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
