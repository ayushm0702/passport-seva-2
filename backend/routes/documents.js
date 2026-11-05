const r = require('express').Router();
const c = require('../controllers/documentController');
const { authenticate } = require('../middleware/auth');
r.get('/:id/file', authenticate, c.file);
module.exports = r;
