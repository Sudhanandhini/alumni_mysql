// test-password.js
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function testPassword() {
  const db = await mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'alumni_db',
  });

  const email = 'sudhanandhini@sunsys.in'; // Search by email
  const testPassword = '123456789'; // Replace with the password you just set

  console.log('\n========== PASSWORD TEST ==========');
  console.log('Testing email:', email);
  
  const [users] = await db.query('SELECT id, username, email, name, password FROM alumni WHERE email = ?', [email]);
  
  if (users.length === 0) {
    console.log('❌ User not found');
    await db.end();
    return;
  }

  const user = users[0];
  console.log('✅ User found:');
  console.log('  ID:', user.id);
  console.log('  Name:', user.name);
  console.log('  Username:', user.username === null || user.username === '' ? '⚠️  NULL/EMPTY!' : user.username);
  console.log('  Email:', user.email);
  console.log('  Password hash:', user.password.substring(0, 40) + '...');
  
  const passwordMatch = await bcrypt.compare(testPassword, user.password);
  console.log('\n🔐 Password test result:', passwordMatch ? '✅ CORRECT PASSWORD!' : '❌ WRONG PASSWORD!');
  
  if (!user.username || user.username === '') {
    console.log('\n⚠️  PROBLEM FOUND: Username is NULL/EMPTY!');
    console.log('This user cannot login because they have no username!');
    console.log('\n🔧 SOLUTION: Set a username for this account');
  }
  
  if (passwordMatch) {
    console.log('\n✅ The password WAS saved correctly in the database!');
    if (user.username) {
      console.log('You can login with:');
      console.log('   Username:', user.username);
      console.log('   Password:', testPassword);
    }
  }
  
  console.log('========== TEST COMPLETE ==========\n');
  
  await db.end();
}

testPassword().catch(console.error);