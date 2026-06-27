'use client';
// app/login/page.js
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setErr(''); setBusy(true);
    const res = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) { setErr(data.error || 'Login failed.'); return; }
    const dest = data.role === 'admin' ? '/admin' : data.role === 'employer' ? '/employer' : '/dashboard';
    router.push(dest);
    router.refresh();
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-logo">
          <img src="/img/logo.jpg" alt="Umbrella Marketplace" />
          <h2 style={{ fontSize: 24 }}>Welcome back</h2>
          <p className="muted" style={{ fontSize: 14 }}>Sign in to your account</p>
        </div>
        {err && <div className="alert alert-err">{err}</div>}
        <div className="field">
          <label>Email address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@email.com" />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
        </div>
        <button className="btn btn-primary btn-full btn-lg" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="text-center muted mt-24" style={{ fontSize: 13 }}>
          No account? <Link href="/register" style={{ color: 'var(--brand)', fontWeight: 600 }}>Create one free</Link>
        </p>
        <p className="text-center muted mt-8" style={{ fontSize: 12 }}>
          Demo: worker@demo.co.zw / Demo@1234
        </p>
      </form>
    </div>
  );
}
