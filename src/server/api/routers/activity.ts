import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { activities } from "~/server/db/schema";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

export const activityRouter = createTRPCRouter({
  getRecent: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(10),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.query.activities.findMany({
        where: eq(activities.userId, ctx.session.user.id),
        orderBy: [desc(activities.createdAt)],
        limit: input?.limit ?? 10,
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        type: z.enum(["created", "studied", "completed"]),
        entityType: z.enum(["studyset", "flashcard", "test"]),
        entityId: z.string(),
        entityTitle: z.string().optional(),
        metadata: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const activityId = nanoid();

      await ctx.db.insert(activities).values({
        id: activityId,
        userId: ctx.session.user.id,
        type: input.type,
        entityType: input.entityType,
        entityId: input.entityId,
        entityTitle: input.entityTitle,
        metadata: input.metadata,
      });

      return { id: activityId };
    }),
});
