import { NextResponse } from 'next/server';
import { q, qOne, run } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const cat = searchParams.get('cat');
  const qq = searchParams.get('q');
  const agent = searchParams.get('agent');

  let sql = `SELECT j.*, u.company_name, u.first_name, u.last_name,
                    a.name AS agent_name, a.agent_url,
                    (SELECT COUNT(*) FROM applications WHERE job_id = j.id) AS app_count
             FROM jobs j
             JOIN users u ON j.employer_id = u.id
             LEFT JOIN ai_agents a ON j.ai_agent_id = a.id
             WHERE j.status = 'open'`;
  const args = [];
  if (cat)   { sql += ' AND j.category = ?'; args.push(cat); }
  if (qq)    { sql += ' AND (j.title LIKE ? OR j.description LIKE ? OR j.tags LIKE ?)'; args.push(`%${qq}%`,`%${qq}%`,`%${qq}%`); }
  if (agent) { sql += ' AND j.ai_agent_id = ?'; args.push(Number(agent)); }
  sql += ' ORDER BY j.created_at DESC';

  const jobs = await q(sql, args);
  const user = await getCurrentUser();
  if (user) {
    const rows = await q('SELECT job_id FROM applications WHERE worker_id = ?', [user.id]);
    const applied = new Set(rows.map(r => r.job_id));
    jobs.forEach(j => { j.already_applied = applied.has(j.id); });
  }
  return NextResponse.json({ jobs });
}

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  if (user.role !== 'employer') return NextResponse.json({ error: 'Only employers can post jobs.' }, { status: 403 });

  const b = await req.json();
  if (!b.title || !b.description || !b.category || !(Number(b.reward_amount) > 0))
    return NextResponse.json({ error: 'Title, description, category and a reward amount are required.' }, { status: 400 });

  const info = await run(
    `INSERT INTO jobs (employer_id, ai_agent_id, title, description, category, tags,
                       reward_amount, reward_currency, payment_terms, delivery_formats, deadline)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [user.id, b.ai_agent_id || null, b.title.trim(), b.description.trim(), b.category,
     b.tags || null, Number(b.reward_amount), b.reward_currency || 'USD',
     b.payment_terms || null, b.delivery_formats || null, b.deadline || null]
  );
  return NextResponse.json({ ok: true, id: info.lastInsertRowid });
}
