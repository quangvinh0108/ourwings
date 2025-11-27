import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { folders, folderStudySets } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

export const folderRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.folders.findMany({
      where: eq(folders.userId, ctx.session.user.id),
      with: {
        studySets: {
          with: {
            studySet: {
              with: {
                flashcards: true,
              },
            },
          },
        },
      },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const folder = await ctx.db.query.folders.findFirst({
        where: and(
          eq(folders.id, input.id),
          eq(folders.userId, ctx.session.user.id)
        ),
        with: {
          studySets: {
            with: {
              studySet: {
                with: {
                  flashcards: true,
                },
              },
            },
          },
        },
      });

      if (!folder) {
        throw new Error("Folder not found");
      }

      return folder;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const folderId = nanoid();

      await ctx.db.insert(folders).values({
        id: folderId,
        name: input.name,
        description: input.description,
        userId: ctx.session.user.id,
      });

      return { id: folderId };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const folder = await ctx.db.query.folders.findFirst({
        where: and(
          eq(folders.id, input.id),
          eq(folders.userId, ctx.session.user.id)
        ),
      });

      if (!folder) {
        throw new Error("Folder not found");
      }

      await ctx.db
        .update(folders)
        .set({
          name: input.name,
          description: input.description,
          updatedAt: new Date(),
        })
        .where(eq(folders.id, input.id));

      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const folder = await ctx.db.query.folders.findFirst({
        where: and(
          eq(folders.id, input.id),
          eq(folders.userId, ctx.session.user.id)
        ),
      });

      if (!folder) {
        throw new Error("Folder not found");
      }

      await ctx.db.delete(folders).where(eq(folders.id, input.id));

      return { success: true };
    }),

  addStudySet: protectedProcedure
    .input(
      z.object({
        folderId: z.string(),
        studySetId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.folderStudySets.findFirst({
        where: and(
          eq(folderStudySets.folderId, input.folderId),
          eq(folderStudySets.studySetId, input.studySetId)
        ),
      });

      if (existing) {
        throw new Error("Study set already in folder");
      }

      await ctx.db.insert(folderStudySets).values({
        folderId: input.folderId,
        studySetId: input.studySetId,
      });

      return { success: true };
    }),

  removeStudySet: protectedProcedure
    .input(
      z.object({
        folderId: z.string(),
        studySetId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(folderStudySets)
        .where(
          and(
            eq(folderStudySets.folderId, input.folderId),
            eq(folderStudySets.studySetId, input.studySetId)
          )
        );

      return { success: true };
    }),
});
