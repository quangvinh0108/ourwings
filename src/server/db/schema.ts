import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";
import { nanoid } from "nanoid";

// Users table (NextAuth)
export const users = pgTable("user", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => nanoid()),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: varchar("image", { length: 255 }),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  studySets: many(studySets),
  folders: many(folders),
  starredCards: many(starredCards),
  activities: many(activities),
  results: many(results),
  reviews: many(reviews),
}));

export const accounts = pgTable(
  "account",
  {
    userId: varchar("userId", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = pgTable("session", {
  sessionToken: varchar("sessionToken", { length: 255 }).notNull().primaryKey(),
  userId: varchar("userId", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// Folders
export const folders = pgTable("folder", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  userId: varchar("userId", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
});

export const foldersRelations = relations(folders, ({ one, many }) => ({
  user: one(users, { fields: [folders.userId], references: [users.id] }),
  studySets: many(folderStudySets),
}));

// Study Sets
export const studySets = pgTable("studySet", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  isPublic: boolean("isPublic").notNull().default(false),
  userId: varchar("userId", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
});

export const studySetsRelations = relations(studySets, ({ one, many }) => ({
  user: one(users, { fields: [studySets.userId], references: [users.id] }),
  flashcards: many(flashcards),
  folders: many(folderStudySets),
  reviews: many(reviews),
}));

// Flashcards
export const flashcards = pgTable("flashcard", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  term: text("term").notNull(),
  definition: text("definition").notNull(),
  image: text("image"), // URL or base64 image
  studySetId: varchar("studySetId", { length: 255 })
    .notNull()
    .references(() => studySets.id, { onDelete: "cascade" }),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
});

export const flashcardsRelations = relations(flashcards, ({ one, many }) => ({
  studySet: one(studySets, {
    fields: [flashcards.studySetId],
    references: [studySets.id],
  }),
  starredBy: many(starredCards),
}));

// Folder to StudySet relationship (many-to-many)
export const folderStudySets = pgTable(
  "folderStudySet",
  {
    folderId: varchar("folderId", { length: 255 })
      .notNull()
      .references(() => folders.id, { onDelete: "cascade" }),
    studySetId: varchar("studySetId", { length: 255 })
      .notNull()
      .references(() => studySets.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.folderId, table.studySetId] }),
  })
);

export const folderStudySetsRelations = relations(
  folderStudySets,
  ({ one }) => ({
    folder: one(folders, {
      fields: [folderStudySets.folderId],
      references: [folders.id],
    }),
    studySet: one(studySets, {
      fields: [folderStudySets.studySetId],
      references: [studySets.id],
    }),
  })
);

// Starred Cards
export const starredCards = pgTable(
  "starredCard",
  {
    userId: varchar("userId", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    flashcardId: varchar("flashcardId", { length: 255 })
      .notNull()
      .references(() => flashcards.id, { onDelete: "cascade" }),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.flashcardId] }),
  })
);

export const starredCardsRelations = relations(starredCards, ({ one }) => ({
  user: one(users, {
    fields: [starredCards.userId],
    references: [users.id],
  }),
  flashcard: one(flashcards, {
    fields: [starredCards.flashcardId],
    references: [flashcards.id],
  }),
}));

// User Activities
export const activities = pgTable("activity", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  userId: varchar("userId", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(), // 'created', 'studied', 'completed'
  entityType: varchar("entityType", { length: 50 }).notNull(), // 'studyset', 'flashcard', 'test'
  entityId: varchar("entityId", { length: 255 }).notNull(),
  entityTitle: varchar("entityTitle", { length: 255 }),
  metadata: text("metadata"), // JSON string for additional data
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, { fields: [activities.userId], references: [users.id] }),
}));

// Results
export const results = pgTable("result", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  userId: varchar("userId", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  studySetId: varchar("studySetId", { length: 255 })
    .notNull()
    .references(() => studySets.id, { onDelete: "cascade" }),
  mode: varchar("mode", { length: 50 }).notNull(), // 'flashcards', 'learn', 'test', 'match'
  score: integer("score").notNull(),
  totalQuestions: integer("totalQuestions").notNull(),
  timeSpent: integer("timeSpent"), // in seconds
  completed: boolean("completed").notNull().default(true),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

export const resultsRelations = relations(results, ({ one }) => ({
  user: one(users, { fields: [results.userId], references: [users.id] }),
  studySet: one(studySets, { fields: [results.studySetId], references: [studySets.id] }),
}));

// Reviews
export const reviews = pgTable("review", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  userId: varchar("userId", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  studySetId: varchar("studySetId", { length: 255 })
    .notNull()
    .references(() => studySets.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
});

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
  studySet: one(studySets, { fields: [reviews.studySetId], references: [studySets.id] }),
}));

