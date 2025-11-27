const postgres = require('postgres');
const { nanoid } = require('nanoid');

const sql = postgres('postgresql://postgres:1@localhost:5432/OurwingsDB');

async function testInsert() {
  try {
    // Get a user ID first
    const users = await sql`SELECT id FROM "user" LIMIT 1`;
    if (users.length === 0) {
      console.log('No users found in database');
      return;
    }
    
    const userId = users[0].id;
    console.log('Using user ID:', userId);
    
    // Try to insert a study set
    const studySetId = nanoid();
    console.log('Creating study set with ID:', studySetId);
    
    await sql`
      INSERT INTO "studySet" (id, title, description, "userId")
      VALUES (${studySetId}, 'Test Study Set', 'Test description', ${userId})
    `;
    
    console.log('✓ Study set created successfully!');
    
    // Insert some flashcards
    const flashcard1Id = nanoid();
    const flashcard2Id = nanoid();
    
    await sql`
      INSERT INTO "flashcard" (id, term, definition, "studySetId", "order")
      VALUES 
        (${flashcard1Id}, 'term1', 'def1', ${studySetId}, 0),
        (${flashcard2Id}, 'term2', 'def2', ${studySetId}, 1)
    `;
    
    console.log('✓ Flashcards created successfully!');
    
    // Verify
    const result = await sql`
      SELECT * FROM "studySet" WHERE id = ${studySetId}
    `;
    console.log('Created study set:', result[0]);
    
    const cards = await sql`
      SELECT * FROM "flashcard" WHERE "studySetId" = ${studySetId}
    `;
    console.log('Created flashcards:', cards);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await sql.end();
  }
}

testInsert();
