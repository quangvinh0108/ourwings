const postgres = require('postgres');
const fs = require('fs');

const sql = postgres('postgresql://postgres:1@localhost:5432/OurwingsDB');

async function migrate() {
  try {
    const migrationSQL = fs.readFileSync('./fix-user-id.sql', 'utf8');
    
    // Execute as a single transaction
    console.log('Executing migration...');
    await sql.unsafe(migrationSQL);
    
    console.log('✓ Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    await sql.end();
  }
}

migrate();
