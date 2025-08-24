# Togetherflow App — Setup Guide (Clone/Fork → Run Locally)

This guide explains how to fork/clone the repository and run the app on your device.

## 1) Prerequisites
- **Git**: https://git-scm.com
- **Node.js**: Version 20+ (LTS recommended). Verify:
  ```bash
  node -v
  npm -v
  ```
- **Package manager**: npm (bundled with Node). Yarn/pnpm also supported.
- **Clerk account**: Get keys at https://dashboard.clerk.com
- **MongoDB (for full features)**: MongoDB Atlas (free) or local MongoDB. Get a connection string.

## 2) Fork or Clone
- **Fork (recommended for contributions)**
  1. Open the GitHub repo in your browser
  2. Click **Fork** → choose your account/org
  3. Clone your fork:
     ```bash
     git clone https://github.com/<your-username>/<your-fork>.git
     ```
- **Clone (directly)**
  ```bash
  git clone https://github.com/<original-owner>/<repo>.git
  ```

Then change directory to the app root:
```bash
cd <repo-root>/togetherflow-app
```

## 3) Install Dependencies
Using npm:
```bash
npm install
```
If you hit lockfile issues:
```bash
rm -rf node_modules package-lock.json
npm install
```

Using pnpm (optional):
```bash
pnpm install
```

Using Yarn (optional):
```bash
yarn install
```

## 4) Environment Variables
Create `.env.local` inside `togetherflow-app/` with:
```bash
# Clerk (required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# MongoDB (recommended for APIs, data, and seeding)
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority&appName=<appName>
```
Notes:
- **Clerk keys**: From Clerk dashboard → your project → API Keys.
- **MongoDB URI**: From Atlas (or local). Without this, data features and API routes may not work fully.

## 5) Run the App (Development)
From `togetherflow-app/`:
```bash
npm run dev
```
Open http://localhost:3000

- Public routes: `/`, `/about`, `/help`, `/privacy`, `/sign-in`, `/sign-up`
- Other routes are protected by Clerk.

## 6) Optional: Test DB Connectivity
From `togetherflow-app/`:
```bash
npm run db:test
```
This verifies MongoDB connectivity (requires `MONGODB_URI`).

## 7) Build and Run (Production)
```bash
npm run build
npm start
```
The app runs at http://localhost:3000.

## 8) Deploy (Optional, Vercel)
- Push your repo (or keep your fork)
- Import the repo into Vercel
- Set env vars:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
  - `MONGODB_URI`
- Deploy

## 9) Troubleshooting
- **Node version errors**: Use Node 20+. Reinstall deps:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```
- **401 / Redirect loops on protected routes**: Check Clerk keys.
- **MongoDB connect errors**:
  - Allow your IP in Atlas Network Access
  - Verify user/password and DB name
  - Use SRV URI with `retryWrites=true&w=majority`
- **Port already in use**:
  ```bash
  # macOS/Linux
  PORT=3001 npm run dev
  # Windows PowerShell
  setx PORT 3001; npm run dev
  ```
- **Stale build cache**:
  ```bash
  rm -rf .next
  npm run dev
  ```

## 10) Project Structure (Key Paths)
- **App root**: `togetherflow-app/`
- **App Router**: `src/app`
- **Components**: `src/components` (UI in `src/components/ui`)
- **Lib/Models**: `src/lib`
- **Middleware**: `src/middleware.ts` (Clerk protection)
- **Public assets**: `public/`

---

If anything is unclear or you hit issues, please open an issue or reach out.