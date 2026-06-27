import { NextResponse } from 'next/server';
import { q, qOne, run } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

async function requireAdmin() {
  const user = await getCurrentUser();
  return (user && user.role === 'admin') ? user : null;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Not allowed.' }, { status: 403 });
  return NextResponse.json({ agents: await q('SELECT * FROM ai_agents ORDER BY sort_order, id') });
}

export async function POST(req) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Not allowed.' }, { status: 403 });
  const b = await req.json();
  if (!b.name || !b.description || !b.agent_url)
    return NextResponse.json({ error: 'Name, description and agent URL are required.' }, { status: 400 });
  await run(`INSERT INTO ai_agents (name,description,category,icon_color,provider,agent_url,accepted_formats,capabilities,is_active,sort_order)
             VALUES (?,?,?,?,?,?,?,?,?,?)`,
            [b.name, b.description, b.category || 'General', b.icon_color || '#1a5fb4',
             b.provider || 'claude', b.agent_url, b.accepted_formats || null, b.capabilities || null,
             b.is_active ? 1 : 0, b.sort_order || 0]);
  return NextResponse.json({ ok: true });
}

export async function PATCH(req) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Not allowed.' }, { status: 403 });
  const b = await req.json();
  if (b.toggle) {
    const cur = await qOne('SELECT is_active FROM ai_agents WHERE id=?', [b.id]);
    await run('UPDATE ai_agents SET is_active=? WHERE id=?', [cur.is_active ? 0 : 1, b.id]);
    return NextResponse.json({ ok: true });
  }
  await run(`UPDATE ai_agents SET name=?,description=?,category=?,icon_color=?,provider=?,agent_url=?,accepted_formats=?,capabilities=?,is_active=?,sort_order=? WHERE id=?`,
            [b.name, b.description, b.category, b.icon_color, b.provider, b.agent_url,
             b.accepted_formats, b.capabilities, b.is_active ? 1 : 0, b.sort_order || 0, b.id]);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Not allowed.' }, { status: 403 });
  const { id } = await req.json();
  await run('DELETE FROM ai_agents WHERE id=?', [id]);
  return NextResponse.json({ ok: true });
}
