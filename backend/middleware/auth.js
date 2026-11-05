const jwt = require('jsonwebtoken');
const { fail } = require('../utils/response');

exports.authenticate = (req, res, next) => {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return fail(res, 'Authentication required', 401);
  try { req.user = jwt.verify(token, process.env.JWT_SECRET); next(); }
  catch { return fail(res, 'Invalid or expired token', 401); }
};

exports.authorize = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : fail(res, 'Access denied for your role', 403);
