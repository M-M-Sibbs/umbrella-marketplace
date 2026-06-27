import { NextResponse } from 'next/server';
import { q, qOne, run } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  if (user.role === 'employer') {
    const rows = await q(`
      SELECT a.*, j.title AS job_title, j.reward_amount, j.reward_currency,
             u.first_name, u.last_name, u.skills, u.location,
             (SELECT COUNT(*) FROM applications WHERE worker_id = a.worker_id AND status='completed') AS completed_count
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN users u ON a.worker_id = u.id
      WHERE j.employer_id = ?
      ORDER BY a.submitted_at DESC`, [user.id]);
    return NextResponse.json({ applications: rows });
  }

  const rows = await q(`
    SELECT a.*, j.title, j.category, j.reward_amount, j.reward_currency, j.payment_terms,
           ai.name AS agent_name, ai.agent_url,
           u.company_name, u.first_name AS emp_first, u.last_name AS emp_last
    FROM applications a
    JOIN jobs j ON a.job_id = j.id
    JOIN users u ON j.employer_id = u.id
    LEFT JOIN ai_agents ai ON a.ai_agent_id = ai.id
    WHERE a.worker_id = ?
    ORDER BY a.submitted_at DESC`, [user.id]);
  return NextResponse.json({ applications: rows });
}

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Please sign in to apply.' }, { status: 401 });

  const { job_id, cover_message, availability } = await req.json();
  if (!job_id) return NextResponse.json({ error: 'Invalid job.' }, { status: 400 });
  if (!cover_message || cover_message.trim().length < 5)
    return NextResponse.json({ error: 'Please write a cover message (at least 5 characters).' }, { status: 400 });

  const job = await qOne("SELECT id FROM jobs WHERE id = ? AND status = 'open'", [job_id]);
  if (!job) return NextResponse.json({ error: 'This job is no longer open.' }, { status: 400 });

  const dup = await qOne('SELECT id FROM applications WHERE job_id = ? AND worker_id = ?', [job_id, user.id]);
  if (dup) return NextResponse.json({ error: 'You have already applied for this job.' }, { status: 409 });

  await run(`INSERT INTO applications (job_id, worker_id, cover_message, availability) VALUES (?, ?, ?, ?)`,
            [job_id, user.id, cover_message.trim(), availability || null]);
  return NextResponse.json({ ok: true });
}

export async function PATCH(req) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'employer') return NextResponse.json({ error: 'Not allowed.' }, { status: 403 });

  const { application_id, ai_agent_id } = await req.json();
  const app = await qOne(`
    SELECT a.id, a.job_id FROM applications a
    JOIN jobs j ON a.job_id = j.id
    WHERE a.id = ? AND j.employer_id = ? AND a.status = 'pending'`, [application_id, user.id]);
  if (!app) return NextResponse.json({ error: 'Application not found.' }, { status: 404 });

  await run(`UPDATE applications SET status='selected', ai_agent_id=?, selected_at=datetime('now') WHERE id=?`,
            [ai_agent_id || null, application_id]);
  await run(`UPDATE jobs SET status='in_progress' WHERE id=?`, [app.job_id]);
  return NextResponse.json({ ok: true });
}
