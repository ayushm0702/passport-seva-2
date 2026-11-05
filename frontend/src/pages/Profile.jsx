import { useEffect, useState } from 'react';
import { get, put, errText, errFields } from '../services/api.js';
import { Field, Msg } from '../components/ui.jsx';

export default function Profile() {
  const [f, setF] = useState(null); const [err, setErr] = useState({}); const [m, setM] = useState(null);
  useEffect(() => { get('/users/me').then(d => setF({ ...d, dob: d.dob ? d.dob.slice(0, 10) : '' })); }, []);
  if (!f) return <div className="wrap">Loading…</div>;
  const set = k => e => setF({ ...f, [k]: e.target.value || '' });
  const save = async e => {
    e.preventDefault(); setErr({});
    try { await put('/users/me', f); setM({ type: 'ok', text: 'Profile saved' }); }
    catch (er) { setErr(errFields(er)); setM({ type: 'err', text: errText(er) }); }
  };
  const T = (k, label, extra = {}) => <Field label={label} error={err[k]}><input value={f[k] || ''} onChange={set(k)} {...extra} /></Field>;
  return (<div className="wrap"><h1>Your profile</h1>
    <form className="card form" onSubmit={save}>
      {T('full_name', 'Full name')}
      <Field label="Email"><input value={f.email} disabled /></Field>
      {T('phone', 'Mobile number', { maxLength: 10 })}
      {T('dob', 'Date of birth', { type: 'date' })}
      <Field label="Gender" error={err.gender}><select value={f.gender || ''} onChange={set('gender')}><option value="">Select</option><option>Male</option><option>Female</option><option>Other</option></select></Field>
      {T('city', 'City')}{T('state', 'State')}{T('pincode', 'Pincode', { maxLength: 6 })}
      <Field label="Address" full><textarea rows={2} value={f.address || ''} onChange={set('address')} /></Field>
      <div className="full"><Msg m={m} /><button className="btn">Save profile</button></div>
    </form></div>);
}
