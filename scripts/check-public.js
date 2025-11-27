const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'OurwingsDB',
  user: 'postgres',
  password: '1',
});

client.connect()
  .then(() => client.query('SELECT id, title, "isPublic" FROM "studySet"'))
  .then(result => {
    console.log('\n=== Current Study Sets ===\n');
    result.rows.forEach(set => {
      console.log(`📚 ${set.title}`);
      console.log(`   ID: ${set.id}`);
      console.log(`   Public: ${set.isPublic ? '✅ YES' : '❌ NO'}`);
      console.log('');
    });
    client.end();
  })
  .catch(err => {
    console.error('Error:', err.message);
    client.end();
  });
