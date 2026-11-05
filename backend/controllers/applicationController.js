const db = require('../config/db');
const v = require('../utils/validate');
const { ok, fail } = require('../utils/response');

const log = (conn, appId, oldS, newS, role, byId, note) =>
  conn.execute(`INSERT INTO application_status_history
    (application_id, old_status, new_status, changed_by_role, changed_by_id, note) VALUES (?,?,?,?,?,?)`,
    [appId, oldS, newS, role, byId, note]);

const notify = (conn, userId, title, msg) =>
  conn.execute('INSERT INTO notifications (user_id, title, message) VALUES (?,?,?)', [userId, title, msg]);

function check(b) {
  const e = {};
  if (!['New', 'Reissue'].includes(b.application_type)) e.application_type = 'Choose New or Reissue';
  if (!['Normal', 'Tatkaal'].includes(b.service_mode)) e.service_mode = 'Choose Normal or Tatkaal';
  if (!v.text(b.given_name, 1, 60)) e.given_name = 'Required';
  if (!v.text(b.surname, 1, 60)) e.surname = 'Required';
  if (!v.date(b.dob)) e.dob = 'Enter a valid date';
  if (!['Male', 'Female', 'Other'].includes(b.gender)) e.gender = 'Required';
  if (!v.text(b.birth_place, 2, 80)) e.birth_place = 'Required';
  if (!v.text(b.address, 5, 255)) e.address = 'Enter your full address';
  if (b.application_type === 'Reissue' && !/^[A-Z][0-9]{7}$/.test(b.old_passport_no || ''))
    e.old_passport_no = 'Format: one letter and 7 digits';
  return e;
}

exports.create = async (req, res, next) => {
  try {
    const b = req.body, errors = check(b);
    if (Object.keys(errors).length) return fail(res, 'Validation failed', 422, errors);
    const [r] = await db.execute(`INSERT INTO passport_applications
      (user_id, application_type, service_mode, given_name, surname, dob, gender, birth_place, address, old_passport_no)
      VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [req.user.id, b.application_type, b.service_mode, b.given_name.trim(), b.surname.trim(),
       b.dob, b.gender, b.birth_place.trim(), b.address.trim(), b.old_passport_no || null]);
    await log(db, r.insertId, null, 'Draft', 'citizen', req.user.id, 'Draft created');
    return ok(res, { id: r.insertId }, 'Draft saved', 201);
  } catch (e) { next(e); }
};

exports.submit = async (req, res, next) => {
  const conn = await db.getConnection();
  try {
    const [rows] = await conn.execute(
      'SELECT id, status FROM passport_applications WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!rows.length) return fail(res, 'Application not found', 404);
    if (rows[0].status !== 'Draft' && rows[0].status !== 'Documents Required')
      return fail(res, 'Application already submitted', 409);
    const [[{ n }]] = await conn.execute(
      'SELECT COUNT(*) n FROM application_documents WHERE application_id = ?', [rows[0].id]);
    if (n < 1) return fail(res, 'Upload at least one supporting document first', 422);

    const ref = `PSP-${new Date().getFullYear()}-${String(rows[0].id).padStart(5, '0')}`;
    await conn.beginTransaction();
    await conn.execute(`UPDATE passport_applications SET status='Submitted',
      reference_no = COALESCE(reference_no, ?), submitted_at = NOW() WHERE id = ?`, [ref, rows[0].id]);
    await log(conn, rows[0].id, rows[0].status, 'Submitted', 'citizen', req.user.id, 'Submitted by citizen');
    await notify(conn, req.user.id, 'Application submitted', `Your reference number is ${ref}.`);
    await conn.commit();
    return ok(res, { reference_no: ref }, 'Application submitted');
  } catch (e) { await conn.rollback(); next(e); } finally { conn.release(); }
};

exports.mine = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, reference_no, application_type, service_mode, status, created_at, submitted_at
       FROM passport_applications WHERE user_id = ? ORDER BY created_at DESC`, [req.user.id]);
    return ok(res, rows);
  } catch (e) { next(e); }
};

