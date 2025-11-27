import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { reviews } from "~/server/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

export const reviewRouter = createTRPCRouter({
  // Get reviews for a study set with user info
  getByStudySet: protectedProcedure
    .input(z.object({ studySetId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.reviews.findMany({
        where: eq(reviews.studySetId, input.studySetId),
        orderBy: [desc(reviews.createdAt)],
        with: {
          user: true,
        },
      });
    }),

  // Get average rating for a study set
  getAverageRating: protectedProcedure
    .input(z.object({ studySetId: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select({
          averageRating: sql<number>`CAST(AVG(${reviews.rating}) AS FLOAT)`,
          totalReviews: sql<number>`COUNT(*)`,
        })
        .from(reviews)
        .where(eq(reviews.studySetId, input.studySetId));

      return {
        averageRating: result[0]?.averageRating ?? 0,
        totalReviews: Number(result[0]?.totalReviews ?? 0),
      };
    }),

  // Create or update review
  createOrUpdate: protectedProcedure
    .input(
      z.object({
        studySetId: z.string(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user already reviewed this study set
      const existingReview = await ctx.db.query.reviews.findFirst({
        where: and(
          eq(reviews.userId, ctx.session.user.id),
          eq(reviews.studySetId, input.studySetId)
        ),
      });

      if (existingReview) {
        // Update existing review
        await ctx.db
          .update(reviews)
          .set({
            rating: input.rating,
            comment: input.comment,
            updatedAt: new Date(),
          })
          .where(eq(reviews.id, existingReview.id));

        return { id: existingReview.id, isUpdate: true };
      } else {
        // Create new review
        const reviewId = nanoid();
        await ctx.db.insert(reviews).values({
          id: reviewId,
          userId: ctx.session.user.id,
          studySetId: input.studySetId,
          rating: input.rating,
          comment: input.comment,
        });

        return { id: reviewId, isUpdate: false };
      }
    }),

  // Delete review
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const review = await ctx.db.query.reviews.findFirst({
        where: and(
          eq(reviews.id, input.id),
          eq(reviews.userId, ctx.session.user.id)
        ),
      });

      if (!review) {
        throw new Error("Review not found or you don't have permission");
      }

      await ctx.db.delete(reviews).where(eq(reviews.id, input.id));

      return { success: true };
    }),

  // Get user's review for a study set
  getUserReview: protectedProcedure
    .input(z.object({ studySetId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.reviews.findFirst({
        where: and(
          eq(reviews.userId, ctx.session.user.id),
          eq(reviews.studySetId, input.studySetId)
        ),
      });
    }),
});
