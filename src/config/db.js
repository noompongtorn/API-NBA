const { Pool } = require('pg');

// Create a new pool instance with PostgreSQL connection details
const pool = new Pool({
  user: 'nba',
  host: 'ygevo.myvnc.com',   // ✅ ใส่แค่ domain
  database: 'db_nba',
  password: 'db_nba',
  port: 5432,                // หรือพอร์ตที่ forward ไว้ เช่น 15432
});

// Function to connect to the PostgreSQL database
const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('PostgreSQL connected');
    client.release(); // Release the client back to the pool
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
};

module.exports = { pool, connectDB };
