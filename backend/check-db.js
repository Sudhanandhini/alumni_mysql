const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabase() {
    try {
        console.log('Checking database connection...');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Connected to MySQL database');
        
        // Check if alumni table exists
        const [tables] = await connection.query('SHOW TABLES LIKE "alumni"');
        if (tables.length === 0) {
            console.log('❌ Alumni table does not exist!');
            console.log('Creating alumni table...');
            
            // Create the alumni table
            await connection.query(`
                CREATE TABLE alumni (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    phone VARCHAR(20),
                    gender VARCHAR(10),
                    dob DATE,
                    batch VARCHAR(10),
                    department VARCHAR(100),
                    address TEXT,
                    photo VARCHAR(255),
                    linkedin VARCHAR(255),
                    bio TEXT,
                    current_status VARCHAR(50),
                    organization_name VARCHAR(255),
                    designation VARCHAR(255),
                    industry VARCHAR(255),
                    work_location VARCHAR(255),
                    experience_years INT,
                    skills TEXT,
                    achievements TEXT,
                    higher_education TEXT,
                    institution VARCHAR(255),
                    username VARCHAR(50) UNIQUE,
                    password VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('✅ Alumni table created successfully!');
        } else {
            console.log('✅ Alumni table exists');
            const [count] = await connection.query('SELECT COUNT(*) as count FROM alumni');
            console.log(`Found ${count[0].count} records in alumni table`);
        }

        await connection.end();
    } catch (error) {
        console.error('Database Error:', error.message);
        if (error.message.includes("ER_NO_SUCH_TABLE")) {
            console.log('The alumni table does not exist. Please create it.');
        } else if (error.message.includes("ER_BAD_DB_ERROR")) {
            console.log('The database does not exist. Please create it first.');
        }
    }
}

checkDatabase();