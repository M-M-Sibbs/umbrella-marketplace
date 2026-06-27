import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { qOne } from '@/lib/db';
import { signToken, COOKIE, cookieOptions } from '@/lib/auth';

export async function POST(req) {
  const { email, password } = await req.json();
  if (!email || !password)
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });

  const user = await qOne('SELECT * FROM users WHERE email = ? AND is_active = 1', [email.toLowerCase().trim()]);
  if (!user || !bcrypt.compareSync(password, user.password_hash))
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });

  const token = signToken(user);
  const res = NextResponse.json({ ok: true, role: user.role });
  res.cookies.set(COOKIE, token, cookieOptions());
  return res;
}
