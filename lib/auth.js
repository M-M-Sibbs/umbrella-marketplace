// lib/auth.js — JWT-based authentication (async, Turso-compatible)
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { qOne } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'umbrella-marketplace-dev-secret-change-in-production';
const COOKIE_NAME = 'umbrella_token';

export function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  try { return jwt.verify(token, JWT_SECRET); } catch { return null; }
}

// Async — reads cookie, verifies JWT, loads user from DB
export async function getCurrentUser() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  return await qOne(
    'SELECT id, role, first_name, last_name, email, avatar, bio, location, skills, company_name, is_active FROM users WHERE id = ? AND is_active = 1',
    [payload.id]
  );
}

export const COOKIE = COOKIE_NAME;

export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === 'production',
  };
}
