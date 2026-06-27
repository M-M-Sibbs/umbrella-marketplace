'use client';
// app/components/Navbar.js
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setUser(d.user)).catch(() => {});
  }, [path]);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/');
    router.refresh();
  }

  const link = (href, label) => (
    <Link href={href} className={path === href ? 'active' : ''}>{label}</Link>
  );

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" className="nav-brand">
          <img src="/img/logo.jpg" alt="Umbrella Marketplace" />
          <span>Umbrella <em>Marketplace</em></span>
        </Link>

        <div className="nav-links">
          {link('/', 'Home')}
          {link('/agents', 'AI Agents')}
          {link('/jobs', 'Peace Jobs')}
          {user?.role === 'worker'   && link('/dashboard', 'Dashboard')}
          {user?.role === 'employer' && link('/employer', 'Employer')}
          {user?.role === 'admin'    && link('/admin', 'Admin')}
        </div>

        <div className="nav-cta">
          {user ? (
            <>
              <Link href="/profile" className="nav-avatar" title="My profile">
                {user.avatar
                  ? <img src={user.avatar} alt="" />
                  : (user.first_name?.[0] || '') + (user.last_name?.[0] || '')}
              </Link>
              <button className="btn btn-ghost btn-sm" onClick={logout}>Sign out</button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost btn-sm">Sign in</Link>
              <Link href="/register" className="btn btn-primary btn-sm">Get started</Link>
            </>
          )}
          <button className="burger" onClick={() => setOpen(!open)} aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>

      {open && (
        <div style={{ padding: '12px 24px', borderTop: '1px solid var(--line)', background: 'var(--surface)' }}>
          <Link href="/" style={{ display: 'block', padding: '10px 0' }}>Home</Link>
          <Link href="/agents" style={{ display: 'block', padding: '10px 0' }}>AI Agents</Link>
          <Link href="/jobs" style={{ display: 'block', padding: '10px 0' }}>Peace Jobs</Link>
          {user?.role === 'worker'   && <Link href="/dashboard" style={{ display: 'block', padding: '10px 0' }}>Dashboard</Link>}
          {user?.role === 'employer' && <Link href="/employer" style={{ display: 'block', padding: '10px 0' }}>Employer</Link>}
          {user?.role === 'admin'    && <Link href="/admin" style={{ display: 'block', padding: '10px 0' }}>Admin</Link>}
        </div>
      )}
    </nav>
  );
}
