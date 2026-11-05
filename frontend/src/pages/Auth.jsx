import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { errText, errFields } from '../services/api.js';
import { Field, Msg } from '../components/ui.jsx';

const HOME = { citizen: '/dashboard', admin: '/admin', officer: '/officer' };

export function Register() {
  const { register } = useAuth(); const nav = useNavigate();
  const [f, setF] = useState({ full_name: '', email: '', phone: '', password: '' });
  const [err, setErr] = useState({}); const [m, setM] = useState(null);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const submit = async e => {
    e.preventDefault(); const x = {};
    if (f.full_name.trim().length < 2) x.full_name = 'Enter your full name';
    if (!/^\S+@\S+\.\S+$/.test(f.email)) x.email = 'Enter a valid email';
    if (!/^[6-9]\d{9}$/.test(f.phone)) x.phone = 'Enter a 10-digit mobile number';
    if (f.password.length < 8 || !/\d/.test(f.password) || !/[A-Za-z]/.test(f.password)) x.password = 'Use 8+ characters with letters and numbers';
    setErr(x); if (Object.keys(x).length) return;
    try { await register(f); nav('/dashboard'); }
    catch (er) { setErr(errFields(er)); setM({ type: 'err', text: errText(er) }); }
  };
  return (<div className="wrap" style={{ maxWidth: 560 }}><h1>Create your account</h1>
    <form className="card form" onSubmit={submit} noValidate>
      <Field label="Full name" error={err.full_name} full><input value={f.full_name} onChange={set('full_name')} autoComplete="name" /></Field>
      <Field label="Email" error={err.email}><input type="email" value={f.email} onChange={set('email')} autoComplete="email" /></Field>
      <Field label="Mobile number" error={err.phone}><input value={f.phone} onChange={set('phone')} inputMode="numeric" maxLength={10} /></Field>
      <Field label="Password" error={err.password} full><input type="password" value={f.password} onChange={set('password')} autoComplete="new-password" /></Field>
      <div className="full"><Msg m={m} /><button className="btn">Create account</button> <Link to="/login">I already have an account</Link></div>
    </form></div>);
}

function LoginForm({ title, roles }) {
  const { login } = useAuth(); const nav = useNavigate();
  const [role, setRole] = useState(roles[0][0]); const [email, setEmail] = useState(''); const [pw, setPw] = useState('');
  const [m, setM] = useState(null);
  const submit = async e => {
    e.preventDefault();
    try { const u = await login(role, email, pw); nav(HOME[u.role]); }
    catch (er) { setM({ type: 'err', text: errText(er) }); }
  };
  return (<div className="wrap" style={{ maxWidth: 480 }}><h1>{title}</h1>
    <form className="card form" onSubmit={submit}>
      {roles.length > 1 && <Field label="Sign in as" full><select value={role} onChange={e => setRole(e.target.value)}>
        {roles.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>}
      <Field label="Email" full><input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></Field>
      <Field label="Password" full><input type="password" value={pw} onChange={e => setPw(e.target.value)} required /></Field>
      <div className="full"><Msg m={m} /><button className="btn">Log in</button></div>
    </form></div>);
}
export const Login = () => <LoginForm title="Citizen log in" roles={[['citizen', 'Citizen']]} />;
export const StaffLogin = () => <LoginForm title="Staff log in" roles={[['admin', 'Administrator'], ['officer', 'Verification officer']]} />;
