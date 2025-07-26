const { Client } = require('pg');

// Database connection configuration
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'nba',
    password: 'postgres',
    port: 5432, // Adjust if your PostgreSQL uses a different port
});

const dropAllTables = async () => {
    try {
        // Connect to the database
        await client.connect();
        console.log('Connected to the database.');

        // Fetch all table names from the current schema
        const result = await client.query(`
            SELECT tablename
            FROM pg_catalog.pg_tables
            WHERE schemaname = 'public';
        `);

        const tables = result.rows.map(row => row.tablename);

        if (tables.length === 0) {
            console.log('No tables found in the database.');
        } else {
            // Generate and execute DROP TABLE statements for all tables
            const dropStatements = tables.map(table => `DROP TABLE IF EXISTS "${table}" CASCADE;`).join('\n');
            await client.query(dropStatements);
            console.log('All tables dropped successfully.');
        }
    } catch (err) {
        console.error('Error dropping tables:', err);
    } finally {
        // Close the database connection
        await client.end();
        console.log('Database connection closed.');
    }
};

// Run the function
dropAllTables();
