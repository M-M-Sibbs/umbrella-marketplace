'use client';
// app/agents/page.js
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (cat) params.set('cat', cat);
    const res = await fetch('/api/agents?' + params.toString());
    const data = await res.json();
    setAgents(data.agents || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const categories = [...new Set(agents.map(a => a.category))];

  return (
    <main className="wrap" style={{ paddingTop: 40, paddingBottom: 70 }}>
      <div className="between wrap-gap mb-24">
        <div>
          <h2>AI Agents</h2>
          <p className="muted mt-8">{agents.length} specialised agents ready to help you deliver great work</p>
        </div>
        <div className="flex" style={{ gap: 8, flexWrap: 'wrap' }}>
          <input placeholder="Search agents…" value={q} onChange={e => setQ(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && load()}
                 style={{ padding: '10px 14px', border: '1.5px solid var(--line-2)', borderRadius: 'var(--r-md)', width: 200 }} />
          <select value={cat} onChange={e => setCat(e.target.value)}
                  style={{ padding: '10px 14px', border: '1.5px solid var(--line-2)', borderRadius: 'var(--r-md)' }}>
            <option value="">All categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button className="btn btn-primary btn-sm" onClick={load}>Search</button>
        </div>
      </div>

      {loading ? (
        <div className="card text-center muted">Loading agents…</div>
      ) : (
        <div className="grid-auto">
          {agents.filter(a => !cat || a.category === cat).map(a => (
            <div className="agent-card" key={a.id}>
              <div className="between" style={{ alignItems: 'flex-start', marginBottom: 14 }}>
                <div className="agent-ic" style={{ background: a.icon_color + '22' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="6" width="18" height="12" rx="3" stroke={a.icon_color} strokeWidth="1.8"/>
                    <path d="M8 11h8M8 14h5" stroke={a.icon_color} strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="badge badge-brand">{a.category}</span>
              </div>
              <h4 style={{ fontSize: 16, marginBottom: 5 }}>{a.name}</h4>
              <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 10 }}>{a.description}</p>
              {a.capabilities && <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 10 }}>{a.capabilities}</p>}
              {a.accepted_formats && <div style={{ fontSize: 11, color: 'var(--ink-4)', marginBottom: 14 }}>{a.accepted_formats}</div>}
              <div className="flex" style={{ gap: 8, flexWrap: 'wrap' }}>
                <a href={a.agent_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">Open agent ↗</a>
                <Link href={`/jobs?agent=${a.id}`} className="btn btn-ghost btn-sm">Find jobs</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
