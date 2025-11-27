const postgres = require('postgres');

const sql = postgres('postgresql://postgres:1@localhost:5432/OurwingsDB');

async function fixActivityTable() {
  try {
    console.log('Checking activity table structure...');
    const cols = await sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'activity'
      ORDER BY ordinal_position
    `;
    console.log('Current columns:', cols.map(c => c.column_name));
    
    // Drop old table and recreate with new schema
    console.log('\nRecreating activity table...');
    await sql`DROP TABLE IF EXISTS "activity" CASCADE`;
    
    await sql`
      CREATE TABLE "activity" (
        "id" VARCHAR(255) PRIMARY KEY DEFAULT substring(md5(random()::text || clock_timestamp()::text) from 1 for 21),
        "userId" VARCHAR(255) NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "type" VARCHAR(50) NOT NULL,
        "entityType" VARCHAR(50) NOT NULL,
        "entityId" VARCHAR(255) NOT NULL,
        "entityTitle" VARCHAR(255),
        "metadata" TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW()
      )
    `;
    
    console.log('✓ Activity table recreated successfully!');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sql.end();
  }
}

fixActivityTable();
