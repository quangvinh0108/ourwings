import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { results } from "~/server/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { nanoid } from "nanoid";

export const resultRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        studySetId: z.string(),
        mode: z.enum(["flashcards", "learn", "test", "match"]),
        score: z.number(),
        totalQuestions: z.number(),
        timeSpent: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const resultId = nanoid();

      await ctx.db.insert(results).values({
        id: resultId,
        userId: ctx.session.user.id,
        studySetId: input.studySetId,
        mode: input.mode,
        score: input.score,
        totalQuestions: input.totalQuestions,
        timeSpent: input.timeSpent,
        completed: true,
      });

      return { id: resultId };
    }),

  getByUser: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.results.findMany({
      where: eq(results.userId, ctx.session.user.id),
      orderBy: [desc(results.createdAt)],
      limit: 50,
      with: {
        studySet: true,
      },
    });
  }),

  getByStudySet: protectedProcedure
    .input(z.object({ studySetId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.results.findMany({
        where: and(
          eq(results.studySetId, input.studySetId),
          eq(results.userId, ctx.session.user.id)
        ),
        orderBy: [desc(results.createdAt)],
        limit: 10,
      });
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const userResults = await ctx.db.query.results.findMany({
      where: eq(results.userId, ctx.session.user.id),
    });

    const totalTests = userResults.length;
    const averageScore =
      totalTests > 0
        ? userResults.reduce((sum, r) => sum + (r.score / r.totalQuestions) * 100, 0) /
          totalTests
        : 0;
    const totalTimeSpent = userResults.reduce((sum, r) => sum + (r.timeSpent || 0), 0);

    return {
      totalTests,
      averageScore: Math.round(averageScore),
      totalTimeSpent,
    };
  }),
});
