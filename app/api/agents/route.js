import { NextResponse } from 'next/server';
import { q } from '@/lib/db';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const cat = searchParams.get('cat');
  const qq = searchParams.get('q');
  let sql = 'SELECT * FROM ai_agents WHERE is_active = 1';
  const args = [];
  if (cat) { sql += ' AND category = ?'; args.push(cat); }
  if (qq)  { sql += ' AND (name LIKE ? OR description LIKE ? OR capabilities LIKE ?)'; args.push(`%${qq}%`,`%${qq}%`,`%${qq}%`); }
  sql += ' ORDER BY sort_order, id';
  return NextResponse.json({ agents: await q(sql, args) });
}
