const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const v = require('../utils/validate');
const { ok, fail } = require('../utils/response');

const TABLES = { citizen: 'users', admin: 'admin_users', officer: 'officer_users' };
const sign = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '8h' });

exports.register = async (req, res, next) => {
  try {
    const { full_name, email, phone, password } = req.body;
    const errors = {};
    if (!v.text(full_name, 2, 100)) errors.full_name = 'Enter your full name';
    if (!v.email(email)) errors.email = 'Enter a valid email';
    if (!v.phone(phone)) errors.phone = 'Enter a valid 10-digit mobile number';
    if (!v.password(password)) errors.password = 'Minimum 8 characters with letters and numbers';
    if (Object.keys(errors).length) return fail(res, 'Validation failed', 422, errors);

    const [dup] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (dup.length) return fail(res, 'Email already registered', 409);

    const hash = await bcrypt.hash(password, 10);
    const [r] = await db.execute(
      'INSERT INTO users (email, password_hash, full_name, phone) VALUES (?,?,?,?)',
      [email, hash, full_name.trim(), phone]);
    await db.execute('INSERT INTO user_profiles (user_id) VALUES (?)', [r.insertId]);
    await db.execute('INSERT INTO notifications (user_id, title, message) VALUES (?,?,?)',
      [r.insertId, 'Welcome', 'Your account has been created. You can now start an application.']);
    return ok(res, { token: sign(r.insertId, 'citizen') }, 'Registered', 201);
  } catch (e) { next(e); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password, role = 'citizen' } = req.body;
    const table = TABLES[role];
    if (!table || !v.email(email) || typeof password !== 'string')
      return fail(res, 'Invalid credentials', 401);
    const [rows] = await db.execute(`SELECT * FROM ${table} WHERE email = ?`, [email]);
    const u = rows[0];
    if (!u || u.is_active === 0 || !(await bcrypt.compare(password, u.password_hash)))
      return fail(res, 'Invalid credentials', 401);
    return ok(res, { token: sign(u.id, role), user: { id: u.id, name: u.full_name, role } }, 'Login successful');
  } catch (e) { next(e); }
};
