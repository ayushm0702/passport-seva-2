const db = require('../config/db');
const v = require('../utils/validate');
const { tx, setStatus } = require('../utils/workflow');
const { ok, fail } = require('../utils/response');

const STATUSES = ['Draft', 'Submitted', 'Appointment Scheduled', 'Under Verification', 'Documents Required',
  'Verification Completed', 'Approved (Simulated)', 'Rejected (Simulated)'];

exports.users = async (req, res, next) => {
  try {
    const q = `%${String(req.query.q || '').slice(0, 50)}%`;
    const [rows] = await db.execute(`SELECT id, full_name, email, phone, is_active, created_at
      FROM users WHERE full_name LIKE ? OR email LIKE ? ORDER BY created_at DESC LIMIT 200`, [q, q]);
    return ok(res, rows);
  } catch (e) { next(e); }
};

exports.setUserActive = async (req, res, next) => {
  try {
    const [r] = await db.execute('UPDATE users SET is_active = ? WHERE id = ?',
      [req.body.is_active ? 1 : 0, req.params.id]);
    return r.affectedRows ? ok(res, null, 'User updated') : fail(res, 'User not found', 404);
  } catch (e) { next(e); }
};

exports.applications = async (req, res, next) => {
  try {
    const where = [], params = [];
    if (req.query.status) {
      if (!STATUSES.includes(req.query.status)) return fail(res, 'Unknown status', 422);
      where.push('p.status = ?'); params.push(req.query.status);
    }
    if (req.query.q) {
      where.push('(p.reference_no LIKE ? OR p.given_name LIKE ? OR p.surname LIKE ?)');
      const q = `%${String(req.query.q).slice(0, 50)}%`; params.push(q, q, q);
    }
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    const [rows] = await db.execute(`SELECT p.id, p.reference_no, p.given_name, p.surname, p.application_type,
      p.service_mode, p.status, p.submitted_at, o.full_name AS officer
      FROM passport_applications p LEFT JOIN officer_users o ON o.id = p.officer_id
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY p.created_at DESC LIMIT ${limit} OFFSET ${offset}`, params);
    return ok(res, rows);
  } catch (e) { next(e); }
};

exports.officers = async (req, res, next) => {
  try {
    const [rows] = await db.execute('SELECT id, full_name, employee_code FROM officer_users');
    return ok(res, rows);
  } catch (e) { next(e); }
};

exports.assign = async (req, res, next) => {
  try {
    const code = await tx(async conn => {
      const [off] = await conn.execute('SELECT id FROM officer_users WHERE id = ?', [req.body.officer_id]);
      const [app] = await conn.execute('SELECT status FROM passport_applications WHERE id = ?', [req.params.id]);
      if (!off.length || !app.length) return 404;
      if (!['Submitted', 'Appointment Scheduled', 'Documents Required'].includes(app[0].status)) return 409;
      await conn.execute('UPDATE passport_applications SET officer_id = ? WHERE id = ?', [off[0].id, req.params.id]);
      await setStatus(conn, req.params.id, 'Under Verification', 'admin', req.user.id, 'Assigned to verification officer');
      return 200;
    });
    if (code === 404) return fail(res, 'Application or officer not found', 404);
    if (code === 409) return fail(res, 'Application cannot be assigned in its current status', 409);
    return ok(res, null, 'Officer assigned');
  } catch (e) { next(e); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const allowed = ['Under Verification', 'Documents Required', 'Approved (Simulated)', 'Rejected (Simulated)'];
    if (!allowed.includes(status)) return fail(res, 'Status not allowed', 422);
    const code = await tx(async conn => {
      const [app] = await conn.execute('SELECT status FROM passport_applications WHERE id = ?', [req.params.id]);
      if (!app.length) return 404;
      const final = status.includes('Simulated');
      if (final && app[0].status !== 'Verification Completed') return 409;
      await setStatus(conn, req.params.id, status, 'admin', req.user.id,
        (String(note || '') || (final ? 'Simulated decision for academic demo' : '')).slice(0, 255));
      return 200;
    });
    if (code === 404) return fail(res, 'Application not found', 404);
    if (code === 409) return fail(res, 'Approve or reject only after verification is completed', 409);
    return ok(res, null, 'Status updated');
  } catch (e) { next(e); }
};

