import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { starredCards } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";

export const flashcardRouter = createTRPCRouter({
  toggleStar: protectedProcedure
    .input(z.object({ flashcardId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.starredCards.findFirst({
        where: and(
          eq(starredCards.userId, ctx.session.user.id),
          eq(starredCards.flashcardId, input.flashcardId)
        ),
      });

      if (existing) {
        await ctx.db
          .delete(starredCards)
          .where(
            and(
              eq(starredCards.userId, ctx.session.user.id),
              eq(starredCards.flashcardId, input.flashcardId)
            )
          );
        return { starred: false };
      } else {
        await ctx.db.insert(starredCards).values({
          userId: ctx.session.user.id,
          flashcardId: input.flashcardId,
        });
        return { starred: true };
      }
    }),

  getStarred: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.starredCards.findMany({
      where: eq(starredCards.userId, ctx.session.user.id),
      with: {
        flashcard: {
          with: {
            studySet: true,
          },
        },
      },
    });
  }),
});
