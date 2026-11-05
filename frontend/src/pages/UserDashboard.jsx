import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { get, patch, openFile } from '../services/api.js';
import { Status, fmt } from '../components/ui.jsx';

export default function UserDashboard() {
  const [apps, setApps] = useState([]); const [notes, setNotes] = useState([]); const [appts, setAppts] = useState([]);
  const load = () => {
    get('/applications').then(setApps); get('/notifications').then(setNotes); get('/appointments/mine').then(setAppts);
  };
  useEffect(load, []);
  const read = id => patch(`/notifications/${id}/read`).then(load);
  return (<div className="wrap">
    <div className="row" style={{ justifyContent: 'space-between' }}><h1>Your dashboard</h1><Link className="btn" to="/apply">New application</Link></div>
    <h2>Applications</h2>
    {apps.length === 0 ? <div className="card">No applications yet. Start one to get your reference number.</div> :
    <div className="tbl"><table><thead><tr><th>Reference</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead><tbody>
      {apps.map(a => (<tr key={a.id}><td>{a.reference_no || 'Not submitted'}</td><td>{a.application_type} · {a.service_mode}</td>
        <td><Status s={a.status} /></td>
        <td className="row">
          {(a.status === 'Draft' || a.status === 'Documents Required') && <Link className="btn sm" to={`/apply/${a.id}/documents`}>{a.status === 'Draft' ? 'Add documents' : 'Update documents'}</Link>}
          {a.status === 'Submitted' && <Link className="btn sm" to={`/appointment/${a.id}`}>Book appointment</Link>}
          {a.reference_no && <><Link className="btn sm alt" to={`/track?ref=${a.reference_no}`}>Track</Link>
            <button className="btn sm alt" onClick={() => openFile(`/applications/${a.id}/receipt`, `${a.reference_no}.pdf`)}>Receipt</button></>}
        </td></tr>))}</tbody></table></div>}
    <h2>Appointment history</h2>
    {appts.length === 0 ? <div className="card">No appointments booked.</div> :
    <div className="tbl"><table><thead><tr><th>Date</th><th>Time</th><th>Centre</th><th>Reference</th></tr></thead><tbody>
      {appts.map(a => <tr key={a.id}><td>{fmt(a.slot_date)}</td><td>{a.slot_time.slice(0, 5)}</td><td>{a.center}</td><td>{a.reference_no}</td></tr>)}</tbody></table></div>}
    <h2>Notifications</h2>
    <div className="grid">{notes.length === 0 && <div className="card">You’re all caught up.</div>}
      {notes.map(n => (<div className="card" key={n.id} style={{ opacity: n.is_read ? .6 : 1 }}>
        <b>{n.title}</b><p style={{ margin: '4px 0' }}>{n.message}</p>
        <small>{fmt(n.created_at)}</small> {!n.is_read && <button className="btn sm alt" onClick={() => read(n.id)}>Mark read</button>}</div>))}</div>
  </div>);
}
