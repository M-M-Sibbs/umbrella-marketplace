import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { qOne, run } from '@/lib/db';
import { signToken, COOKIE, cookieOptions } from '@/lib/auth';

export async function POST(req) {
  const b = await req.json();
  const { first_name, last_name, email, password, role, location, company_name, skills } = b;
  if (!first_name || !last_name || !email || !password)
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
  if (password.length < 8)
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });

  const exists = await qOne('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
  if (exists) return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });

  const hash = bcrypt.hashSync(password, 12);
  const userRole = ['worker', 'employer'].includes(role) ? role : 'worker';
  const info = await run(
    `INSERT INTO users (role, first_name, last_name, email, password_hash, location, company_name, skills)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [userRole, first_name.trim(), last_name.trim(), email.toLowerCase().trim(), hash,
     location || null, userRole === 'employer' ? (company_name || null) : null,
     userRole === 'worker' ? (skills || null) : null]
  );

  const token = signToken({ id: info.lastInsertRowid, role: userRole, email });
  const res = NextResponse.json({ ok: true, role: userRole });
  res.cookies.set(COOKIE, token, cookieOptions());
  return res;
}
