const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'OurwingsDB',
  user: 'postgres',
  password: '1',
});

async function addPublicColumn() {
  try {
    await client.connect();
    console.log('Connected to database');

    await client.query(`
      ALTER TABLE "studySet" 
      ADD COLUMN IF NOT EXISTS "isPublic" boolean DEFAULT false
    `);

    console.log('✓ Column isPublic added successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

addPublicColumn();
