import axios from 'axios';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });
api.interceptors.request.use(c => {
  const t = localStorage.getItem('psp_token');
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});
export const get = u => api.get(u).then(r => r.data.data);
export const post = (u, b, cfg) => api.post(u, b, cfg).then(r => r.data);
export const put = (u, b) => api.put(u, b).then(r => r.data);
export const patch = (u, b) => api.patch(u, b).then(r => r.data);
export const del = u => api.delete(u).then(r => r.data);
export const errText = e => e.response?.data?.message || 'Could not reach the server';
export const errFields = e => e.response?.data?.errors || {};
// Open an authenticated file (document or receipt) in a new tab / download it
export async function openFile(url, download) {
  const r = await api.get(url, { responseType: 'blob' });
  const href = URL.createObjectURL(r.data);
  if (download) { const a = document.createElement('a'); a.href = href; a.download = download; a.click(); }
  else window.open(href, '_blank');
}
export default api;
