'use client';
// app/profile/page.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/login'); return; }
      setUser(d.user); setLoading(false);
    });
  }, []);

  if (loading) return <main className="wrap" style={{ padding: 60 }}><div className="card text-center muted">Loading…</div></main>;

  return (
    <main className="wrap-sm" style={{ paddingTop: 40, paddingBottom: 70 }}>
      <h2 className="mb-24">My profile</h2>
      <div className="card">
        <div className="flex mb-24" style={{ gap: 16 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--brand-soft)', color: 'var(--brand-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700 }}>
            {user.first_name[0]}{user.last_name[0]}
          </div>
          <div>
            <h3>{user.first_name} {user.last_name}</h3>
            <div className="muted" style={{ fontSize: 13 }}>{user.email}</div>
            <span className="badge badge-brand mt-8" style={{ textTransform: 'capitalize' }}>{user.role}</span>
          </div>
        </div>
        <div className="field"><label>Location</label><div className="muted">{user.location || 'Not set'}</div></div>
        {user.role === 'worker' && <div className="field"><label>Skills</label><div className="muted">{user.skills || 'Not set'}</div></div>}
        {user.role === 'employer' && <div className="field"><label>Company</label><div className="muted">{user.company_name || 'Not set'}</div></div>}
        {user.bio && <div className="field"><label>Bio</label><div className="muted">{user.bio}</div></div>}
      </div>
    </main>
  );
}
