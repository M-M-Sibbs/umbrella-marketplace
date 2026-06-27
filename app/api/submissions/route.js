import { NextResponse } from 'next/server';
import { q, qOne, run } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'employer') return NextResponse.json({ error: 'Not allowed.' }, { status: 403 });
  const rows = await q(`
    SELECT s.*, a.job_id, j.title AS job_title, j.reward_amount, j.reward_currency,
           u.first_name, u.last_name
    FROM submissions s
    JOIN applications a ON s.application_id = a.id
    JOIN jobs j ON a.job_id = j.id
    JOIN users u ON a.worker_id = u.id
    WHERE j.employer_id = ? AND s.status = 'pending'
    ORDER BY s.submitted_at DESC`, [user.id]);
  return NextResponse.json({ submissions: rows });
}

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  const { application_id, notes, files } = await req.json();
  const app = await qOne(`SELECT * FROM applications WHERE id=? AND worker_id=? AND status='selected'`, [application_id, user.id]);
  if (!app) return NextResponse.json({ error: 'You are not selected for this job.' }, { status: 400 });

  const filesJson = JSON.stringify(files || []);
  const existing = await qOne('SELECT id FROM submissions WHERE application_id = ?', [application_id]);
  if (existing) {
    await run(`UPDATE submissions SET notes=?, files=?, status='pending', submitted_at=datetime('now') WHERE application_id=?`,
              [notes || null, filesJson, application_id]);
  } else {
    await run(`INSERT INTO submissions (application_id, notes, files) VALUES (?,?,?)`,
              [application_id, notes || null, filesJson]);
  }
  return NextResponse.json({ ok: true });
}

export async function PATCH(req) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'employer') return NextResponse.json({ error: 'Not allowed.' }, { status: 403 });
  const { submission_id, action, feedback } = await req.json();
  const sub = await qOne(`
    SELECT s.id, s.application_id, a.job_id FROM submissions s
    JOIN applications a ON s.application_id = a.id
    JOIN jobs j ON a.job_id = j.id
    WHERE s.id = ? AND j.employer_id = ?`, [submission_id, user.id]);
  if (!sub) return NextResponse.json({ error: 'Submission not found.' }, { status: 404 });

  const status = action === 'approve' ? 'approved' : 'revision_requested';
  await run(`UPDATE submissions SET status=?, employer_feedback=?, reviewed_at=datetime('now') WHERE id=?`,
            [status, feedback || null, submission_id]);
  if (status === 'approved') {
    await run(`UPDATE applications SET status='completed' WHERE id=?`, [sub.application_id]);
    await run(`UPDATE jobs SET status='completed' WHERE id=?`, [sub.job_id]);
  }
  return NextResponse.json({ ok: true });
}
