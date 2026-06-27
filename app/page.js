// app/page.js — Homepage (async server component)
import Link from 'next/link';
import { qOne, q } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const workers  = (await qOne("SELECT COUNT(*) n FROM users WHERE role='worker'")).n;
  const jobs     = (await qOne("SELECT COUNT(*) n FROM jobs WHERE status='open'")).n;
  const agentsN  = (await qOne("SELECT COUNT(*) n FROM ai_agents WHERE is_active=1")).n;
  const featured = await q("SELECT * FROM ai_agents WHERE is_active=1 ORDER BY sort_order LIMIT 4");

  const steps = [
    { n: 'STEP 01', bg: 'var(--brand-soft)', color: 'var(--brand)', t: 'Sign up & apply',
      d: 'Create a free profile and apply for peace jobs posted by employers across Zimbabwe.' },
    { n: 'STEP 02', bg: '#e0f4f1', color: '#0a6b5a', t: 'Get matched with an AI agent',
      d: 'When an employer selects you, our system pairs you with the ideal AI agent for the task.' },
    { n: 'STEP 03', bg: '#e6f6ec', color: 'var(--accent-green)', t: 'Deliver & get paid',
      d: 'Submit your work in any format. The employer reviews, approves, and pays you directly.' },
  ];

  return (
    <main>
      <section className="hero">
        <div className="wrap">
          <span className="eyebrow">🌍 Empowering Zimbabwe&apos;s workforce with AI</span>
          <h1>Find peace jobs. Get paired with <span className="grad">AI agents.</span> Get paid.</h1>
          <p>Umbrella Marketplace connects job seekers with employers, then matches every worker with the perfect AI agent to deliver outstanding results.</p>
          <div className="hero-cta">
            <Link href="/jobs" className="btn btn-primary btn-lg">Browse peace jobs</Link>
            <Link href="/register?role=employer" className="btn btn-ghost btn-lg">Post a job</Link>
          </div>
          <div className="stats">
            <div className="stat"><div className="n">{workers}+</div><div className="l">Active workers</div></div>
            <div className="stat"><div className="n">{jobs}+</div><div className="l">Open peace jobs</div></div>
            <div className="stat"><div className="n">{agentsN}</div><div className="l">AI agents</div></div>
            <div className="stat"><div className="n">95%</div><div className="l">Completion rate</div></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div className="kicker">How it works</div>
            <h2>Three steps to your next job</h2>
            <p>From application to payment, the whole journey is built to be simple and fair.</p>
          </div>
          <div className="steps3">
            {steps.map((s, i) => (
              <div className="step-card" key={i}>
                <div className="num">{s.n}</div>
                <div className="ic" style={{ background: s.bg }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" stroke={s.color} strokeWidth="2"/>
                    <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" stroke={s.color} strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <h4>{s.t}</h4>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--surface-2)' }}>
        <div className="wrap">
          <div className="between wrap-gap mb-24">
            <div>
              <div style={{ color: 'var(--brand)', fontSize: 13, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>Powered by AI</div>
              <h2 style={{ marginTop: 8 }}>Featured AI agents</h2>
            </div>
            <Link href="/agents" className="btn btn-ghost">View all →</Link>
          </div>
          <div className="grid-auto">
            {featured.map(a => (
              <Link key={a.id} href="/agents" className="agent-card">
                <div className="agent-ic" style={{ background: a.icon_color + '22' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="6" width="18" height="12" rx="3" stroke={a.icon_color} strokeWidth="1.8"/>
                    <path d="M8 11h8M8 14h5" stroke={a.icon_color} strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </div>
                <h4 style={{ fontSize: 16, marginBottom: 5 }}>{a.name}</h4>
                <p style={{ fontSize: 13, color: 'var(--ink-3)' }}>{a.description}</p>
                <span className="badge badge-brand mt-16">{a.category}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-3))', borderRadius: 'var(--r-xl)', padding: '54px 32px', textAlign: 'center', color: '#fff', boxShadow: 'var(--shadow-brand)' }}>
            <h2 style={{ color: '#fff' }}>Ready to start earning?</h2>
            <p style={{ color: 'rgba(255,255,255,0.85)', maxWidth: 440, margin: '12px auto 28px', fontSize: 17 }}>
              Join thousands of Zimbabweans building skills and income on the platform.
            </p>
            <Link href="/register" className="btn btn-lg" style={{ background: '#fff', color: 'var(--brand-2)' }}>
              Create free account
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
