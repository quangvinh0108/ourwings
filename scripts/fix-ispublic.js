const { Client } = require('pg');

async function fixIsPublic() {
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

    // Check if isPublic column exists
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'studySet' 
      AND column_name = 'isPublic'
    `);

    if (checkColumn.rows.length === 0) {
      console.log('isPublic column does not exist, creating...');
      
      // Add isPublic column with default false
      await client.query(`
        ALTER TABLE "studySet" 
        ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT false
      `);
      
      console.log('✅ isPublic column created successfully');
    } else {
      console.log('isPublic column already exists');
      
      // Check data type
      const columnInfo = await client.query(`
        SELECT data_type, column_default, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'studySet' 
        AND column_name = 'isPublic'
      `);
      
      console.log('Column info:', columnInfo.rows[0]);
      
      // If column exists but has wrong type or nullable, fix it
      if (columnInfo.rows[0].is_nullable === 'YES') {
        console.log('Fixing nullable constraint...');
        
        // First set all null values to false
        await client.query(`
          UPDATE "studySet" 
          SET "isPublic" = false 
          WHERE "isPublic" IS NULL
        `);
        
        // Then add NOT NULL constraint
        await client.query(`
          ALTER TABLE "studySet" 
          ALTER COLUMN "isPublic" SET NOT NULL
        `);
        
        console.log('✅ Fixed nullable constraint');
      }
      
      // Ensure default is set
      await client.query(`
        ALTER TABLE "studySet" 
        ALTER COLUMN "isPublic" SET DEFAULT false
      `);
      
      console.log('✅ Ensured default value is set');
    }

    // Show current state
    const count = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE "isPublic" = true) as public_count,
        COUNT(*) FILTER (WHERE "isPublic" = false) as private_count
      FROM "studySet"
    `);
    
    console.log('\nCurrent state:');
    console.log('Total study sets:', count.rows[0].total);
    console.log('Public:', count.rows[0].public_count);
    console.log('Private:', count.rows[0].private_count);

  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

fixIsPublic()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error.message);
    process.exit(1);
  });
