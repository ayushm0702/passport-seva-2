import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { get, post, errText } from '../services/api.js';
import { Field, Msg } from '../components/ui.jsx';

const OK = ['application/pdf', 'image/jpeg', 'image/png'];
export default function DocumentUpload() {
  const { id } = useParams();
  const [app, setApp] = useState(null); const [type, setType] = useState('Proof of Address');
  const [file, setFile] = useState(null); const [m, setM] = useState(null); const [ref, setRef] = useState(null);
  const load = () => get(`/applications/${id}`).then(setApp).catch(e => setM({ type: 'err', text: errText(e) }));
  useEffect(() => { load(); }, [id]);
  const upload = async e => {
    e.preventDefault();
    if (!file) return setM({ type: 'err', text: 'Choose a file first' });
    if (!OK.includes(file.type)) return setM({ type: 'err', text: 'Only PDF, JPG or PNG files are allowed' });
    if (file.size > 2 * 1024 * 1024) return setM({ type: 'err', text: 'File must be 2 MB or smaller' });
    const fd = new FormData(); fd.append('doc_type', type); fd.append('file', file);
    try { await post(`/applications/${id}/documents`, fd); setFile(null); e.target.reset(); setM({ type: 'ok', text: 'Document uploaded' }); load(); }
    catch (er) { setM({ type: 'err', text: errText(er) }); }
  };
  const submit = async () => {
    try { const r = await post(`/applications/${id}/submit`); setRef(r.data.reference_no); }
    catch (er) { setM({ type: 'err', text: errText(er) }); }
  };
  if (ref) return (<div className="wrap"><h1>Application submitted</h1>
    <div className="msg ok">Your reference number is <b>{ref}</b>. Keep it to track your application.</div>
    <Link className="btn" to={`/appointment/${id}`}>Book your appointment</Link></div>);
  return (<div className="wrap"><h1>Upload documents</h1><p>Step 2 of 3. PDF, JPG or PNG, 2 MB maximum.</p>
    <form className="card form" onSubmit={upload}>
      <Field label="Document type"><select value={type} onChange={e => setType(e.target.value)}>
        {['Proof of Address', 'Proof of Birth', 'Photo ID', 'Old Passport'].map(t => <option key={t}>{t}</option>)}</select></Field>
      <Field label="File"><input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setFile(e.target.files[0])} /></Field>
      <div className="full"><button className="btn alt">Upload document</button></div></form>
    <Msg m={m} />
    <h2>Uploaded</h2>
    {app?.documents.length ? <div className="tbl"><table><tbody>{app.documents.map(d =>
      <tr key={d.id}><td>{d.doc_type}</td><td>{d.original_name}</td><td>{Math.round(d.size_bytes / 1024)} KB</td></tr>)}</tbody></table></div>
      : <div className="card">No documents yet.</div>}
    <p><button className="btn" disabled={!app?.documents.length} onClick={submit}>Submit application</button></p>
  </div>);
}
