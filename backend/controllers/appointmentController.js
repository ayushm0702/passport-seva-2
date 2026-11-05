const db = require('../config/db');
const { tx, setStatus } = require('../utils/workflow');
const { ok, fail } = require('../utils/response');

exports.available = async (req, res, next) => {
  try {
    const [rows] = await db.execute(`SELECT id, slot_date, slot_time, center FROM appointments
      WHERE application_id IS NULL AND slot_date >= CURDATE() ORDER BY slot_date, slot_time`);
    return ok(res, rows);
  } catch (e) { next(e); }
};

exports.book = async (req, res, next) => {
  try {
    const { application_id, slot_id } = req.body;
    const result = await tx(async conn => {
      const [apps] = await conn.execute(
        'SELECT id, status FROM passport_applications WHERE id = ? AND user_id = ?', [application_id, req.user.id]);
      if (!apps.length) return { code: 404, msg: 'Application not found' };
      if (apps[0].status !== 'Submitted') return { code: 409, msg: 'Only submitted applications can book a slot' };
      const [u] = await conn.execute(
        'UPDATE appointments SET application_id = ? WHERE id = ? AND application_id IS NULL AND slot_date >= CURDATE()',
        [apps[0].id, slot_id]);
      if (!u.affectedRows) return { code: 409, msg: 'Slot is no longer available' };
      await setStatus(conn, apps[0].id, 'Appointment Scheduled', 'citizen', req.user.id, 'Appointment booked');
      return { code: 200 };
    });
    return result.code === 200 ? ok(res, null, 'Appointment booked') : fail(res, result.msg, result.code);
  } catch (e) { next(e); }
};

exports.mine = async (req, res, next) => {
  try {
    const [rows] = await db.execute(`SELECT a.id, a.slot_date, a.slot_time, a.center, p.reference_no
      FROM appointments a JOIN passport_applications p ON p.id = a.application_id
      WHERE p.user_id = ? ORDER BY a.slot_date DESC`, [req.user.id]);
    return ok(res, rows);
  } catch (e) { next(e); }
};
