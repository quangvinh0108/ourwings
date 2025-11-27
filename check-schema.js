const postgres = require('postgres');

const sql = postgres('postgresql://postgres:1@localhost:5432/OurwingsDB');

async function checkSchema() {
  try {
    // Check flashcard table structure
    console.log('=== Flashcard Table Columns ===');
    const flashcardCols = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'flashcard'
      ORDER BY ordinal_position;
    `;
    console.log(flashcardCols);
    
    console.log('\n=== StudySet Table Columns ===');
    const studySetCols = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'studySet'
      ORDER BY ordinal_position;
    `;
    console.log(studySetCols);
    
    console.log('\n=== Folder Table Columns ===');
    const folderCols = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'folder'
      ORDER BY ordinal_position;
    `;
    console.log(folderCols);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sql.end();
  }
}

checkSchema();
