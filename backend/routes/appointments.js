const r = require('express').Router();
const c = require('../controllers/appointmentController');
const { authenticate, authorize } = require('../middleware/auth');
r.use(authenticate, authorize('citizen'));
r.get('/available', c.available);
r.get('/mine', c.mine);
r.post('/book', c.book);
module.exports = r;
