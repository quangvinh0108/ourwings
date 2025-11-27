const postgres = require('postgres');

const sql = postgres('postgresql://postgres:1@localhost:5432/OurwingsDB');

async function fixSchema() {
  try {
    console.log('Adding missing columns to flashcard table...');
    await sql`ALTER TABLE "flashcard" ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0`;
    await sql`ALTER TABLE "flashcard" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP DEFAULT NOW()`;
    
    console.log('Fixing folder table columns...');
    // Check if we need to rename 'title' to 'name'
    const folderCols = await sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'folder' AND column_name = 'title'
    `;
    
    if (folderCols.length > 0) {
      await sql`ALTER TABLE "folder" RENAME COLUMN "title" TO "name"`;
      console.log('Renamed folder.title to folder.name');
    }
    
    await sql`ALTER TABLE "folder" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP DEFAULT NOW()`;
    
    console.log('✓ Schema fixed successfully!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sql.end();
  }
}

fixSchema();
