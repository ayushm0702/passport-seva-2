// End-to-end smoke test. Needs: backend running, schema + sample_data loaded, `npm run seed` done. Node 18+.
const BASE = process.env.PSP_API_URL || 'http://localhost:5000/api';
let pass = 0, failed = 0;
const check = (name, cond, extra = '') => { cond ? pass++ : failed++; console.log(cond ? 'PASS' : 'FAIL', name, cond ? '' : extra); };
const call = async (method, path, { token, body, form } = {}) => {
  const headers = {}; let b;
  if (token) headers.Authorization = 'Bearer ' + token;
  if (form) b = form; else if (body) { headers['Content-Type'] = 'application/json'; b = JSON.stringify(body); }
  const r = await fetch(BASE + path, { method, headers, body: b });
  const json = (r.headers.get('content-type') || '').includes('json') ? await r.json() : null;
  return { status: r.status, body: json, res: r };
};
const upload = (id, token, type, mime) => {
  const fd = new FormData();
  fd.append('doc_type', type);
  fd.append('file', new Blob(['%PDF-1.4 demo'], { type: mime }), 'proof.' + (mime === 'application/pdf' ? 'pdf' : 'txt'));
  return call('POST', `/applications/${id}/documents`, { token, form: fd });
};

(async () => {
  const email = `test${Date.now()}@demo.in`, pw = 'Demo@1234';
  check('health', (await call('GET', '/health')).status === 200);
  check('register rejects bad input', (await call('POST', '/auth/register', { body: { email: 'x' } })).status === 422);
  const reg = await call('POST', '/auth/register', { body: { full_name: 'Test Citizen', email, phone: '9876501234', password: pw } });
  check('register', reg.status === 201 && reg.body.data.token);
  check('duplicate email rejected', (await call('POST', '/auth/register', { body: { full_name: 'Test Citizen', email, phone: '9876501234', password: pw } })).status === 409);
  const t = reg.body.data.token;
  check('applications need a token', (await call('GET', '/applications')).status === 401);

  const draft = await call('POST', '/applications', { token: t, body: { application_type: 'New', service_mode: 'Normal',
    given_name: 'Test', surname: 'Citizen', dob: '2000-01-15', gender: 'Male', birth_place: 'Pune', address: '12 Lotus Road, Pune' } });
  check('create draft', draft.status === 201, JSON.stringify(draft.body));
  const id = draft.body.data.id;
  check('submit blocked without documents', (await call('POST', `/applications/${id}/submit`, { token: t })).status === 422);
  check('upload rejects non PDF/JPG/PNG', (await upload(id, t, 'Photo ID', 'text/plain')).status === 422);
  check('upload PDF', (await upload(id, t, 'Photo ID', 'application/pdf')).status === 201);
  const sub = await call('POST', `/applications/${id}/submit`, { token: t });
  check('submit gives reference number', sub.status === 200 && /^PSP-\d{4}-\d{5}$/.test(sub.body.data.reference_no));
  const ref = sub.body.data.reference_no;

  const slots = await call('GET', '/appointments/available', { token: t });
  check('free slots exist (sample_data loaded)', slots.body.data.length > 0);
  check('book appointment', (await call('POST', '/appointments/book', { token: t, body: { application_id: id, slot_id: slots.body.data[0].id } })).status === 200);

  const admin = (await call('POST', '/auth/login', { body: { role: 'admin', email: 'admin@demo.in', password: pw } })).body.data.token;
  check('citizen cannot open admin API', (await call('GET', '/admin/stats', { token: t })).status === 403);
  check('admin stats', (await call('GET', '/admin/stats', { token: admin })).status === 200);
  const off = (await call('GET', '/admin/officers', { token: admin })).body.data[0];
  check('assign officer', (await call('POST', `/admin/applications/${id}/assign`, { token: admin, body: { officer_id: off.id } })).status === 200);
  check('approve blocked before verification', (await call('PATCH', `/admin/applications/${id}/status`, { token: admin, body: { status: 'Approved (Simulated)' } })).status === 409);

  const officer = (await call('POST', '/auth/login', { body: { role: 'officer', email: 'officer@demo.in', password: pw } })).body.data.token;
  check('officer verify needs remarks', (await call('POST', `/officer/applications/${id}/verify`, { token: officer, body: { status: 'Completed', remarks: '' } })).status === 422);
  check('officer verifies', (await call('POST', `/officer/applications/${id}/verify`, { token: officer, body: { status: 'Completed', remarks: 'Documents match' } })).status === 200);
  check('admin approves (simulated)', (await call('PATCH', `/admin/applications/${id}/status`, { token: admin, body: { status: 'Approved (Simulated)' } })).status === 200);

  const tr = await call('GET', `/applications/track/${ref}`, { token: t });
  check('tracking shows simulated approval', tr.body.data.status === 'Approved (Simulated)' && !!tr.body.data.notice);
  check('history recorded', tr.body.data.history.length >= 5);
  const pdf = await call('GET', `/applications/${id}/receipt`, { token: t });
  check('receipt is a PDF', pdf.status === 200 && (pdf.res.headers.get('content-type') || '').includes('pdf'));
  check('notifications created', (await call('GET', '/notifications', { token: t })).body.data.length >= 3);

  console.log(`\n${pass} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('Test run crashed:', e.message); process.exit(1); });
