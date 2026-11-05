import { createContext, useContext, useState } from 'react';
import { post } from '../services/api.js';
const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('psp_user') || 'null'));
  const save = (token, u) => {
    localStorage.setItem('psp_token', token); localStorage.setItem('psp_user', JSON.stringify(u)); setUser(u);
  };
  const login = async (role, email, password) => {
    const r = await post('/auth/login', { role, email, password });
    save(r.data.token, r.data.user); return r.data.user;
  };
  const register = async body => {
    const r = await post('/auth/register', body);
    save(r.data.token, { role: 'citizen', name: body.full_name }); return r;
  };
  const logout = () => { localStorage.removeItem('psp_token'); localStorage.removeItem('psp_user'); setUser(null); };
  return <Ctx.Provider value={{ user, login, register, logout }}>{children}</Ctx.Provider>;
}
