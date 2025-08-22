This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

1) Install dependencies

```bash
npm install
```

2) Configure environment variables in `.env.local`

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority&appName=<appName>
```

3) Run the development server

```bash
npm run dev
```

Open http://localhost:3000

Public routes: `/`, `/about`, `/help`, `/privacy`, `/sign-in`, `/sign-up`
All other routes are protected by Clerk.

### MongoDB Atlas quick setup
- Create a free cluster at MongoDB Atlas
- Create a DB user and allow your IP (or 0.0.0.0/0 for dev)
- Get the driver connection string and set `MONGODB_URI` above

### Seed demo data (dev-only)
- With the dev server running and after setting MONGODB_URI:
  - POST http://localhost:3000/api/dev/seed (e.g., via curl or REST client)
- It creates sample projects, tasks, notifications, activity, and chat messages

### Realtime chat
- Socket.IO namespace at `/api/socketio`
- The app initializes the bridge when you open the Chat page

### Scripts
- `npm run dev` – start dev server
- `npm run build` – build
- `npm start` – run production build
- `npm run lint` – lint

### Notes
- Tech: Next.js App Router, React 19, Tailwind CSS 4, Clerk, Mongoose
- DB models: see `src/lib/models.ts`
- API routes: see `src/app/api/*`

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
