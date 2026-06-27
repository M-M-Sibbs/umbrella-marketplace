// lib/db.js — Turso / libSQL (Vercel-serverless safe, no migration-job calls)
import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';

let client;
let initPromise = null;

function getClient() {
  if (client) return client;
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  client = createClient(url ? { url, authToken } : { url: 'file:data/umbrella.db' });
  return client;
}

export async function q(sql, args = []) {
  await ensureInit();
  const res = await getClient().execute({ sql, args });
  return res.rows;
}
export async function qOne(sql, args = []) {
  const rows = await q(sql, args);
  return rows[0] || null;
}
export async function run(sql, args = []) {
  await ensureInit();
  const res = await getClient().execute({ sql, args });
  return { lastInsertRowid: Number(res.lastInsertRowid), changes: res.rowsAffected };
}

function ensureInit() {
  if (initPromise) return initPromise;
  initPromise = doInit().catch((e) => { initPromise = null; throw e; });
  return initPromise;
}

// Plain sequential execute() calls — these never hit the migration-jobs endpoint
// that was returning 400. Each statement is idempotent (IF NOT EXISTS).
async function doInit() {
  const c = getClient();

  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL DEFAULT 'worker',
      first_name TEXT NOT NULL, last_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL,
      avatar TEXT, bio TEXT, location TEXT, skills TEXT, company_name TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS ai_agents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL, description TEXT NOT NULL, category TEXT NOT NULL,
      icon_color TEXT DEFAULT '#1a5fb4', provider TEXT DEFAULT 'claude',
      agent_url TEXT NOT NULL, accepted_formats TEXT, capabilities TEXT,
      is_active INTEGER NOT NULL DEFAULT 1, sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employer_id INTEGER NOT NULL, ai_agent_id INTEGER,
      title TEXT NOT NULL, description TEXT NOT NULL, category TEXT NOT NULL,
      tags TEXT, reward_amount REAL NOT NULL DEFAULT 0, reward_currency TEXT NOT NULL DEFAULT 'USD',
      payment_terms TEXT, delivery_formats TEXT, deadline TEXT,
      status TEXT NOT NULL DEFAULT 'open',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER NOT NULL, worker_id INTEGER NOT NULL,
      cover_message TEXT NOT NULL, availability TEXT,
      status TEXT NOT NULL DEFAULT 'pending', ai_agent_id INTEGER,
      submitted_at TEXT NOT NULL DEFAULT (datetime('now')), selected_at TEXT,
      UNIQUE(job_id, worker_id)
    )`,
    `CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id INTEGER NOT NULL UNIQUE,
      notes TEXT, files TEXT, status TEXT NOT NULL DEFAULT 'pending',
      employer_feedback TEXT,
      submitted_at TEXT NOT NULL DEFAULT (datetime('now')), reviewed_at TEXT
    )`,
  ];
  for (const t of tables) await c.execute(t);

  const existing = await c.execute('SELECT COUNT(*) AS n FROM users');
  if (Number(existing.rows[0].n) === 0) await seed(c);
}

async function seed(c) {
  const adminHash = bcrypt.hashSync('Admin@1234', 12);
  const demoHash  = bcrypt.hashSync('Demo@1234', 12);

  await c.execute({ sql: `INSERT INTO users (role,first_name,last_name,email,password_hash)
                          VALUES ('admin','Site','Admin','admin@umbrellamarketplace.co.zw',?)`, args: [adminHash] });
  await c.execute({ sql: `INSERT INTO users (role,first_name,last_name,email,password_hash,company_name,location)
                          VALUES ('employer','TechHub','Harare','employer@demo.co.zw',?, 'TechHub Harare','Harare')`, args: [demoHash] });
  await c.execute({ sql: `INSERT INTO users (role,first_name,last_name,email,password_hash,skills,location)
                          VALUES ('worker','Tatenda','Moyo','worker@demo.co.zw',?, 'React, Python, Design','Harare')`, args: [demoHash] });

  const agents = [
    ['CodeCraft AI', 'Writes, debugs and reviews code in 15+ languages. Ideal for web and app development jobs.', 'Development', '#1a5fb4', 'claude', 'https://claude.ai', '.py,.js,.ts,.jsx,.java,.go,.php,.html,.css', 'Python, JavaScript, React, Node.js, SQL'],
    ['DocuMind AI', 'Creates, edits and formats professional documents — reports, proposals, CVs and contracts.', 'Writing', '#5e35b1', 'claude', 'https://claude.ai', '.docx,.pdf,.md,.txt', 'Word documents, PDF, Reports, Proposals'],
    ['PixelPro AI', 'Generates and refines images, logos, UI mockups and full brand kits.', 'Design', '#ad1457', 'claude', 'https://claude.ai', '.png,.jpg,.svg,.fig', 'Logos, Brand kits, UI mockups'],
    ['DataFlow AI', 'Analyses data, builds charts, cleans spreadsheets and creates executive dashboards.', 'Data', '#00695c', 'claude', 'https://claude.ai', '.xlsx,.csv,.json', 'Excel, CSV, Charts, Dashboards'],
    ['MarketMind AI', 'Writes SEO articles, ad copy, email campaigns and social media content.', 'Marketing', '#e65100', 'claude', 'https://claude.ai', '.txt,.docx,.md', 'Blog posts, Ad copy, Email campaigns'],
    ['CommunityCare AI', 'Drafts community outreach, conflict-resolution scripts and peace-building materials.', 'Community', '#2e7d32', 'claude', 'https://claude.ai', '.docx,.pdf,.txt', 'Outreach plans, Mediation guides'],
  ];
  for (let i = 0; i < agents.length; i++) {
    await c.execute({
      sql: `INSERT INTO ai_agents (name,description,category,icon_color,provider,agent_url,accepted_formats,capabilities,sort_order)
            VALUES (?,?,?,?,?,?,?,?,?)`,
      args: [...agents[i], i],
    });
  }

  const empRow = await c.execute(`SELECT id FROM users WHERE email='employer@demo.co.zw'`);
  const empId = Number(empRow.rows[0].id);

  const jobs = [
    [empId, 1, 'Build a community reporting dashboard', 'Create a React dashboard for a local NGO to track community peace initiatives, with charts and Excel export.', 'Development', 'React, Charts, Excel', 250, 'USD', 'Payment via EcoCash within 48h of approval.'],
    [empId, 6, 'Write peace-building workshop materials', 'Produce a facilitator guide and 5 handouts for youth conflict-resolution workshops across Harare.', 'Community', 'Writing, Facilitation', 150, 'USD', 'Bank transfer on completion.'],
    [empId, 3, 'Design brand kit for youth peace campaign', 'Logo, colour palette and social media templates for a national youth peace campaign.', 'Design', 'Logo, SVG, Branding', 180, 'USD', 'Payment via EcoCash, 50% upfront.'],
  ];
  for (const j of jobs) {
    await c.execute({
      sql: `INSERT INTO jobs (employer_id,ai_agent_id,title,description,category,tags,reward_amount,reward_currency,payment_terms)
            VALUES (?,?,?,?,?,?,?,?,?)`,
      args: j,
    });
  }
}
