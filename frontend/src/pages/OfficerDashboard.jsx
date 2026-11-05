import { useEffect, useState } from 'react';
import { get, post, errText, openFile } from '../services/api.js';
import { Field, Msg, Status, fmt } from '../components/ui.jsx';

export default function OfficerDashboard() {
  const [list, setList] = useState([]); const [d, setD] = useState(null); const [m, setM] = useState(null);
  const [v, setV] = useState({ status: 'Completed', remarks: '' });
  const load = () => get('/officer/applications').then(setList);
  useEffect(() => { load(); }, []);
  const open = id => { setM(null); get(`/officer/applications/${id}`).then(setD); };
  const save = async e => {
    e.preventDefault();
    try { await post(`/officer/applications/${d.application.id}/verify`, v); setM({ type: 'ok', text: 'Verification saved and forwarded to the administrator' }); setV({ ...v, remarks: '' }); setD(null); load(); }
    catch (er) { setM({ type: 'err', text: errText(er) }); }
  };
  const a = d?.application;
  return (<div className="wrap"><h1>Verification officer dashboard</h1><Msg m={m} />
    <h2>Assigned applications</h2>
    {list.length === 0 ? <div className="card">No applications are assigned to you yet.</div> :
    <div className="tbl"><table><thead><tr><th>Reference</th><th>Applicant</th><th>Type</th><th>Status</th><th></th></tr></thead><tbody>
      {list.map(x => <tr key={x.id}><td>{x.reference_no}</td><td>{x.given_name} {x.surname}</td><td>{x.application_type} · {x.service_mode}</td><td><Status s={x.status} /></td>
        <td><button className="btn sm" onClick={() => open(x.id)}>Review</button></td></tr>)}</tbody></table></div>}
    {a && <><h2>Review {a.reference_no}</h2>
      <div className="card"><div className="grid">
        {[['Name', `${a.given_name} ${a.surname}`], ['Date of birth', fmt(a.dob)], ['Gender', a.gender], ['Place of birth', a.birth_place], ['Address', a.address], ['Old passport', a.old_passport_no || '-']]
          .map(([k, val]) => <div key={k}><small>{k}</small><div><b>{val}</b></div></div>)}</div></div>
      <h2>Documents</h2><div className="grid">{d.documents.map(x => <div className="card" key={x.id}><b>{x.doc_type}</b><div>{x.original_name}</div>
        <button className="btn sm alt" onClick={() => openFile(`/documents/${x.id}/file`)}>View</button></div>)}</div>
      {d.verification.length > 0 && <><h2>Earlier remarks</h2><div className="tbl"><table><tbody>{d.verification.map((r, i) => <tr key={i}><td>{fmt(r.verified_at)}</td><td>{r.status}</td><td>{r.remarks}</td></tr>)}</tbody></table></div></>}
      <h2>Your verification</h2>
      <form className="card form" onSubmit={save}>
        <Field label="Outcome"><select value={v.status} onChange={e => setV({ ...v, status: e.target.value })}>
          <option value="Pending">Pending</option><option value="Completed">Completed</option><option value="Correction Required">Correction required</option></select></Field>
        <Field label="Remarks" full><textarea rows={3} required value={v.remarks} onChange={e => setV({ ...v, remarks: e.target.value })} /></Field>
        <div className="full"><button className="btn">Save and forward to administrator</button></div></form></>}
  </div>);
}