exports.addSlot = async (req, res, next) => {
  try {
    const { slot_date, slot_time, center } = req.body;
    if (!v.date(slot_date) || !/^\d{2}:\d{2}$/.test(slot_time || '') || !v.text(center, 3, 80))
      return fail(res, 'Provide slot_date, slot_time (HH:MM) and center', 422);
    await db.execute('INSERT INTO appointments (slot_date, slot_time, center) VALUES (?,?,?)',
      [slot_date, slot_time, center.trim()]);
    return ok(res, null, 'Slot added', 201);
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return fail(res, 'That slot already exists', 409);
    next(e);
  }
};

exports.deleteSlot = async (req, res, next) => {
  try {
    const [r] = await db.execute('DELETE FROM appointments WHERE id = ? AND application_id IS NULL', [req.params.id]);
    return r.affectedRows ? ok(res, null, 'Slot removed') : fail(res, 'Slot not found or already booked', 404);
  } catch (e) { next(e); }
};

exports.stats = async (req, res, next) => {
  try {
    const one = async (sql) => (await db.execute(sql))[0][0].n;
    const [users, total, pending, verifying, completed, today] = await Promise.all([
      one('SELECT COUNT(*) n FROM users'),
      one("SELECT COUNT(*) n FROM passport_applications WHERE status <> 'Draft'"),
      one("SELECT COUNT(*) n FROM passport_applications WHERE status IN ('Submitted','Appointment Scheduled','Documents Required')"),
      one("SELECT COUNT(*) n FROM passport_applications WHERE status = 'Under Verification'"),
      one("SELECT COUNT(*) n FROM passport_applications WHERE status IN ('Verification Completed','Approved (Simulated)','Rejected (Simulated)')"),
      one('SELECT COUNT(*) n FROM appointments WHERE slot_date = CURDATE() AND application_id IS NOT NULL')
    ]);
    const [monthly] = await db.execute(`SELECT DATE_FORMAT(submitted_at, '%Y-%m') AS month, COUNT(*) AS total
      FROM passport_applications WHERE submitted_at IS NOT NULL
      GROUP BY month ORDER BY month DESC LIMIT 12`);
    const [byStatus] = await db.execute('SELECT status, COUNT(*) AS total FROM passport_applications GROUP BY status');
    return ok(res, { users, total, pending, verifying, completed, today, monthly: monthly.reverse(), byStatus });
  } catch (e) { next(e); }
};

exports.slots = async (req, res, next) => {
  try {
    const [rows] = await db.execute(`SELECT a.id, a.slot_date, a.slot_time, a.center, p.reference_no
      FROM appointments a LEFT JOIN passport_applications p ON p.id = a.application_id
      ORDER BY a.slot_date, a.slot_time LIMIT 300`);
    return ok(res, rows);
  } catch (e) { next(e); }
};

exports.applicationDetail = async (req, res, next) => {
  try {
    const [apps] = await db.execute('SELECT * FROM passport_applications WHERE id = ?', [req.params.id]);
    if (!apps.length) return fail(res, 'Application not found', 404);
    const [documents] = await db.execute(
      'SELECT id, doc_type, original_name, mime_type, size_bytes FROM application_documents WHERE application_id = ?', [apps[0].id]);
    const [verification] = await db.execute(`SELECT v.status, v.remarks, v.verified_at, o.full_name AS officer
      FROM verification_records v JOIN officer_users o ON o.id = v.officer_id
      WHERE v.application_id = ? ORDER BY v.verified_at`, [apps[0].id]);
    return ok(res, { application: apps[0], documents, verification });
  } catch (e) { next(e); }
};
