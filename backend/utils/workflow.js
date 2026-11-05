const db = require('../config/db');

exports.tx = async fn => {
  const conn = await db.getConnection();
  try { await conn.beginTransaction(); const out = await fn(conn); await conn.commit(); return out; }
  catch (e) { await conn.rollback(); throw e; }
  finally { conn.release(); }
};

// Changes status, writes history and notifies the citizen. Call inside tx().
exports.setStatus = async (conn, appId, newStatus, role, byId, note) => {
  const [[a]] = await conn.execute(
    'SELECT p.user_id, p.status, p.reference_no, u.email FROM passport_applications p JOIN users u ON u.id = p.user_id WHERE p.id = ? FOR UPDATE', [appId]);
  if (!a) return null;
  await conn.execute('UPDATE passport_applications SET status = ? WHERE id = ?', [newStatus, appId]);
  await conn.execute(`INSERT INTO application_status_history
    (application_id, old_status, new_status, changed_by_role, changed_by_id, note) VALUES (?,?,?,?,?,?)`,
    [appId, a.status, newStatus, role, byId, note || null]);
  await conn.execute('INSERT INTO notifications (user_id, title, message) VALUES (?,?,?)',
    [a.user_id, 'Status updated', `${a.reference_no || 'Your application'} is now: ${newStatus}`]);
  require('./mailer').send(a.email, 'Passport Seva: status updated', `${a.reference_no || 'Your application'} is now: ${newStatus}`);
  return a;
};
