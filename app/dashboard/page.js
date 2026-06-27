'use client';
// app/dashboard/page.js — Worker dashboard
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [apps, setApps] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [flash, setFlash] = useState('');
  const router = useRouter();

  // submit-work form state
  const [appId, setAppId] = useState('');
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState([]);

  async function load() {
    const me = await (await fetch('/api/auth/me')).json();
    if (!me.user) { router.push('/login'); return; }
    setUser(me.user);
    const a = await (await fetch('/api/applications')).json();
    setApps(a.applications || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function submitWork(e) {
    e.preventDefault();
    const res = await fetch('/api/submissions', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ application_id: Number(appId), notes, files: files.map(f => ({ name: f })) }),
    });
    const data = await res.json();
    if (!res.ok) { setFlash(data.error || 'Could not submit.'); return; }
    setFlash('✓ Work submitted! The employer will review it.');
    setAppId(''); setNotes(''); setFiles([]);
    load();
  }

  if (loading) return <main className="wrap" style={{ padding: 60 }}><div className="card text-center muted">Loading…</div></main>;

  const selected = apps.filter(a => a.status === 'selected');
  const completed = apps.filter(a => a.status === 'completed').length;
  const earned = apps.filter(a => a.status === 'completed').reduce((s, a) => s + Number(a.reward_amount), 0);

  const badge = (s) => ({ pending: 'badge-amber', selected: 'badge-teal', completed: 'badge-green', rejected: 'badge-gray' }[s] || 'badge-gray');

  return (
    <main className="dash">
      <aside className="dash-side">
        <div className="dash-user">
          <div className="av">{(user.first_name[0] || '') + (user.last_name[0] || '')}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{user.first_name} {user.last_name}</div>
            <div className="muted" style={{ fontSize: 11 }}>Worker account</div>
          </div>
        </div>
        <nav className="dash-nav">
          {['overview', 'applications', 'submit', 'agents'].map(t => (
            <a key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)} style={{ cursor: 'pointer' }}>
              {{ overview: 'Overview', applications: 'My applications', submit: 'Submit work', agents: 'AI agents' }[t]}
            </a>
          ))}
          <Link href="/profile">My profile</Link>
          <Link href="/jobs">Browse jobs</Link>
        </nav>
      </aside>

      <section className="dash-main">
        {flash && <div className="alert alert-ok">{flash}</div>}

        {tab === 'overview' && (
          <>
            <h2 className="mb-24">Welcome back, {user.first_name}</h2>
            <div className="dash-stats">
              <div className="stat"><div className="n">{selected.length}</div><div className="l">Active jobs</div></div>
              <div className="stat"><div className="n">{completed}</div><div className="l">Completed</div></div>
              <div className="stat"><div className="n">USD {earned.toLocaleString()}</div><div className="l">Total earned</div></div>
              <div className="stat"><div className="n">{apps.length}</div><div className="l">Applications</div></div>
            </div>
            <h4 className="mb-16">Recent activity</h4>
            {apps.length === 0 && <div className="alert alert-info">No applications yet. <Link href="/jobs">Browse jobs</Link>.</div>}
            {apps.slice(0, 5).map(a => (
              <div className="card mb-16 between wrap-gap" key={a.id}>
                <div>
                  <div style={{ fontWeight: 600 }}>{a.title}</div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 3 }}>{a.company_name || `${a.emp_first} ${a.emp_last}`} · {a.reward_currency} {Number(a.reward_amount).toLocaleString()}</div>
                </div>
                <div className="flex" style={{ gap: 8 }}>
                  {a.status === 'selected' && a.agent_url && <a href={a.agent_url} target="_blank" rel="noopener" className="btn btn-primary btn-sm">Open agent ↗</a>}
                  <span className={`badge ${badge(a.status)}`}>{a.status}</span>
                </div>
              </div>
            ))}
          </>
        )}

        {tab === 'applications' && (
          <>
            <h2 className="mb-24">My applications</h2>
            {apps.length === 0 && <div className="alert alert-info">No applications yet. <Link href="/jobs">Browse jobs</Link>.</div>}
            {apps.map(a => (
              <div className="card mb-16" key={a.id}>
                <div className="between wrap-gap mb-8">
                  <strong>{a.title}</strong>
                  <span className={`badge ${badge(a.status)}`}>{a.status}</span>
                </div>
                <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>
                  {a.company_name || `${a.emp_first} ${a.emp_last}`} · {a.reward_currency} {Number(a.reward_amount).toLocaleString()}
                </div>
                {a.status === 'selected' && (
                  <div className="alert alert-info" style={{ marginBottom: 0 }}>
                    🎉 You&apos;re selected! {a.agent_name && <>AI agent: <strong>{a.agent_name}</strong> </>}
                    {a.agent_url && <a href={a.agent_url} target="_blank" rel="noopener" className="btn btn-primary btn-sm" style={{ marginLeft: 8 }}>Open agent ↗</a>}
                    <button className="btn btn-ghost btn-sm" style={{ marginLeft: 6 }} onClick={() => { setTab('submit'); setAppId(String(a.id)); }}>Submit work</button>
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {tab === 'submit' && (
          <>
            <h2 className="mb-24">Submit work</h2>
            {selected.length === 0 ? (
              <div className="alert alert-info">No selected jobs yet. Apply and wait for an employer to choose you.</div>
            ) : (
              <form className="card" style={{ maxWidth: 600 }} onSubmit={submitWork}>
                <div className="field">
                  <label>Select job *</label>
                  <select value={appId} onChange={e => setAppId(e.target.value)} required>
                    <option value="">Choose…</option>
                    {selected.map(a => <option key={a.id} value={a.id}>{a.title} — {a.reward_currency} {Number(a.reward_amount).toLocaleString()}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Notes for employer</label>
                  <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Describe what you've completed…" />
                </div>
                <div className="field">
                  <label>File names (comma-separated)</label>
                  <input value={files.join(', ')} onChange={e => setFiles(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                         placeholder="dashboard.jsx, report.pdf, export.xlsx" />
                  <div className="muted mt-8" style={{ fontSize: 12 }}>
                    All formats accepted: code, documents, images, spreadsheets and more.
                  </div>
                </div>
                <button className="btn btn-success btn-lg">Submit to employer ✓</button>
              </form>
            )}
          </>
        )}

        {tab === 'agents' && (
          <>
            <h2 className="mb-24">My AI agents</h2>
            {selected.filter(a => a.agent_name).length === 0 ? (
              <div className="alert alert-info">No agents assigned yet. Once selected for a job, your agent appears here.</div>
            ) : (
              <div className="grid-auto">
                {selected.filter(a => a.agent_name).map(a => (
                  <div className="card" key={a.id}>
                    <h4 style={{ fontSize: 16, marginBottom: 5 }}>{a.agent_name}</h4>
                    <div className="muted mb-16" style={{ fontSize: 12 }}>Assigned to: {a.title}</div>
                    <a href={a.agent_url} target="_blank" rel="noopener" className="btn btn-primary btn-sm">Open agent ↗</a>
                  </div>
                ))}
              </div>
            )}
            <Link href="/agents" className="btn btn-ghost mt-16">Browse all agents →</Link>
          </>
        )}
      </section>
    </main>
  );
}
