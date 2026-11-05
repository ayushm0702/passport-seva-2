const r = require('express').Router();
const c = require('../controllers/officerController');
const { authenticate, authorize } = require('../middleware/auth');
r.use(authenticate, authorize('officer'));
r.get('/applications', c.assigned);
r.get('/applications/:id', c.detail);
r.post('/applications/:id/verify', c.verify);
module.exports = r;