exports.track = async (req, res, next) => {
  try {
    const [apps] = await db.execute(
      `SELECT id, reference_no, application_type, service_mode, status, submitted_at
       FROM passport_applications WHERE reference_no = ? AND user_id = ?`, [req.params.ref, req.user.id]);
    if (!apps.length) return fail(res, 'Application not found', 404);
    const [history] = await db.execute(
      `SELECT new_status, note, changed_at FROM application_status_history
       WHERE application_id = ? ORDER BY changed_at`, [apps[0].id]);
    const notice = /\(Simulated\)/.test(apps[0].status)
      ? 'This is a simulated outcome for an academic demo. No real passport is issued.' : null;
    return ok(res, { ...apps[0], history, notice });
  } catch (e) { next(e); }
};

exports.addDocument = async (req, res, next) => {
  try {
    if (!req.file) return fail(res, 'File is required', 422);
    const types = ['Proof of Address', 'Proof of Birth', 'Photo ID', 'Old Passport'];
    if (!types.includes(req.body.doc_type)) return fail(res, 'Invalid document type', 422);
    const [own] = await db.execute(
      'SELECT id FROM passport_applications WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!own.length) return fail(res, 'Application not found', 404);
    await db.execute(`INSERT INTO application_documents
      (application_id, doc_type, original_name, stored_name, mime_type, size_bytes) VALUES (?,?,?,?,?,?)`,
      [own[0].id, req.body.doc_type, req.file.originalname.slice(0, 255), req.file.filename,
       req.file.mimetype, req.file.size]);
    return ok(res, null, 'Document uploaded', 201);
  } catch (e) { next(e); }
};

exports.getOne = async (req, res, next) => {
  try {
    const [apps] = await db.execute('SELECT * FROM passport_applications WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]);
    if (!apps.length) return fail(res, 'Application not found', 404);
    const [documents] = await db.execute(
      'SELECT id, doc_type, original_name, size_bytes FROM application_documents WHERE application_id = ?', [apps[0].id]);
    return ok(res, { ...apps[0], documents });
  } catch (e) { next(e); }
};

exports.receipt = async (req, res, next) => {
  try {
    const PDFDocument = require('pdfkit');
    const [rows] = await db.execute(`SELECT p.*, a.slot_date, a.slot_time, a.center FROM passport_applications p
      LEFT JOIN appointments a ON a.application_id = p.id WHERE p.id = ? AND p.user_id = ?`,
      [req.params.id, req.user.id]);
    const a = rows[0];
    if (!a || !a.reference_no) return fail(res, 'Receipt is available after submission', 404);
    res.type('application/pdf').set('Content-Disposition', `attachment; filename="${a.reference_no}.pdf"`);
    const d = new PDFDocument({ margin: 50 });
    d.pipe(res);
    d.rect(0, 0, 612, 8).fill('#d9467a');
    d.fillColor('#14285b').fontSize(20).text('Passport Seva Portal - Application Receipt', 50, 40);
    d.fontSize(10).fillColor('#a02020').text('ACADEMIC DEMO. Not an official Government of India document.');
    d.moveDown().fillColor('#000').fontSize(12);
    const line = (k, val) => d.text(`${k}: ${val ?? '-'}`);
    line('Reference number', a.reference_no); line('Applicant', `${a.given_name} ${a.surname}`);
    line('Application type', a.application_type); line('Service mode (simulated)', a.service_mode);
    line('Status', a.status); line('Submitted on', new Date(a.submitted_at).toDateString());
    if (a.slot_date) line('Appointment', `${new Date(a.slot_date).toDateString()} ${a.slot_time}, ${a.center}`);
    d.moveDown().fontSize(9).fillColor('#555').text('Approval shown here is simulated and does not mean a passport has been issued.');
    d.end();
  } catch (e) { next(e); }
};
