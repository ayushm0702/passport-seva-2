import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { get, post, errText } from '../services/api.js';
import { Msg, fmt } from '../components/ui.jsx';

export default function Appointment() {
  const { id } = useParams(); const nav = useNavigate();
  const [slots, setSlots] = useState([]); const [pick, setPick] = useState(null); const [m, setM] = useState(null);
  useEffect(() => { get('/appointments/available').then(setSlots); }, []);
  const book = async () => {
    try { await post('/appointments/book', { application_id: Number(id), slot_id: pick }); nav('/dashboard'); }
    catch (e) { setM({ type: 'err', text: errText(e) }); get('/appointments/available').then(setSlots); setPick(null); }
  };
  return (<div className="wrap"><h1>Book an appointment</h1><p>Step 3 of 3. Choose a free slot.</p>
    {slots.length === 0 ? <div className="card">No slots are open right now. Please check back later.</div> :
    <div className="grid">{slots.map(s => (<label key={s.id} className="card" style={{ cursor: 'pointer', borderTopColor: pick === s.id ? 'var(--green)' : undefined }}>
      <input type="radio" name="slot" checked={pick === s.id} onChange={() => setPick(s.id)} /> <b>{fmt(s.slot_date)}</b> at {s.slot_time.slice(0, 5)}
      <div style={{ color: 'var(--muted)' }}>{s.center}</div></label>))}</div>}
    <Msg m={m} /><p><button className="btn" disabled={!pick} onClick={book}>Confirm appointment</button></p></div>);
}
