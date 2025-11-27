-- Drop existing tables in correct order (children first)
DROP TABLE IF EXISTS "starredCard" CASCADE;
DROP TABLE IF EXISTS "folderStudySet" CASCADE;
DROP TABLE IF EXISTS "activity" CASCADE;
DROP TABLE IF EXISTS "flashcard" CASCADE;
DROP TABLE IF EXISTS "studySet" CASCADE;
DROP TABLE IF EXISTS "folder" CASCADE;
DROP TABLE IF EXISTS "session" CASCADE;
DROP TABLE IF EXISTS "account" CASCADE;
DROP TABLE IF EXISTS "verificationToken" CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;

-- Create user table first with default ID generation
CREATE TABLE IF NOT EXISTS "user" (
  "id" VARCHAR(255) PRIMARY KEY DEFAULT substring(md5(random()::text || clock_timestamp()::text) from 1 for 21),
  "name" VARCHAR(255),
  "email" VARCHAR(255) NOT NULL,
  "emailVerified" TIMESTAMP,
  "image" VARCHAR(255)
);

-- Create dependent tables
CREATE TABLE IF NOT EXISTS "account" (
  "userId" VARCHAR(255) NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "type" VARCHAR(255) NOT NULL,
  "provider" VARCHAR(255) NOT NULL,
  "providerAccountId" VARCHAR(255) NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" VARCHAR(255),
  "scope" VARCHAR(255),
  "id_token" TEXT,
  "session_state" VARCHAR(255),
  PRIMARY KEY ("provider", "providerAccountId")
);

CREATE TABLE IF NOT EXISTS "session" (
  "sessionToken" VARCHAR(255) PRIMARY KEY,
  "userId" VARCHAR(255) NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "expires" TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "verificationToken" (
  "identifier" VARCHAR(255) NOT NULL,
  "token" VARCHAR(255) NOT NULL,
  "expires" TIMESTAMP NOT NULL,
  PRIMARY KEY ("identifier", "token")
);

CREATE TABLE IF NOT EXISTS "folder" (
  "id" VARCHAR(255) PRIMARY KEY DEFAULT substring(md5(random()::text || clock_timestamp()::text) from 1 for 21),
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "userId" VARCHAR(255) NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "studySet" (
  "id" VARCHAR(255) PRIMARY KEY DEFAULT substring(md5(random()::text || clock_timestamp()::text) from 1 for 21),
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "userId" VARCHAR(255) NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "flashcard" (
  "id" VARCHAR(255) PRIMARY KEY DEFAULT substring(md5(random()::text || clock_timestamp()::text) from 1 for 21),
  "term" TEXT NOT NULL,
  "definition" TEXT NOT NULL,
  "studySetId" VARCHAR(255) NOT NULL REFERENCES "studySet"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "folderStudySet" (
  "folderId" VARCHAR(255) NOT NULL REFERENCES "folder"("id") ON DELETE CASCADE,
  "studySetId" VARCHAR(255) NOT NULL REFERENCES "studySet"("id") ON DELETE CASCADE,
  PRIMARY KEY ("folderId", "studySetId")
);

CREATE TABLE IF NOT EXISTS "starredCard" (
  "userId" VARCHAR(255) NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "flashcardId" VARCHAR(255) NOT NULL REFERENCES "flashcard"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY ("userId", "flashcardId")
);

CREATE TABLE IF NOT EXISTS "activity" (
  "id" VARCHAR(255) PRIMARY KEY DEFAULT substring(md5(random()::text || clock_timestamp()::text) from 1 for 21),
  "userId" VARCHAR(255) NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "type" VARCHAR(50) NOT NULL,
  "studySetId" VARCHAR(255) REFERENCES "studySet"("id") ON DELETE CASCADE,
  "folderId" VARCHAR(255) REFERENCES "folder"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP DEFAULT NOW()
);
