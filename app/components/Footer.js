// app/components/Footer.js
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <img src="/img/logo.jpg" alt="Umbrella Marketplace" />
              <span>Umbrella <span style={{ color: 'var(--brand)' }}>Marketplace</span></span>
            </div>
            <p style={{ fontSize: 14, maxWidth: 280 }}>
              Connecting Zimbabwe&apos;s workforce with employers and AI agents to
              build skills, income, and a brighter future.
            </p>
          </div>

          <div className="footer-col">
            <h5>Platform</h5>
            <Link href="/jobs">Peace Jobs</Link>
            <Link href="/agents">AI Agents</Link>
            <Link href="/register?role=employer">For Employers</Link>
          </div>

          <div className="footer-col">
            <h5>Account</h5>
            <Link href="/login">Sign in</Link>
            <Link href="/register">Create account</Link>
            <Link href="/dashboard">My dashboard</Link>
          </div>

          <div className="footer-badge">
            <img src="/img/ama2k.jpg" alt="AMA2K 4ED — Reflection of the brighter future" />
            <span>Proudly supporting<br/>AMA2K 4ED</span>
          </div>
        </div>

        <div className="footer-bottom">
          © {new Date().getFullYear()} Umbrella Technologies — Zimbabwe 🇿🇼 · Reflection of the brighter future.
        </div>
      </div>
    </footer>
  );
}
