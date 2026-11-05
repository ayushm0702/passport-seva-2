import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { get, post, patch, errText } from '../services/api.js';
import { Msg, Status, fmt } from '../components/ui.jsx';

const STATUSES = ['Draft', 'Submitted', 'Appointment Scheduled', 'Under Verification', 'Documents Required', 'Verification Completed', 'Approved (Simulated)', 'Rejected (Simulated)'];
const COLORS = ['#d9467a', '#f29c2b', '#138808', '#14285b', '#7a2a62', '#ef7aa1', '#2a3f8f', '#9aa3bd'];

export default function AdminDashboard() {
  const [tab, setTab] = useState('Overview'); const [m, setM] = useState(null);
  const [stats, setStats] = useState(null); const [apps, setApps] = useState([]); const [users, setUsers] = useState([]);
  const [officers, setOfficers] = useState([]); const [q, setQ] = useState(''); const [st, setSt] = useState('');
  const [slot, setSlot] = useState({ slot_date: '', slot_time: '10:00', center: 'Passport Seva Kendra, Mumbai' });
  const run = async fn => { try { const r = await fn(); setM({ type: 'ok', text: r?.message || 'Done' }); load(); } catch (e) { setM({ type: 'err', text: errText(e) }); } };
  const load = () => {
    get('/admin/stats').then(setStats);
    get(`/admin/applications?q=${encodeURIComponent(q)}&status=${encodeURIComponent(st)}`).then(setApps);
    get(`/admin/users?q=${encodeURIComponent(q)}`).then(setUsers); get('/admin/officers').then(setOfficers);
  };
  useEffect(load, [tab, st]);
  const cards = stats && [['Registered users', stats.users], ['Applications', stats.total], ['Pending', stats.pending],
    ['Under verification', stats.verifying], ['Completed', stats.completed], ['Appointments today', stats.today]];
  const search = <form className="search" onSubmit={e => { e.preventDefault(); load(); }}>
    <input placeholder="Search name, email or reference" value={q} onChange={e => setQ(e.target.value)} />
    {tab === 'Applications' && <select value={st} onChange={e => setSt(e.target.value)}><option value="">All statuses</option>{STATUSES.map(s => <option key={s}>{s}</option>)}</select>}
    <button className="btn sm">Search</button></form>;
  return (<div className="wrap"><h1>Administrator dashboard</h1>
    <div className="tabs">{['Overview', 'Applications', 'Users', 'Slots'].map(t => <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>)}</div>
    <Msg m={m} />
    {tab === 'Overview' && stats && <>
      <div className="grid">{cards.map(([l, n]) => <div className="card stat" key={l}><b>{n}</b><span>{l}</span></div>)}</div>
      <div className="grid" style={{ marginTop: 14 }}>
        <div className="card"><b>Applications per month</b><div style={{ height: 240 }}><ResponsiveContainer><BarChart data={stats.monthly}><XAxis dataKey="month" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="total" fill="#d9467a" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div></div>
        <div className="card"><b>By status</b><div style={{ height: 240 }}><ResponsiveContainer><PieChart><Pie data={stats.byStatus} dataKey="total" nameKey="status" outerRadius={80}>{stats.byStatus.map((_, i) => <Cell key={i} fill={COLORS[i % 8]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div></div>
      </div></>}
    {tab === 'Applications' && <>{search}<div className="tbl"><table><thead><tr><th>Reference</th><th>Applicant</th><th>Status</th><th>Officer</th><th>Actions</th></tr></thead><tbody>
      {apps.map(a => (<tr key={a.id}><td>{a.reference_no || '-'}</td><td>{a.given_name} {a.surname}</td><td><Status s={a.status} /></td><td>{a.officer || '-'}</td>
        <td className="row">
          {['Submitted', 'Appointment Scheduled', 'Documents Required'].includes(a.status) &&
            <select defaultValue="" onChange={e => e.target.value && run(() => post(`/admin/applications/${a.id}/assign`, { officer_id: Number(e.target.value) }))}>
              <option value="">Assign officer</option>{officers.map(o => <option key={o.id} value={o.id}>{o.full_name}</option>)}</select>}
          <select defaultValue="" onChange={e => { const s = e.target.value; if (s) run(() => patch(`/admin/applications/${a.id}/status`, { status: s, note: s === 'Documents Required' ? 'Additional information requested' : '' })); e.target.value = ''; }}>
            <option value="">Update status</option>{['Documents Required', 'Approved (Simulated)', 'Rejected (Simulated)'].map(s => <option key={s}>{s}</option>)}</select>
        </td></tr>))}</tbody></table></div></>}
    {tab === 'Users' && <>{search}<div className="tbl"><table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th><th>Active</th></tr></thead><tbody>
      {users.map(u => <tr key={u.id}><td>{u.full_name}</td><td>{u.email}</td><td>{u.phone}</td><td>{fmt(u.created_at)}</td>
        <td><button className={`btn sm ${u.is_active ? 'alt' : ''}`} onClick={() => run(() => patch(`/admin/users/${u.id}/active`, { is_active: !u.is_active }))}>{u.is_active ? 'Deactivate' : 'Activate'}</button></td></tr>)}</tbody></table></div></>}
    {tab === 'Slots' && <form className="card form" onSubmit={e => { e.preventDefault(); run(() => post('/admin/slots', slot)); }}>
      <div className="field"><label>Date</label><input type="date" required value={slot.slot_date} onChange={e => setSlot({ ...slot, slot_date: e.target.value })} /></div>
      <div className="field"><label>Time</label><input type="time" required value={slot.slot_time} onChange={e => setSlot({ ...slot, slot_time: e.target.value })} /></div>
      <div className="field"><label>Centre</label><input required value={slot.center} onChange={e => setSlot({ ...slot, center: e.target.value })} /></div>
      <div className="full"><button className="btn">Add slot</button></div></form>}
  </div>);
}
