import { Link } from 'react-router-dom';
import Lotus from '../components/Lotus.jsx';
export default function Home() {
  const items = [['New passport', 'Apply for a fresh passport with normal or tatkaal (simulated) service.'],
    ['Passport reissue', 'Renew or replace an existing passport.'],
    ['Upload documents', 'Add PDF, JPG or PNG proofs, up to 2 MB each.'],
    ['Book appointment', 'Choose a free slot at a Passport Seva Kendra.'],
    ['Track progress', 'Follow each step with your reference number.']];
  return (<>
    <section className="hero"><Lotus className="wm" size={380} style={{ color: '#fff' }} />
      <div className="in"><h1>Apply for your passport, one clear step at a time</h1>
        <p>Register, upload documents, book a slot and track your application. Inspired by the lotus, India’s national flower.</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link className="btn" to="/apply">Start an application</Link>
          <Link className="btn alt" to="/track">Track an application</Link></div></div></section>
    <div className="wrap">
      <div className="note"><b>Demo notice:</b> this academic project uses dummy data and simulated verification. It does not issue real passports.</div>
      <h2>What you can do</h2>
      <div className="grid">{items.map(([t, d]) => <div className="card" key={t}><h3 style={{ margin: '0 0 4px', color: 'var(--navy)' }}>{t}</h3><p style={{ margin: 0, color: 'var(--muted)' }}>{d}</p></div>)}</div>
    </div></>);
}
