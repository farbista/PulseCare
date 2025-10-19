// test-db.js
async function testConnection() {
  const { Pool } = await import('pg');
  
  const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_F8b7MTjVPSQd@ep-blue-smoke-a1s439xu-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'
  });

  try {
    console.log('Testing database connection...');
    const result = await pool.query('SELECT NOW()');
    console.log('Connection successful!');
    console.log('Current time:', result.rows[0].now);
    
    // Test a simple query
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    console.log('Total users in database:', userCount.rows[0].count);
    
  } catch (error) {
    console.error('Connection failed:', error.message);
  } finally {
    await pool.end();
  }
}

testConnection();