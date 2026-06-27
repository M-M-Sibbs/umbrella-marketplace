'use client';
// app/jobs/page.js — Peace Jobs board
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [user, setUser] = useState(null);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // job object
  const [cover, setCover] = useState('');
  const [avail, setAvail] = useState('');
  const [flash, setFlash] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (cat) params.set('cat', cat);
    const res = await fetch('/api/jobs?' + params.toString());
    const data = await res.json();
    setJobs(data.jobs || []);
    setLoading(false);
  }

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setUser(d.user));
    load();
  }, []);

  async function apply(e) {
    e.preventDefault();
    setErr('');
    if (cover.trim().length < 5) return setErr('Cover message must be at least 5 characters.');
    setBusy(true);
    const res = await fetch('/api/applications', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: modal.id, cover_message: cover, availability: avail }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setErr(data.error || 'Could not apply.');
    setModal(null); setCover(''); setAvail('');
    setFlash('✓ Application submitted! The employer will be in touch.');
    load();
  }

  const categories = [...new Set(jobs.map(j => j.category))];

  return (
    <main className="wrap" style={{ paddingTop: 40, paddingBottom: 70 }}>
      {flash && <div className="alert alert-ok">{flash} <Link href="/dashboard" style={{ fontWeight: 600 }}>View my applications →</Link></div>}

      {!user && (
        <div className="alert alert-info">
          <strong>Want to apply?</strong> <Link href="/login" style={{ fontWeight: 700 }}>Sign in</Link> or <Link href="/register" style={{ fontWeight: 700 }}>create a free account</Link>.
        </div>
      )}

      <div className="between wrap-gap mb-24">
        <div>
          <h2>Peace Jobs</h2>
          <p className="muted mt-8">{jobs.length} job{jobs.length !== 1 ? 's' : ''} building a brighter Zimbabwe</p>
        </div>
        <div className="flex" style={{ gap: 8, flexWrap: 'wrap' }}>
          <input placeholder="Search jobs…" value={q} onChange={e => setQ(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && load()}
                 style={{ padding: '10px 14px', border: '1.5px solid var(--line-2)', borderRadius: 'var(--r-md)', width: 200 }} />
          <select value={cat} onChange={e => { setCat(e.target.value); }}
                  style={{ padding: '10px 14px', border: '1.5px solid var(--line-2)', borderRadius: 'var(--r-md)' }}>
            <option value="">All categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button className="btn btn-primary btn-sm" onClick={load}>Search</button>
        </div>
      </div>

      {loading ? (
        <div className="card text-center muted">Loading jobs…</div>
      ) : jobs.length === 0 ? (
        <div className="alert alert-info">No open jobs found. <Link href="/register?role=employer">Post one yourself</Link>.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {jobs.filter(j => !cat || j.category === cat).map(j => {
            const employer = j.company_name || `${j.first_name} ${j.last_name}`;
            const tags = (j.tags || '').split(',').map(t => t.trim()).filter(Boolean);
            return (
              <div className="job-card" key={j.id}>
                <div className="between wrap-gap" style={{ alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <div className="flex wrap-gap" style={{ gap: 8, marginBottom: 6 }}>
                      <strong style={{ fontSize: 17, fontFamily: 'var(--font-head)' }}>{j.title}</strong>
                      <span className="badge badge-brand">{j.category}</span>
                      {j.agent_name && <span className="badge badge-teal">{j.agent_name}</span>}
                    </div>
                    <div className="muted" style={{ fontSize: 12.5, marginBottom: 8 }}>
                      {employer} · {j.app_count} applicant{j.app_count != 1 ? 's' : ''}
                    </div>
                    <p style={{ fontSize: 14, marginBottom: 10 }}>{j.description.slice(0, 200)}{j.description.length > 200 ? '…' : ''}</p>
                    <div>{tags.map(t => <span className="tag" key={t}>{t}</span>)}</div>
                    {j.payment_terms && <div className="muted mt-8" style={{ fontSize: 12 }}>Payment: {j.payment_terms}</div>}
                  </div>
                  <div style={{ textAlign: 'right', minWidth: 120 }}>
                    <div className="job-reward">{j.reward_currency} {Number(j.reward_amount).toLocaleString()}</div>
                    <div className="muted" style={{ fontSize: 12, marginBottom: 12 }}>Fixed price</div>
                    {!user ? (
                      <Link href="/login" className="btn btn-primary btn-sm">Sign in to apply</Link>
                    ) : j.already_applied ? (
                      <span className="badge badge-green" style={{ padding: '7px 14px' }}>Applied ✓</span>
                    ) : (
                      <button className="btn btn-primary btn-sm" onClick={() => { setModal(j); setErr(''); }}>Apply now</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <form className="modal" onSubmit={apply}>
            <div className="between mb-24" style={{ alignItems: 'flex-start' }}>
              <div>
                <h3>{modal.title}</h3>
                {modal.agent_name && <div className="muted mt-8" style={{ fontSize: 13 }}>🤖 AI agent: {modal.agent_name}</div>}
              </div>
              <button type="button" className="modal-x" onClick={() => setModal(null)}>×</button>
            </div>
            {err && <div className="alert alert-err">{err}</div>}
            <div className="field">
              <label>Cover message *</label>
              <textarea rows={4} value={cover} onChange={e => setCover(e.target.value)} required placeholder="Tell the employer why you're the best fit…" />
            </div>
            <div className="field">
              <label>Your availability</label>
              <input value={avail} onChange={e => setAvail(e.target.value)} placeholder="e.g. Available immediately, can deliver in 3 days" />
            </div>
            <div className="alert alert-info" style={{ fontSize: 13 }}>
              Once the employer selects you, our system links you to the recommended AI agent for this task.
            </div>
            <div className="flex" style={{ gap: 10 }}>
              <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={busy}>{busy ? 'Submitting…' : 'Submit application'}</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
