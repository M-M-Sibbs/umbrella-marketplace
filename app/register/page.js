'use client';
// app/register/page.js
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function RegisterForm() {
  const params = useSearchParams();
  const initialRole = params.get('role') === 'employer' ? 'employer' : 'worker';
  const [role, setRole] = useState(initialRole);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', confirm: '', location: '', company_name: '', skills: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setErr('');
    if (form.password.length < 8) return setErr('Password must be at least 8 characters.');
    if (form.password !== form.confirm) return setErr('Passwords do not match.');
    setBusy(true);
    const res = await fetch('/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, role }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setErr(data.error || 'Registration failed.');
    router.push(role === 'employer' ? '/employer' : '/dashboard');
    router.refresh();
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" style={{ maxWidth: 500 }} onSubmit={submit}>
        <div className="auth-logo">
          <img src="/img/logo.jpg" alt="Umbrella Marketplace" />
          <h2 style={{ fontSize: 24 }}>Create your account</h2>
          <p className="muted" style={{ fontSize: 14 }}>Free forever — join in seconds</p>
        </div>

        {err && <div className="alert alert-err">{err}</div>}

        <div className="role-toggle">
          <button type="button" className={role === 'worker' ? 'active' : ''} onClick={() => setRole('worker')}>Worker / Freelancer</button>
          <button type="button" className={role === 'employer' ? 'active' : ''} onClick={() => setRole('employer')}>Employer</button>
        </div>

        <div className="field-row">
          <div className="field"><label>First name</label><input value={form.first_name} onChange={set('first_name')} required placeholder="Tatenda" /></div>
          <div className="field"><label>Last name</label><input value={form.last_name} onChange={set('last_name')} required placeholder="Moyo" /></div>
        </div>

        {role === 'employer' && (
          <div className="field"><label>Company name</label><input value={form.company_name} onChange={set('company_name')} placeholder="TechHub Harare" /></div>
        )}

        <div className="field"><label>Email address</label><input type="email" value={form.email} onChange={set('email')} required placeholder="you@email.com" /></div>
        <div className="field"><label>Location</label><input value={form.location} onChange={set('location')} placeholder="Harare, Zimbabwe" /></div>

        {role === 'worker' && (
          <div className="field"><label>Skills (comma-separated)</label><input value={form.skills} onChange={set('skills')} placeholder="React, Python, Design" /></div>
        )}

        <div className="field-row">
          <div className="field"><label>Password</label><input type="password" value={form.password} onChange={set('password')} required placeholder="Min. 8 characters" /></div>
          <div className="field"><label>Confirm</label><input type="password" value={form.confirm} onChange={set('confirm')} required placeholder="Repeat" /></div>
        </div>

        <button className="btn btn-primary btn-full btn-lg" disabled={busy}>
          {busy ? 'Creating…' : 'Create account'}
        </button>
        <p className="text-center muted mt-24" style={{ fontSize: 13 }}>
          Already have an account? <Link href="/login" style={{ color: 'var(--brand)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </form>
    </div>
  );
}

export default function Register() {
  return <Suspense fallback={<div className="auth-wrap"><div className="auth-card">Loading…</div></div>}><RegisterForm /></Suspense>;
}
