const db = require('../config/db');
const v = require('../utils/validate');
const { ok, fail } = require('../utils/response');

exports.me = async (req, res, next) => {
  try {
    const [rows] = await db.execute(`SELECT u.full_name, u.email, u.phone, p.dob, p.gender, p.address,
      p.city, p.state, p.pincode FROM users u LEFT JOIN user_profiles p ON p.user_id = u.id WHERE u.id = ?`,
      [req.user.id]);
    return rows.length ? ok(res, rows[0]) : fail(res, 'User not found', 404);
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const b = req.body, e = {};
    if (!v.text(b.full_name, 2, 100)) e.full_name = 'Enter your full name';
    if (!v.phone(b.phone)) e.phone = 'Enter a valid 10-digit mobile number';
    if (b.pincode && !/^\d{6}$/.test(b.pincode)) e.pincode = 'Pincode must be 6 digits';
    if (b.gender && !['Male', 'Female', 'Other'].includes(b.gender)) e.gender = 'Invalid';
    if (b.dob && !v.date(b.dob)) e.dob = 'Invalid date';
    if (Object.keys(e).length) return fail(res, 'Validation failed', 422, e);
    await db.execute('UPDATE users SET full_name = ?, phone = ? WHERE id = ?', [b.full_name.trim(), b.phone, req.user.id]);
    await db.execute(`UPDATE user_profiles SET dob = ?, gender = ?, address = ?, city = ?, state = ?, pincode = ?
      WHERE user_id = ?`, [b.dob || null, b.gender || null, b.address || null, b.city || null,
      b.state || null, b.pincode || null, req.user.id]);
    return ok(res, null, 'Profile saved');
  } catch (e) { next(e); }
};
