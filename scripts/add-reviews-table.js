const { Client } = require('pg');

async function addReviewsTable() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'OurwingsDB',
    user: 'postgres',
    password: '1',
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Create reviews table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "review" (
        "id" VARCHAR(255) PRIMARY KEY,
        "userId" VARCHAR(255) NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "studySetId" VARCHAR(255) NOT NULL REFERENCES "studySet"("id") ON DELETE CASCADE,
        "rating" INTEGER NOT NULL CHECK ("rating" >= 1 AND "rating" <= 5),
        "comment" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    console.log('✅ Reviews table created successfully');

    // Create index for better query performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS "review_studySetId_idx" ON "review"("studySetId")
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS "review_userId_idx" ON "review"("userId")
    `);

    console.log('✅ Indexes created successfully');

    // Check current state
    const count = await client.query('SELECT COUNT(*) FROM "review"');
    console.log('\nCurrent reviews count:', count.rows[0].count);

  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

addReviewsTable()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error.message);
    process.exit(1);
  });
