// check-password.js - Run with: node check-password.js
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function checkPassword() {
  try {
    const db = await mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'alumni_db',
    });

    const username = 'nandhini'; // Change to your username
    const testPassword = 'newpass123'; // Change to password you're trying

    console.log('\n==================== DATABASE PASSWORD CHECK ====================');
    console.log('Checking username:', username);
    console.log('Testing password:', testPassword);
    
    const [users] = await db.query('SELECT id, username, email, password FROM alumni WHERE username = ?', [username]);
    
    if (users.length === 0) {
      console.log('❌ User not found!');
      return;
    }

    const user = users[0];
    console.log('\n✅ User found:');
    console.log('  ID:', user.id);
    console.log('  Username:', user.username);
    console.log('  Email:', user.email);
    console.log('  Password hash:', user.password);
    console.log('  Hash length:', user.password.length);
    console.log('  Hash type:', user.password.substring(0, 4));
    
    const isValid = await bcrypt.compare(testPassword, user.password);
    console.log('\n🔐 Password validation:', isValid ? '✅ MATCHES' : '❌ DOES NOT MATCH');
    
    // Try with trimmed password
    const isValidTrimmed = await bcrypt.compare(testPassword.trim(), user.password);
    console.log('🔐 Trimmed password:', isValidTrimmed ? '✅ MATCHES' : '❌ DOES NOT MATCH');
    
    console.log('==================== CHECK COMPLETE ====================\n');
    
    await db.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkPassword();