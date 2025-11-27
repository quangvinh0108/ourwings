const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'OurwingsDB',
  user: 'postgres',
  password: '1',
});

async function addImageColumn() {
  try {
    await client.connect();
    console.log('Connected to database');

    await client.query(`
      ALTER TABLE "flashcard" 
      ADD COLUMN IF NOT EXISTS "image" TEXT
    `);

    console.log('✓ Image column added to flashcard table');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

addImageColumn();
