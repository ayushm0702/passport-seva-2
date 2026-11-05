const path = require('path');
const db = require('../config/db');
const { fail } = require('../utils/response');

// Officers (assigned only), admins (all) and the owning citizen may view a document.
exports.file = async (req, res, next) => {
  try {
    const [rows] = await db.execute(`SELECT d.stored_name, d.mime_type, p.user_id, p.officer_id
      FROM application_documents d JOIN passport_applications p ON p.id = d.application_id
      WHERE d.id = ?`, [req.params.id]);
    const d = rows[0], u = req.user;
    const allowed = d && (u.role === 'admin' ||
      (u.role === 'officer' && d.officer_id === u.id) || (u.role === 'citizen' && d.user_id === u.id));
    if (!allowed) return fail(res, 'Document not found', 404);
    res.type(d.mime_type).sendFile(path.join(__dirname, '..', 'uploads', path.basename(d.stored_name)));
  } catch (e) { next(e); }
};
