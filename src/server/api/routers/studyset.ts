import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { studySets, flashcards, folderStudySets, activities } from "~/server/db/schema";
import { eq, and, desc, or, like, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";

export const studySetRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.studySets.findMany({
      where: eq(studySets.userId, ctx.session.user.id),
      orderBy: [desc(studySets.updatedAt)],
      with: {
        flashcards: true,
        folders: {
          with: {
            folder: true,
          },
        },
      },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const studySet = await ctx.db.query.studySets.findFirst({
        where: and(
          eq(studySets.id, input.id),
          eq(studySets.userId, ctx.session.user.id)
        ),
        with: {
          user: true,
          flashcards: {
            orderBy: (flashcards, { asc }) => [asc(flashcards.order)],
          },
          folders: {
            with: {
              folder: true,
            },
          },
        },
      });

      if (!studySet) {
        throw new Error("Study set not found");
      }

      return studySet;
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().optional(),
        isPublic: z.boolean().optional().default(false),
        flashcards: z
          .array(
            z.object({
              term: z.string().min(1, "Term is required"),
              definition: z.string().min(1, "Definition is required"),
              image: z.string().optional(),
            })
          )
          .min(1, "At least one flashcard is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        console.log("Creating study set with input:", JSON.stringify(input, null, 2));
        const studySetId = nanoid();

        await ctx.db.insert(studySets).values({
          id: studySetId,
          title: input.title,
          description: input.description ?? "",
          isPublic: input.isPublic ?? false,
          userId: ctx.session.user.id,
        });

        console.log("Study set created, inserting flashcards...");
        
        await ctx.db.insert(flashcards).values(
          input.flashcards.map((card, index) => ({
            id: nanoid(),
            term: card.term,
            definition: card.definition,
            image: card.image,
            studySetId,
            order: index,
          }))
        );

        console.log("Flashcards inserted successfully");
        return { id: studySetId };
      } catch (error) {
        console.error("Create study set error:", error);
        throw error;
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1),
        description: z.string().optional(),
        isPublic: z.boolean().optional(),
        flashcards: z.array(
          z.object({
            id: z.string().optional(),
            term: z.string().min(1),
            definition: z.string().min(1),
            image: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log('UPDATE MUTATION - Input received:', {
        id: input.id,
        title: input.title,
        isPublic: input.isPublic,
        description: input.description?.substring(0, 50),
      });

      const studySet = await ctx.db.query.studySets.findFirst({
        where: and(
          eq(studySets.id, input.id),
          eq(studySets.userId, ctx.session.user.id)
        ),
      });

      if (!studySet) {
        throw new Error("Study set not found");
      }

      console.log('Current study set isPublic:', studySet.isPublic);
      console.log('New isPublic value:', input.isPublic);

      await ctx.db
        .update(studySets)
        .set({
          title: input.title,
          description: input.description,
          isPublic: input.isPublic,
          updatedAt: new Date(),
        })
        .where(eq(studySets.id, input.id));

      console.log('✅ Study set updated successfully');

      // Delete existing flashcards
      await ctx.db
        .delete(flashcards)
        .where(eq(flashcards.studySetId, input.id));

      // Insert new flashcards
      if (input.flashcards.length > 0) {
        await ctx.db.insert(flashcards).values(
          input.flashcards.map((card, index) => ({
            id: card.id || nanoid(),
            term: card.term,
            definition: card.definition,
            image: card.image,
            studySetId: input.id,
            order: index,
          }))
        );
      }

      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const studySet = await ctx.db.query.studySets.findFirst({
        where: and(
          eq(studySets.id, input.id),
          eq(studySets.userId, ctx.session.user.id)
        ),
      });

      if (!studySet) {
        throw new Error("Study set not found");
      }

      await ctx.db.delete(studySets).where(eq(studySets.id, input.id));

      return { success: true };
    }),

  combine: protectedProcedure
    .input(
      z.object({
        studySetIds: z.array(z.string()).length(2),
        title: z.string().min(1),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [set1, set2] = await Promise.all(
        input.studySetIds.map((id) =>
          ctx.db.query.studySets.findFirst({
            where: and(eq(studySets.id, id), eq(studySets.userId, ctx.session.user.id)),
            with: {
              flashcards: true,
            },
          })
        )
      );

      if (!set1 || !set2) {
        throw new Error("One or both study sets not found");
      }

      const newStudySetId = nanoid();

      await ctx.db.insert(studySets).values({
        id: newStudySetId,
        title: input.title,
        description: input.description,
        userId: ctx.session.user.id,
      });

      const allCards = [...set1.flashcards, ...set2.flashcards];
      
      if (allCards.length > 0) {
        await ctx.db.insert(flashcards).values(
          allCards.map((card, index) => ({
            id: nanoid(),
            term: card.term,
            definition: card.definition,
            studySetId: newStudySetId,
            order: index,
          }))
        );
      }

      return { id: newStudySetId };
    }),

  getPublic: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.studySets.findMany({
      where: eq(studySets.isPublic, true),
      orderBy: [desc(studySets.createdAt)],
      limit: 20,
      with: {
        user: true,
        flashcards: true,
      },
    });
  }),

  getPopular: protectedProcedure.query(async ({ ctx }) => {
    // Get all public study sets (including own sets)
    return ctx.db.query.studySets.findMany({  
      where: eq(studySets.isPublic, true),
      orderBy: [desc(studySets.createdAt)],
      limit: 8,
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            image: true,
          },
        },
        flashcards: {
          columns: {
            id: true,
          },
        },
      },
    });
  }),

  getRecent: protectedProcedure.query(async ({ ctx }) => {
    // Get recently accessed study sets based on activities
    const recentActivities = await ctx.db
      .select({ studySetId: activities.entityId })
      .from(activities)
      .where(
        and(
          eq(activities.userId, ctx.session.user.id),
          eq(activities.entityType, "studyset")
        )
      )
      .orderBy(desc(activities.createdAt))
      .limit(20);

    const studySetIds = recentActivities.map((a) => a.studySetId);

    if (studySetIds.length === 0) {
      // If no activities, return user's own study sets
      return ctx.db.query.studySets.findMany({
        where: eq(studySets.userId, ctx.session.user.id),
        orderBy: [desc(studySets.updatedAt)],
        limit: 8,
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              image: true,
            },
          },
          flashcards: {
            columns: {
              id: true,
            },
          },
        },
      });
    }

    return ctx.db.query.studySets.findMany({
      where: inArray(studySets.id, studySetIds),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            image: true,
          },
        },
        flashcards: {
          columns: {
            id: true,
          },
        },
      },
    });
  }),

  search: protectedProcedure
    .input(
      z.object({
        query: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!input.query.trim()) {
        return [];
      }

      const searchPattern = `%${input.query}%`;

      return ctx.db.query.studySets.findMany({
        where: and(
          eq(studySets.isPublic, true),
          or(
            like(studySets.title, searchPattern),
            like(studySets.description, searchPattern)
          )
        ),
        orderBy: [desc(studySets.createdAt)],
        limit: 20,
        with: {
          user: true,
          flashcards: true,
        },
      });
    }),

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.studySets.findMany({
      where: eq(studySets.isPublic, true),
      orderBy: [desc(studySets.createdAt)],
      limit: 8,
      with: {
        user: true,
        flashcards: true,
      },
    });
  }),

  getByIdPublic: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const studySet = await ctx.db.query.studySets.findFirst({
        where: eq(studySets.id, input.id),
        with: {
          user: true,
          flashcards: {
            orderBy: (flashcards, { asc }) => [asc(flashcards.order)],
          },
          folders: {
            with: {
              folder: true,
            },
          },
        },
      });

      if (!studySet) {
        throw new Error("Study set not found");
      }

      // Check if user has permission to view
      if (!studySet.isPublic && studySet.userId !== ctx.session.user.id) {
        throw new Error("You don't have permission to view this study set");
      }

      return studySet;
    }),

  logActivity: protectedProcedure
    .input(
      z.object({
        studySetId: z.string(),
        type: z.enum(["viewed", "studied", "completed"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get study set title
      const studySet = await ctx.db.query.studySets.findFirst({
        where: eq(studySets.id, input.studySetId),
      });

      if (!studySet) {
        throw new Error("Study set not found");
      }

      // Create activity
      await ctx.db.insert(activities).values({
        id: nanoid(),
        userId: ctx.session.user.id,
        type: input.type,
        entityType: "studyset",
        entityId: input.studySetId,
        entityTitle: studySet.title,
      });

      return { success: true };
    }),

  getStudyCount: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // Count unique users who have studied this set (from activities)
      const result = await ctx.db
        .select({ userId: activities.userId })
        .from(activities)
        .where(
          and(
            eq(activities.entityId, input.id),
            eq(activities.entityType, "studyset"),
            eq(activities.type, "studied")
          )
        )
        .groupBy(activities.userId);

      return result.length;
    }),
});
