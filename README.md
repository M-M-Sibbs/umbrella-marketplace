# Umbrella Marketplace 2.0
### AI-powered peace jobs platform for Zimbabwe — Next.js full-stack

A complete rebuild: **JavaScript everywhere** (Next.js 14 + React), modern UI,
zero-config SQLite database, and the AMA2K 4ED campaign badge in the footer.

---

## What changed from the PHP version

| Old (v1) | New (v2) |
|---|---|
| PHP backend | **Next.js API routes (JavaScript)** |
| MySQL + manual setup | **SQLite — auto-created, zero config** |
| Server-rendered PHP pages | **React components** |
| PHP sessions | **JWT in an HTTP-only cookie** |
| "Gigs" | **"Peace Jobs"** |
| — | **AMA2K 4ED badge in footer** |
| Plain light theme | **Modern gradient UI, glassy navbar, animated cards** |

The Umbrella name, logo, and favicon are all kept.

---

## Requirements

- **Node.js 18.18 or newer** (download from https://nodejs.org — get the LTS version)
- That's it. No database server, no PHP, no XAMPP.

---

## Setup (3 commands)

Open a terminal **inside the project folder** and run:

```bash
npm install
npm run dev
```

Then open **http://localhost:3000** in your browser.

The SQLite database is created automatically the first time it runs,
and seeded with sample agents, demo accounts, and demo peace jobs.

To build for production:

```bash
npm run build
npm start
```

---

## Demo accounts (created automatically)

| Role | Email | Password |
|---|---|---|
| Admin | admin@umbrellamarketplace.co.zw | Admin@1234 |
| Employer | employer@demo.co.zw | Demo@1234 |
| Worker | worker@demo.co.zw | Demo@1234 |

**Change the admin password before going live.**

---

## How to test the full flow

1. **http://localhost:3000** — homepage
2. Sign in as the **worker** (worker@demo.co.zw / Demo@1234)
3. Go to **Peace Jobs** → click **Apply now** on any job → fill the form → submit
4. Sign out, sign in as the **employer** (employer@demo.co.zw / Demo@1234)
5. **Employer → Applicants** → assign an AI agent → **Select worker**
6. Sign out, sign back in as the **worker**
7. **Dashboard → My applications** — you're now "selected", with an "Open agent" link
8. **Dashboard → Submit work** — choose the job, add notes and file names, submit
9. Sign in as the employer → **Review work** → **Approve & mark paid**

---

## Project structure

```
umbrella-marketplace/
├── package.json
├── next.config.js
├── jsconfig.json
│
├── lib/
│   ├── db.js            # SQLite connection + schema + seed data
│   └── auth.js          # JWT sign/verify, getCurrentUser
│
├── app/
│   ├── layout.js        # Root layout, metadata, favicon
│   ├── globals.css      # Full modern design system
│   ├── page.js          # Homepage
│   │
│   ├── components/
│   │   ├── Navbar.js    # Glassy sticky navbar with auth state
│   │   └── Footer.js    # Footer with AMA2K 4ED badge
│   │
│   ├── login/           # Sign in
│   ├── register/        # Sign up (worker / employer)
│   ├── jobs/            # Peace Jobs board + apply modal
│   ├── agents/          # AI Agents marketplace
│   ├── dashboard/       # Worker dashboard
│   ├── employer/        # Employer dashboard
│   ├── admin/           # Admin panel (manage AI agents)
│   ├── profile/         # User profile
│   │
│   └── api/
│       ├── auth/        # register, login, logout, me
│       ├── jobs/        # list + create peace jobs
│       ├── applications/# apply, list, select worker
│       ├── submissions/ # submit work, review
│       ├── agents/      # public agent list
│       └── admin/agents/# admin CRUD
│
├── public/img/
│   ├── logo.jpg         # Umbrella Marketplace logo (navbar + favicon)
│   └── ama2k.jpg        # AMA2K 4ED campaign badge (footer)
│
└── data/                # SQLite database lives here (auto-created)
```

---

## Where things are stored

- **Database file:** `data/umbrella.db` (created automatically). Back this up to keep your data.
- **Uploaded logos/images:** `public/img/`
- To **reset everything**, delete `data/umbrella.db` and restart — it re-seeds.

---

## Deploying online

This deploys to any Node host (Railway, Render, a VPS, etc.). For Vercel, note that
SQLite needs a persistent disk — on serverless platforms switch `lib/db.js` to a hosted
database (Postgres/Turso). For a normal VPS or Railway with a volume, it works as-is.

---

## Security notes

- Passwords hashed with bcrypt (cost 12)
- Auth via signed JWT in an HTTP-only, SameSite=Lax cookie
- All inputs validated server-side in the API routes
- Set a strong `JWT_SECRET` environment variable in production:
  ```bash
  JWT_SECRET="your-long-random-secret" npm start
  ```

---

*Built by Umbrella Technologies — Zimbabwe 🇿🇼 · Reflection of the brighter future.*
