export const About = () => (<div className="wrap"><h1>About this portal</h1>
  <p>Passport Seva Portal is a student project that models how a citizen, a verification officer and an administrator move a passport application from submission to a simulated decision.</p>
  <p>The stack is React, Node.js with Express, MySQL and a Python Tkinter desktop app for administrators. All people and documents are dummy data.</p>
  <div className="note">Approved (Simulated) and Rejected (Simulated) are demo outcomes. No real passport is issued.</div></div>);
export const Contact = () => (<div className="wrap"><h1>Contact and help</h1>
  <div className="grid">
    <div className="card"><h3>Create an account</h3><p>Register with your email and mobile number, then start an application from your dashboard.</p></div>
    <div className="card"><h3>Documents</h3><p>PDF, JPG or PNG files up to 2 MB. Upload at least one before submitting.</p></div>
    <div className="card"><h3>Need support?</h3><p>Email help@passportseva-demo.example (demo address).</p></div></div></div>);
