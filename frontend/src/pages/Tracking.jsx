import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { get, errText } from '../services/api.js';
import { Msg, Progress, Status, fmt } from '../components/ui.jsx';

export default function Tracking() {
  const [qs] = useSearchParams();
  const [ref, setRef] = useState(qs.get('ref') || ''); const [d, setD] = useState(null); const [m, setM] = useState(null);
  const find = async e => {
    e?.preventDefault(); setM(null);
    try { setD(await get(`/applications/track/${encodeURIComponent(ref.trim())}`)); }
    catch (er) { setD(null); setM({ type: 'err', text: errText(er) }); }
  };
  useEffect(() => { if (qs.get('ref')) find(); }, []);
  return (<div className="wrap"><h1>Track your application</h1>
    <form className="search" onSubmit={find}><input placeholder="PSP-2026-00001" value={ref} onChange={e => setRef(e.target.value)} aria-label="Reference number" /><button className="btn">Track</button></form>
    <Msg m={m} />
    {d && <><div className="card"><div className="row" style={{ justifyContent: 'space-between' }}><b>{d.reference_no}</b><Status s={d.status} /></div>
      <Progress status={d.status} />
      {d.status === 'Documents Required' && <div className="msg err">More information is needed. Open your dashboard to update documents.</div>}
      {d.notice && <div className="msg">{d.notice}</div>}</div>
      <h2>History</h2><div className="tbl"><table><tbody>{d.history.map((h, i) =>
        <tr key={i}><td>{fmt(h.changed_at)}</td><td><Status s={h.new_status} /></td><td>{h.note}</td></tr>)}</tbody></table></div></>}
  </div>);
}
