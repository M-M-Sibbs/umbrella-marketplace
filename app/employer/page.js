'use client';
// app/employer/page.js — Employer dashboard
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Employer() {
  const [user, setUser] = useState(null);
  const [apps, setApps] = useState([]);
  const [subs, setSubs] = useState([]);
  const [agents, setAgents] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [flash, setFlash] = useState('');
  const router = useRouter();

  const [job, setJob] = useState({ title: '', category: 'Development', ai_agent_id: '', description: '', reward_amount: '', reward_currency: 'USD', payment_terms: '', tags: '', deadline: '' });
  const [assign, setAssign] = useState({});
  const [feedback, setFeedback] = useState({});

  async function load() {
    const me = await (await fetch('/api/auth/me')).json();
    if (!me.user) { router.push('/login'); return; }
    if (me.user.role !== 'employer') { router.push('/dashboard'); return; }
    setUser(me.user);
    const [a, s, ag] = await Promise.all([
      fetch('/api/applications').then(r => r.json()),
      fetch('/api/submissions').then(r => r.json()),
      fetch('/api/agents').then(r => r.json()),
    ]);
    setApps(a.applications || []);
    setSubs(s.submissions || []);
    setAgents(ag.agents || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function postJob(e) {
    e.preventDefault();
    const res = await fetch('/api/jobs', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(job),
    });
    const data = await res.json();
    if (!res.ok) return setFlash(data.error || 'Could not post.');
    setFlash('✓ Job posted!');
    setJob({ title: '', category: 'Development', ai_agent_id: '', description: '', reward_amount: '', reward_currency: 'USD', payment_terms: '', tags: '', deadline: '' });
    setTab('overview');
  }

  async function selectWorker(appId) {
    const res = await fetch('/api/applications', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ application_id: appId, ai_agent_id: assign[appId] ? Number(assign[appId]) : null }),
    });
    if (res.ok) { setFlash('✓ Worker selected and matched with AI agent.'); load(); }
  }

  async function review(subId, action) {
    const res = await fetch('/api/submissions', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submission_id: subId, action, feedback: feedback[subId] || '' }),
    });
    if (res.ok) { setFlash(action === 'approve' ? '✓ Approved! Process payment per your terms.' : 'Revision requested.'); load(); }
  }

  if (loading) return <main className="wrap" style={{ padding: 60 }}><div className="card text-center muted">Loading…</div></main>;

  const pending = apps.filter(a => a.status === 'pending');
  const cats = ['Development', 'Design', 'Data', 'Writing', 'Marketing', 'Community', 'Other'];
  const set = (k) => (e) => setJob({ ...job, [k]: e.target.value });

  return (
    <main className="dash">
      <aside className="dash-side">
        <div className="dash-user">
          <div className="av" style={{ background: '#ede7f6', color: '#5e35b1' }}>{(user.company_name || user.first_name).slice(0, 2).toUpperCase()}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{user.company_name || `${user.first_name} ${user.last_name}`}</div>
            <div className="muted" style={{ fontSize: 11 }}>Employer account</div>
          </div>
        </div>
        <nav className="dash-nav">
          {[['overview', 'Overview'], ['post', 'Post a job'], ['applicants', `Applicants${pending.length ? ` (${pending.length})` : ''}`], ['review', `Review work${subs.length ? ` (${subs.length})` : ''}`]].map(([t, l]) => (
            <a key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)} style={{ cursor: 'pointer' }}>{l}</a>
          ))}
          <Link href="/profile">My profile</Link>
        </nav>
      </aside>

      <section className="dash-main">
        {flash && <div className="alert alert-ok">{flash}</div>}

        {tab === 'overview' && (
          <>
            <h2 className="mb-24">Employer overview</h2>
            <div className="dash-stats">
              <div className="stat"><div className="n">{apps.length}</div><div className="l">Total applicants</div></div>
              <div className="stat"><div className="n">{pending.length}</div><div className="l">Pending</div></div>
              <div className="stat"><div className="n">{subs.length}</div><div className="l">To review</div></div>
              <div className="stat"><div className="n">{apps.filter(a => a.status === 'completed').length}</div><div className="l">Completed</div></div>
            </div>
            <button className="btn btn-primary" onClick={() => setTab('post')}>+ Post a new job</button>
          </>
        )}

        {tab === 'post' && (
          <>
            <h2 className="mb-24">Post a new job</h2>
            <form className="card" style={{ maxWidth: 640 }} onSubmit={postJob}>
              <div className="field"><label>Job title *</label><input value={job.title} onChange={set('title')} required placeholder="e.g. Build a community reporting dashboard" /></div>
              <div className="field-row">
                <div className="field"><label>Category *</label><select value={job.category} onChange={set('category')}>{cats.map(c => <option key={c}>{c}</option>)}</select></div>
                <div className="field"><label>Recommended AI agent</label><select value={job.ai_agent_id} onChange={set('ai_agent_id')}><option value="">None</option>{agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
              </div>
              <div className="field"><label>Description *</label><textarea rows={5} value={job.description} onChange={set('description')} required placeholder="Describe the task, deliverables, and deadline…" /></div>
              <div className="field-row">
                <div className="field"><label>Reward amount *</label><input type="number" min="1" value={job.reward_amount} onChange={set('reward_amount')} required placeholder="250" /></div>
                <div className="field"><label>Currency</label><select value={job.reward_currency} onChange={set('reward_currency')}><option>USD</option><option>ZWL</option><option>ZAR</option></select></div>
              </div>
              <div className="field"><label>Payment terms</label><textarea rows={2} value={job.payment_terms} onChange={set('payment_terms')} placeholder="e.g. Payment via EcoCash within 48h of approval." /></div>
              <div className="field"><label>Skills / tags</label><input value={job.tags} onChange={set('tags')} placeholder="React, Writing, Design" /></div>
              <button className="btn btn-primary btn-lg">Post job</button>
            </form>
          </>
        )}

        {tab === 'applicants' && (
          <>
            <h2 className="mb-24">Pending applicants</h2>
            {pending.length === 0 && <div className="alert alert-info">No pending applicants right now.</div>}
            {pending.map(a => (
              <div className="card mb-16" key={a.id}>
                <div className="between wrap-gap mb-16">
                  <div className="flex" style={{ gap: 11 }}>
                    <div className="av" style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--brand-soft)', color: 'var(--brand-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{a.first_name[0]}{a.last_name[0]}</div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{a.first_name} {a.last_name}</div>
                      <div className="muted" style={{ fontSize: 12 }}>{a.completed_count} completed · {a.location || 'Zimbabwe'}{a.skills ? ` · ${a.skills}` : ''}</div>
                    </div>
                  </div>
                  <div className="muted" style={{ fontSize: 13, textAlign: 'right' }}>For: <strong>{a.job_title}</strong></div>
                </div>
                <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--r-md)', padding: 12, fontSize: 13, marginBottom: 14 }}>{a.cover_message}</div>
                {a.availability && <div className="muted mb-16" style={{ fontSize: 12 }}>Availability: {a.availability}</div>}
                <div className="flex wrap-gap" style={{ gap: 10, alignItems: 'flex-end' }}>
                  <div className="field" style={{ flex: 1, minWidth: 200, marginBottom: 0 }}>
                    <label>Assign AI agent</label>
                    <select value={assign[a.id] || ''} onChange={e => setAssign({ ...assign, [a.id]: e.target.value })}>
                      <option value="">No agent</option>
                      {agents.map(ag => <option key={ag.id} value={ag.id}>{ag.name}</option>)}
                    </select>
                  </div>
                  <button className="btn btn-primary" onClick={() => selectWorker(a.id)}>Select worker ✓</button>
                </div>
              </div>
            ))}
          </>
        )}

        {tab === 'review' && (
          <>
            <h2 className="mb-24">Review submitted work</h2>
            {subs.length === 0 && <div className="alert alert-info">No submissions to review.</div>}
            {subs.map(s => {
              const files = JSON.parse(s.files || '[]');
              return (
                <div className="card mb-24" key={s.id}>
                  <div className="between wrap-gap mb-16">
                    <div>
                      <strong style={{ fontSize: 16 }}>{s.job_title}</strong>
                      <div className="muted" style={{ fontSize: 12, marginTop: 3 }}>By {s.first_name} {s.last_name}</div>
                    </div>
                    <span className="badge badge-amber">Awaiting review</span>
                  </div>
                  {s.notes && <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--r-md)', padding: 12, fontSize: 13, marginBottom: 14 }}>{s.notes}</div>}
                  {files.length > 0 && (
                    <div className="mb-16">
                      <div className="muted" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase' }}>Files</div>
                      {files.map((f, i) => <span className="tag" key={i}>{f.name}</span>)}
                    </div>
                  )}
                  <div className="field"><label>Feedback (optional)</label><textarea rows={2} value={feedback[s.id] || ''} onChange={e => setFeedback({ ...feedback, [s.id]: e.target.value })} /></div>
                  <div className="flex wrap-gap" style={{ gap: 8 }}>
                    <button className="btn btn-ghost" onClick={() => review(s.id, 'revision')}>Request revision</button>
                    <button className="btn btn-success" onClick={() => review(s.id, 'approve')}>Approve &amp; mark paid — {s.reward_currency} {Number(s.reward_amount).toLocaleString()} ✓</button>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </section>
    </main>
  );
}
