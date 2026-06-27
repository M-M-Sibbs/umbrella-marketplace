'use client';
// app/admin/page.js — Admin panel
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const blank = { name: '', description: '', category: 'Development', icon_color: '#1a5fb4', provider: 'claude', agent_url: 'https://claude.ai', accepted_formats: '', capabilities: '', is_active: 1, sort_order: 0 };

export default function Admin() {
  const [user, setUser] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flash, setFlash] = useState('');
  const [editing, setEditing] = useState(null); // agent object or null
  const router = useRouter();

  async function load() {
    const me = await (await fetch('/api/auth/me')).json();
    if (!me.user) { router.push('/login'); return; }
    if (me.user.role !== 'admin') { router.push('/'); return; }
    setUser(me.user);
    const a = await (await fetch('/api/admin/agents')).json();
    setAgents(a.agents || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save(e) {
    e.preventDefault();
    const method = editing.id ? 'PATCH' : 'POST';
    const res = await fetch('/api/admin/agents', {
      method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing),
    });
    if (res.ok) { setFlash(editing.id ? '✓ Agent updated.' : '✓ Agent added.'); setEditing(null); load(); }
  }
  async function toggle(id) {
    await fetch('/api/admin/agents', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, toggle: true }) });
    load();
  }
  async function del(id) {
    if (!confirm('Delete this agent?')) return;
    await fetch('/api/admin/agents', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setFlash('Agent deleted.'); load();
  }

  if (loading) return <main className="wrap" style={{ padding: 60 }}><div className="card text-center muted">Loading…</div></main>;
  const set = (k) => (e) => setEditing({ ...editing, [k]: e.target.value });

  return (
    <main className="wrap" style={{ paddingTop: 40, paddingBottom: 70 }}>
      <div className="between wrap-gap mb-24">
        <div><h2>Admin — AI Agents</h2><p className="muted mt-8">Manage the AI agents available across the platform</p></div>
        <button className="btn btn-primary" onClick={() => setEditing({ ...blank })}>+ Add agent</button>
      </div>

      {flash && <div className="alert alert-ok">{flash}</div>}

      <div className="card" style={{ overflowX: 'auto' }}>
        <table className="tbl">
          <thead><tr><th>Name</th><th>Category</th><th>Provider</th><th>URL</th><th>Active</th><th>Actions</th></tr></thead>
          <tbody>
            {agents.map(a => (
              <tr key={a.id}>
                <td><strong>{a.name}</strong></td>
                <td>{a.category}</td>
                <td>{a.provider}</td>
                <td><a href={a.agent_url} target="_blank" rel="noopener" style={{ color: 'var(--brand)', fontSize: 12 }}>Open ↗</a></td>
                <td><span className={`badge ${a.is_active ? 'badge-green' : 'badge-gray'}`}>{a.is_active ? 'Active' : 'Off'}</span></td>
                <td>
                  <div className="flex" style={{ gap: 6 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditing({ ...a })}>Edit</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => toggle(a.id)}>{a.is_active ? 'Disable' : 'Enable'}</button>
                    <button className="btn btn-danger btn-sm" onClick={() => del(a.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setEditing(null)}>
          <form className="modal" onSubmit={save}>
            <div className="between mb-24"><h3>{editing.id ? 'Edit agent' : 'Add agent'}</h3><button type="button" className="modal-x" onClick={() => setEditing(null)}>×</button></div>
            <div className="field"><label>Name *</label><input value={editing.name} onChange={set('name')} required /></div>
            <div className="field"><label>Description *</label><textarea rows={2} value={editing.description} onChange={set('description')} required /></div>
            <div className="field-row">
              <div className="field"><label>Category</label><input value={editing.category} onChange={set('category')} /></div>
              <div className="field"><label>Icon colour</label><input type="color" value={editing.icon_color} onChange={set('icon_color')} style={{ height: 44, padding: 4 }} /></div>
            </div>
            <div className="field-row">
              <div className="field"><label>Provider</label><select value={editing.provider} onChange={set('provider')}>{['claude', 'openai', 'gemini', 'custom', 'other'].map(p => <option key={p}>{p}</option>)}</select></div>
              <div className="field"><label>Sort order</label><input type="number" value={editing.sort_order} onChange={set('sort_order')} /></div>
            </div>
            <div className="field"><label>Agent URL *</label><input value={editing.agent_url} onChange={set('agent_url')} required placeholder="https://claude.ai" /></div>
            <div className="field"><label>Accepted formats</label><input value={editing.accepted_formats || ''} onChange={set('accepted_formats')} placeholder=".py,.js,.docx" /></div>
            <div className="field"><label>Capabilities</label><input value={editing.capabilities || ''} onChange={set('capabilities')} /></div>
            <label className="flex" style={{ gap: 8, marginBottom: 16, cursor: 'pointer' }}>
              <input type="checkbox" checked={!!editing.is_active} onChange={e => setEditing({ ...editing, is_active: e.target.checked ? 1 : 0 })} style={{ width: 'auto' }} />
              Active (visible on site)
            </label>
            <div className="flex" style={{ gap: 8 }}>
              <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setEditing(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>{editing.id ? 'Update' : 'Add'} agent</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
