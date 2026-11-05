require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { fail } = require('./utils/response');

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (req, res) => res.json({ success: true, message: 'Passport Seva API running' }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/officer', require('./routes/officer'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/documents', require('./routes/documents'));

app.use((req, res) => fail(res, 'Route not found', 404));
app.use((err, req, res, next) => {
  if (err.name === 'MulterError' || /allowed/.test(err.message)) return fail(res, err.message, 422);
  console.error(err);
  fail(res, 'Internal server error', 500);
});

app.listen(process.env.PORT || 5000, () => console.log('API on port', process.env.PORT || 5000));
