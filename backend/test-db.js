require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
    try {
        console.log('Testing database connection...');
        console.log('Database config:', {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            database: process.env.DB_NAME
        });

        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'alumni_db'
        });

        console.log('Connected to database successfully!');

        // Check if alumni table exists
        const [tables] = await connection.execute('SHOW TABLES LIKE "alumni"');
        if (tables.length === 0) {
            console.log('❌ Alumni table not found!');
        } else {
            console.log('✅ Alumni table exists');
            const [rows] = await connection.execute('SELECT COUNT(*) as count FROM alumni');
            console.log(`Found ${rows[0].count} records in alumni table`);
        }

        await connection.end();
    } catch (err) {
        console.error('Database connection error:', err);
    }
}

testConnection();