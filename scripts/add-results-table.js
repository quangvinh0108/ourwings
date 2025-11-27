const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'OurwingsDB',
  user: 'postgres',
  password: '1',
});

async function createResultsTable() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Create results table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "result" (
        "id" VARCHAR(255) PRIMARY KEY,
        "userId" VARCHAR(255) NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "studySetId" VARCHAR(255) NOT NULL REFERENCES "studySet"("id") ON DELETE CASCADE,
        "mode" VARCHAR(50) NOT NULL,
        "score" INTEGER NOT NULL,
        "totalQuestions" INTEGER NOT NULL,
        "timeSpent" INTEGER,
        "completed" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('✓ Results table created successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

createResultsTable();
