import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { post, errText, errFields } from '../services/api.js';
import { Field, Msg } from '../components/ui.jsx';

export default function ApplicationForm() {
  const nav = useNavigate();
  const [f, setF] = useState({ application_type: 'New', service_mode: 'Normal', given_name: '', surname: '', dob: '',
    gender: '', birth_place: '', address: '', old_passport_no: '' });
  const [err, setErr] = useState({}); const [m, setM] = useState(null);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const submit = async e => {
    e.preventDefault(); const x = {};
    ['given_name', 'surname', 'birth_place'].forEach(k => { if (!f[k].trim()) x[k] = 'Required'; });
    if (!f.dob || new Date(f.dob) > new Date()) x.dob = 'Enter a valid date of birth';
    if (!f.gender) x.gender = 'Required';
    if (f.address.trim().length < 5) x.address = 'Enter your full address';
    if (f.application_type === 'Reissue' && !/^[A-Z][0-9]{7}$/.test(f.old_passport_no)) x.old_passport_no = 'One capital letter and 7 digits, e.g. K1234567';
    setErr(x); if (Object.keys(x).length) return;
    try { const r = await post('/applications', f); nav(`/apply/${r.data.id}/documents`); }
    catch (er) { setErr(errFields(er)); setM({ type: 'err', text: errText(er) }); }
  };
  const Sel = ({ k, label, opts }) => <Field label={label} error={err[k]}><select value={f[k]} onChange={set(k)}>
    {!f[k] && <option value="">Select</option>}{opts.map(o => <option key={o}>{o}</option>)}</select></Field>;
  return (<div className="wrap"><h1>Passport application</h1>
    <p>Step 1 of 3: your details. Next you will add documents, then submit.</p>
    <form className="card form" onSubmit={submit} noValidate>
      <Sel k="application_type" label="Application type" opts={['New', 'Reissue']} />
      <Sel k="service_mode" label="Service mode (simulated)" opts={['Normal', 'Tatkaal']} />
      <Field label="Given name" error={err.given_name}><input value={f.given_name} onChange={set('given_name')} /></Field>
      <Field label="Surname" error={err.surname}><input value={f.surname} onChange={set('surname')} /></Field>
      <Field label="Date of birth" error={err.dob}><input type="date" value={f.dob} onChange={set('dob')} /></Field>
      <Sel k="gender" label="Gender" opts={['Male', 'Female', 'Other']} />
      <Field label="Place of birth" error={err.birth_place}><input value={f.birth_place} onChange={set('birth_place')} /></Field>
      {f.application_type === 'Reissue' && <Field label="Old passport number" error={err.old_passport_no}><input value={f.old_passport_no} onChange={e => setF({ ...f, old_passport_no: e.target.value.toUpperCase() })} maxLength={8} /></Field>}
      <Field label="Residential address" error={err.address} full><textarea rows={3} value={f.address} onChange={set('address')} /></Field>
      <div className="full"><Msg m={m} /><button className="btn">Save and add documents</button></div>
    </form></div>);
}
