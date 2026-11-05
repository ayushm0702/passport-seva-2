require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('../config/db');

(async () => {
  const h = await bcrypt.hash('Demo@1234', 10);
  await db.execute('INSERT IGNORE INTO admin_users (email, password_hash, full_name) VALUES (?,?,?)',
    ['admin@demo.in', h, 'Demo Administrator']);
  await db.execute('INSERT IGNORE INTO officer_users (email, password_hash, full_name, employee_code) VALUES (?,?,?,?)',
    ['officer@demo.in', h, 'Demo Verification Officer', 'VO001']);
  await db.execute('INSERT IGNORE INTO users (email, password_hash, full_name, phone) VALUES (?,?,?,?)',
    ['citizen@demo.in', h, 'Aarav Sharma', '9876543210']);
  console.log('Seeded. Password for all demo accounts: Demo@1234');
  process.exit(0);
})();
