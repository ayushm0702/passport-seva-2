const nodemailer = require('nodemailer');
let transport;
const get = () => {
  if (!process.env.SMTP_HOST) return null;
  const port = Number(process.env.SMTP_PORT) || 587;
  transport ||= nodemailer.createTransport({ host: process.env.SMTP_HOST, port, secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
  return transport;
};
// Fire-and-forget: a mail failure must never break the workflow.
exports.send = (to, subject, text) => {
  const t = get(); if (!t) return;
  t.sendMail({ from: process.env.MAIL_FROM, to, subject,
    text: `${text}\n\nThis is an academic demo message. No real passport is issued.` })
    .catch(e => console.error('Mail failed:', e.message));
};
