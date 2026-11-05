const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const ALLOWED = { 'application/pdf': '.pdf', 'image/jpeg': '.jpg', 'image/png': '.png' };

module.exports = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, '..', 'uploads'),
    filename: (req, file, cb) => cb(null, crypto.randomUUID() + ALLOWED[file.mimetype])
  }),
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) =>
    ALLOWED[file.mimetype] ? cb(null, true) : cb(new Error('Only PDF, JPG or PNG files are allowed'))
});
