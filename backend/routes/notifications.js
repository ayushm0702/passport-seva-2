const r = require('express').Router();
const c = require('../controllers/notificationController');
const { authenticate, authorize } = require('../middleware/auth');
r.use(authenticate, authorize('citizen'));
r.get('/', c.list);
r.patch('/:id/read', c.markRead);
module.exports = r;
