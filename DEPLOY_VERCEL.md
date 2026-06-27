# Deploying Umbrella Marketplace to Vercel

Vercel is serverless, so it has no permanent disk. We use **Turso** (free,
SQLite-compatible cloud database) so your data survives. Two free accounts, ~15 minutes.

---

## Part 1 — Create the Turso database (free)

1. Go to **https://turso.tech** and sign up (use your GitHub account).
2. Install the Turso CLI, or use their web dashboard. Easiest is the dashboard:
   - Click **Create Database** → name it `umbrella` → pick the region closest to Zimbabwe (e.g. `eu-central` / Frankfurt).
3. Once created, open the database and find:
   - **Database URL** — looks like `libsql://umbrella-yourname.turso.io`
   - **Create a token** → copy the **auth token** (a long string)
4. Keep both of these — you'll paste them into Vercel in Part 3.

*(CLI alternative: `turso db create umbrella`, then `turso db show umbrella --url` and `turso db tokens create umbrella`.)*

---

## Part 2 — Push your code to GitHub

1. Create a free account at **https://github.com** if you don't have one.
2. Create a new **empty** repository called `umbrella-marketplace`.
3. In a terminal inside the project folder:

```bash
git init
git add .
git commit -m "Umbrella Marketplace v2"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/umbrella-marketplace.git
git push -u origin main
```

---

## Part 3 — Deploy on Vercel

1. Go to **https://vercel.com** and sign up with your GitHub account.
2. Click **Add New… → Project**.
3. Import your `umbrella-marketplace` repo.
4. Before clicking Deploy, open **Environment Variables** and add these three:

   | Name | Value |
   |---|---|
   | `TURSO_DATABASE_URL` | your `libsql://…` URL from Part 1 |
   | `TURSO_AUTH_TOKEN`   | your Turso auth token from Part 1 |
   | `JWT_SECRET`         | any long random string (e.g. mash the keyboard for 40+ chars) |

5. Click **Deploy**. Wait ~2 minutes.
6. Visit your live URL (something like `umbrella-marketplace.vercel.app`).

The database tables and demo data are created automatically on first load.

---

## Demo accounts (created automatically)

| Role | Email | Password |
|---|---|---|
| Admin | admin@umbrellamarketplace.co.zw | Admin@1234 |
| Employer | employer@demo.co.zw | Demo@1234 |
| Worker | worker@demo.co.zw | Demo@1234 |

**Sign in as admin and change the password before sharing the site.**

---

## Running locally first (recommended before deploying)

You don't need Turso to test locally — it falls back to a local file:

```bash
npm install
npm run dev
```

Open http://localhost:3000. A local `data/umbrella.db` is created automatically.

When you deploy to Vercel with the Turso env vars set, it uses Turso instead.

---

## Custom domain (optional)

In Vercel → your project → **Settings → Domains**, add your domain
(e.g. `umbrellamarketplace.co.zw`) and follow the DNS instructions.

---

## Updating the site later

Just push to GitHub — Vercel redeploys automatically:

```bash
git add .
git commit -m "my changes"
git push
```

---

## Troubleshooting

- **"Internal Server Error" on first load** — check all three environment variables are set in Vercel (Settings → Environment Variables), then redeploy.
- **Data resets** — means Turso isn't connected; the app fell back to the temporary serverless disk. Re-check `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`.
- **Login doesn't persist** — make sure `JWT_SECRET` is set and stays the same across deploys.

---

*Built by Umbrella Technologies — Zimbabwe 🇿🇼*
