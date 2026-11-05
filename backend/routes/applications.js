const r = require('express').Router();
const c = require('../controllers/applicationController');
const upload = require('../middleware/upload');
const { authenticate, authorize } = require('../middleware/auth');

r.use(authenticate, authorize('citizen'));
r.get('/', c.mine);
r.post('/', c.create);
r.post('/:id/documents', upload.single('file'), c.addDocument);
r.post('/:id/submit', c.submit);
r.get('/track/:ref', c.track);
r.get('/:id', c.getOne);
r.get('/:id/receipt', c.receipt);
module.exports = r;
