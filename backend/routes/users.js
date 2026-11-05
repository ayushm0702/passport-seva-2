const r = require('express').Router();
const c = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
r.use(authenticate, authorize('citizen'));
r.get('/me', c.me);
r.put('/me', c.update);
module.exports = r;
