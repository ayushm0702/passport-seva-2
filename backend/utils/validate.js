const email = v => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const phone = v => /^[6-9]\d{9}$/.test(String(v || ''));
const password = v => typeof v === 'string' && v.length >= 8 && /[A-Za-z]/.test(v) && /\d/.test(v);
const text = (v, min = 1, max = 100) => typeof v === 'string' && v.trim().length >= min && v.trim().length <= max;
const date = v => !isNaN(Date.parse(v));
module.exports = { email, phone, password, text, date };
