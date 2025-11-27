import { createTRPCRouter } from "~/server/api/trpc";
import { studySetRouter } from "./routers/studyset";
import { flashcardRouter } from "./routers/flashcard";
import { folderRouter } from "./routers/folder";
import { activityRouter } from "./routers/activity";
import { resultRouter } from "./routers/result";
import { reviewRouter } from "./routers/review";

export const appRouter = createTRPCRouter({
  studySet: studySetRouter,
  flashcard: flashcardRouter,
  folder: folderRouter,
  activity: activityRouter,
  result: resultRouter,
  review: reviewRouter,
});

export type AppRouter = typeof appRouter;
