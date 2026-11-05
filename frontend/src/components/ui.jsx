export const Field = ({ label, error, children, full }) => (
  <div className={`field${error ? ' bad' : ''}${full ? ' full' : ''}`}>
    <label>{label}</label>{children}{error && <small role="alert">{error}</small>}
  </div>
);
export const Msg = ({ m }) => m ? <div className={`msg ${m.type}`} role="status">{m.text}</div> : null;
export const Status = ({ s }) => (
  <span className={`tag ${/Approved/.test(s) ? 'g' : /Rejected|Required/.test(s) ? 'r' : ''}`}>{s}</span>
);
export const FLOW = ['Submitted', 'Appointment Scheduled', 'Under Verification', 'Verification Completed', 'Approved (Simulated)'];
export const Progress = ({ status }) => {
  const i = FLOW.indexOf(status === 'Rejected (Simulated)' ? 'Approved (Simulated)' : status === 'Documents Required' ? 'Under Verification' : status);
  return (<div className="steps">{FLOW.map((s, k) => (
    <div key={s} className={`step ${k < i ? 'done' : k === i ? 'now' : ''}`}><i>{k < i ? '✓' : k + 1}</i>{s}</div>))}</div>);
};
export const fmt = d => d ? new Date(d).toLocaleDateString('en-IN') : '-';
