const db = require('../config/db');
const { ok, fail } = require('../utils/response');

exports.list = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, title, message, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.id]);
    return ok(res, rows);
  } catch (e) { next(e); }
};

exports.markRead = async (req, res, next) => {
  try {
    const [r] = await db.execute('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]);
    return r.affectedRows ? ok(res, null, 'Marked as read') : fail(res, 'Notification not found', 404);
  } catch (e) { next(e); }
};
