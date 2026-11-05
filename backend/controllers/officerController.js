const db = require('../config/db');
const { tx, setStatus } = require('../utils/workflow');
const { ok, fail } = require('../utils/response');

const MAP = { 'Pending': 'Under Verification', 'Completed': 'Verification Completed',
              'Correction Required': 'Documents Required' };

exports.assigned = async (req, res, next) => {
  try {
    const [rows] = await db.execute(`SELECT id, reference_no, given_name, surname, application_type,
      service_mode, status, submitted_at FROM passport_applications
      WHERE officer_id = ? ORDER BY submitted_at`, [req.user.id]);
    return ok(res, rows);
  } catch (e) { next(e); }
};

exports.detail = async (req, res, next) => {
  try {
    const [apps] = await db.execute(
      'SELECT * FROM passport_applications WHERE id = ? AND officer_id = ?', [req.params.id, req.user.id]);
    if (!apps.length) return fail(res, 'Application not found', 404);
    const [docs] = await db.execute(
      'SELECT id, doc_type, original_name, mime_type, size_bytes FROM application_documents WHERE application_id = ?',
      [apps[0].id]);
    const [records] = await db.execute(
      'SELECT status, remarks, verified_at FROM verification_records WHERE application_id = ? ORDER BY verified_at',
      [apps[0].id]);
    return ok(res, { application: apps[0], documents: docs, verification: records });
  } catch (e) { next(e); }
};

exports.verify = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;
    if (!MAP[status]) return fail(res, 'Status must be Pending, Completed or Correction Required', 422);
    if (typeof remarks !== 'string' || remarks.trim().length < 3 || remarks.length > 1000)
      return fail(res, 'Remarks are required (3 to 1000 characters)', 422);
    const code = await tx(async conn => {
      const [own] = await conn.execute(
        'SELECT id FROM passport_applications WHERE id = ? AND officer_id = ?', [req.params.id, req.user.id]);
      if (!own.length) return 404;
      await conn.execute(
        'INSERT INTO verification_records (application_id, officer_id, status, remarks) VALUES (?,?,?,?)',
        [own[0].id, req.user.id, status, remarks.trim()]);
      await setStatus(conn, own[0].id, MAP[status], 'officer', req.user.id, remarks.trim().slice(0, 255));
      return 200;
    });
    return code === 200 ? ok(res, null, 'Verification saved and forwarded') : fail(res, 'Application not found', 404);
  } catch (e) { next(e); }
};
