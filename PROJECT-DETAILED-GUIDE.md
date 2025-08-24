# Togetherflow App — Comprehensive Project Guide

A complete, from-zero understanding of the project: what it is, why each technology is used, how the code is organized, and how each part works together (UI, auth/session, APIs, database, state, and realtime).

---

## 1) Executive Summary

- **What this app is**: A collaborative project/task dashboard.
- **Core features**:
  - Projects list and details (with members, progress, invites)
  - Tasks (create, list, personal/assigned filtering)
  - Notifications (per-user)
  - Activity feed
  - Team chat (per-project)
- **Tech stack**: Next.js 15 App Router, React 19, Tailwind CSS 4, Clerk (auth), MongoDB + Mongoose (data), Zod (validation), Zustand (client UI state), Socket.IO (realtime), Radix UI + shadcn-inspired components, next-themes (dark mode), Framer Motion (animations).

---

## 2) Why These Technologies

- **Next.js 15 (App Router)**: Server components, file-based routing, built-in API routes, great DX and deploy story with Vercel.
- **React 19**: Latest React features, performance, and server-component compatibility in Next.
- **Tailwind CSS 4**: Utility-first styling for fast, consistent UI; new v4 DX.
- **Radix UI + shadcn-inspired components**: Accessible primitives with consistent design baseline.
- **Clerk**: Fully managed authentication, session handling, and UI for sign-in/up; minimizes bespoke auth code.
- **MongoDB + Mongoose**: Flexible schema, indexes, and rapid iteration; Mongoose adds schemas, validation, and lean queries.
- **Zod**: Runtime validation for API payloads, ensures inputs are safe and typed.
- **Zustand**: Minimal, ergonomic client state for UI-only needs.
- **Socket.IO**: Simple realtime for chat/events.
- **next-themes**: Easy dark/light theme toggling.
- **Framer Motion**: Smooth micro-interactions and transitions.

---

## 3) Project Structure (Key Paths)

- **App root**: `togetherflow-app/`
- **App Router**: `src/app`
- **Components**: `src/components` (UI primitives in `src/components/ui`)
- **Lib/Models/Utils**: `src/lib`
- **Middleware**: `src/middleware.ts` (Clerk route protection)
- **Public assets**: `public/`
- **Env file**: `.env.local`

---

## 4) Routing Overview (App Router)

- Public routes (no auth): `/`, `/about`, `/help`, `/privacy`, `/sign-in(.*)`, `/sign-up(.*)`, `/auth(.*)`, `/api/activity(.*)`
- Protected routes (auth-required): everything else, including most UIs and APIs. Enforced by `src/middleware.ts` using Clerk.

Key pages:
- `/` Home dashboard (summary cards, recent activity)
- `/projects` Project list + search/filter
- `/projects/[projectId]` Project detail (tabs: overview, tasks, files placeholder, chat)
- `/tasks` Personal tasks across visible projects
- `/notifications` User notifications
- `/chat` Chat demo page (project-centric chat is under project detail)
- `/profile`, `/settings` User profile/settings
- Static pages: `/about`, `/help`, `/privacy`, `/status`
- Auth-related: `/sign-in`, `/sign-up`, `/auth/callback`

Loading/Errors:
- `src/app/loading.tsx` global loading UI
- `src/app/error.tsx` global error boundary
- `src/app/not-found.tsx` not found UI

---

## 5) Authentication and Session Management (Clerk)

- **Middleware**: `src/middleware.ts`
  - Defines public routes; all other routes require an authenticated session.
  - `auth.protect()` ensures requests resolve a session and user.
- **Server handlers** use Clerk helpers:
  - `auth()` (preferred within server actions/handlers)
  - `getAuth(req)` (request-scoped, works in route handlers)
- **Fallback verification**: `src/lib/serverAuth.ts`
  - Attempts Bearer token from `Authorization` header or `__session` cookie.
  - Uses `createClerkClient({ secretKey })` to verify sessions in edge cases (useful in dev or when calling APIs directly).
- **Client → API calls**: `src/lib/api.ts`
  - Uses `fetch` with `credentials: 'include'` to send Clerk cookie for same-origin APIs.
- **User model**: `src/lib/models.ts` includes an app-level `User` document (optional) to persist app-specific info (roles/name/image) linked to Clerk user id.

Environment variables (in `.env.local`):
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
MONGODB_URI=mongodb+srv://...
# optional: MONGODB_DB=your-db-name
```

---

## 6) Data Storage (MongoDB + Mongoose)

Connection:
- `src/lib/db.ts` sets up a global cached connection (prevents multiple connects during HMR).
- Uses `MONGODB_URI` and optional `MONGODB_DB`.

Models (`src/lib/models.ts`):
- **Project**
  - Fields: `name`, `description`, `status`, `progress`, `dueDate`, `members[]`, `tasksCount`, `ownerId`, `archived`, `inviteCode`
  - Indexes: `{ ownerId: 1, updatedAt: -1 }`, `{ inviteCode: 1 }` (sparse)
- **Task**
  - Fields: `projectId`, `title`, `description`, `status`, `priority`, `dueDate`, `assignee`, `creatorId`
  - Index: `{ projectId: 1, updatedAt: -1 }`
- **Notification**
  - Fields: `userId`, `type`, `title`, `message`, `isRead`, `time`, `sender`
  - Index: `{ userId: 1, time: -1 }`
- **Activity**
  - Fields: `type`, `message`, `time`, `user`, `projectId?`
  - Indexes: `{ time: -1 }`, `{ projectId: 1, time: -1 }`
- **ChatMessage**
  - Fields: `projectId`, `content`, `sender`, `timestamp`
  - Index: `{ projectId: 1, timestamp: 1 }`
- **User** (app-level)
  - Fields: `clerkId`, `email?`, `name?`, `imageUrl?`, `roles[]`

Validation (`src/lib/validation.ts`): Zod schemas for create/patch payloads ensure clean, typed inputs.

Types (`src/lib/types.ts`): Shared TypeScript interfaces for API responses and UI typing.

---

## 7) API Design and Endpoints

General notes:
- All non-public API routes require auth via Clerk middleware.
- Handlers always:
  1) Resolve user (via `auth()`/`getAuth(req)`/fallback verification)
  2) Connect DB (`dbConnect()`)
  3) Validate inputs (Zod) where applicable
  4) Perform model ops and return typed JSON
- Responses prefer lean docs (`.lean()`), then mapped to DTOs with stringified ids/timestamps.

### 7.1 Projects

- `GET /api/projects`
  - Returns projects where user is owner or member, not archived. Sorted by `updatedAt`.
- `POST /api/projects`
  - Body: `projectCreateSchema` { name, description?, status?, progress?, dueDate?, members?, archived? }
  - Creates project (owner = current user) and emits `Activity`.

- `GET /api/projects/:id`
  - Returns one visible project (owner/member).
- `PATCH /api/projects/:id`
  - Body: `projectPatchSchema`
  - Updates project; may log `project_updated` activity.
- `DELETE /api/projects/:id`
  - Soft-archives project (owner-only) instead of hard delete.

- `POST /api/projects/:id/invite` (exists in router tree; implementation describes invite code management)
- `POST /api/projects/join` (join via invite code)

Example create:
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <CLERK_SESSION_TOKEN>" \
  -d '{"name":"Website Redesign","description":"Q4 initiative"}'
```

### 7.2 Tasks

- `GET /api/tasks`
  - If `?projectId=<id>`: tasks for that project (must be visible to user)
  - Else: personal view across visible projects (created by me OR assigned to me)
- `POST /api/tasks`
  - Body: `taskCreateSchema` { projectId, title, description?, status?, priority?, dueDate?, assignee? }
  - Only the project owner can create tasks (as implemented); increments `tasksCount`, logs activity, recalculates progress lazily.

### 7.3 Notifications

- `GET /api/notifications`
  - Per-user notifications sorted by `time`.

### 7.4 Activity

- `GET /api/activity`
  - Public; if user is signed in, filters by visible projects; else returns general activity.

### 7.5 Chat

- `GET /api/chat/:projectId`
  - Returns chat messages for the project.
- `POST /api/chat/:projectId`
  - Body: `chatMessageCreateSchema` { content, sender }
  - Requires auth; creates message and logs `comment_added` activity.

---

## 8) UI Components and Layout

Layout pieces (`src/components`):
- **Header**, **Sidebar**, **Footer**: Shared chrome around pages.
- **Breadcrumb**, **LayoutContent**: Navigation + consistent paddings/containers.
- **ThemeToggle**: toggles dark/light via next-themes.
- **Loading**, **ErrorBoundary**: UX fallback components.
- **ProjectCard**, **TaskCard**, **ChatMessage**: domain UI elements.
- **ProgressiveList**, **SearchBar**, **Modal**: utilities for lists and interactions.
- **motion/**: Framer Motion primitives for animating lists/cards.

UI primitives (`src/components/ui`):
- **button, card, input, dialog, dropdown-menu, tabs, switch, skeleton, avatar, badge, collapsible, toast**
- Built atop Radix UI patterns with Tailwind classes for consistent styling.

Styling:
- Global CSS: `src/app/globals.css`
- Design tokens via Tailwind utilities.

---

## 9) State Management (Zustand)

- `src/lib/zustand.ts` and `src/lib/store.ts` hold lightweight UI-only state (filters, modals, client hints).
- Server data is fetched via native `fetch` to API routes (or SWR could be added) to keep server-authoritative state.

---

## 10) Realtime (Socket.IO)

- Socket.IO server: `src/pages/api/socketio.ts`
- Frontend initializes the bridge when opening Chat (see Chat page code). Provides channel for live chat updates.
- Namespace/path: `/api/socketio`

Note: Chat API writes to DB; Socket.IO can broadcast updates to connected clients for instant UI refresh.

---

## 11) How Pages Work (End-to-End)

### 11.1 Home (`/`)
- Shows summary cards and recent activity.
- Activity fetched from `/api/activity` (public), optionally filtered if user is logged in.

### 11.2 Projects (`/projects`)
- Lists projects visible to the user (owner or member) from `/api/projects`.
- Create project via modal/form → POST `/api/projects` with Zod validation.

### 11.3 Project Detail (`/projects/[projectId]`)
- Tabs: Overview, Tasks, Files (placeholder), Chat.
- Overview displays project metadata and members.
- Tasks tab lists project tasks (GET `/api/tasks?projectId=`); owner can create.
- Chat tab shows streaming messages and posts to `/api/chat/:projectId`; Socket.IO updates.

### 11.4 Tasks (`/tasks`)
- Personal cross-project view. GET `/api/tasks` (no project param) shows tasks created by or assigned to current user across visible projects.

### 11.5 Notifications (`/notifications`)
- GET `/api/notifications` returns user-specific notifications.

### 11.6 Auth pages
- `/sign-in`, `/sign-up`, `/auth/callback` provided by Clerk components/routes.

### 11.7 Static pages
- `/about`, `/help`, `/privacy`, `/status` are simple content pages.

---

## 12) Request Flow (Typical)

1) User visits protected page (e.g., `/projects`).
2) Middleware (`src/middleware.ts`) ensures valid session; unauthenticated users are redirected to sign-in.
3) UI calls API via `api()` helper with cookies included.
4) Server handler verifies user (Clerk), connects DB, validates input (Zod), performs Mongoose ops.
5) Handler returns typed JSON; UI updates.
6) For chat, server also emits events via Socket.IO so other clients update instantly.

---

## 13) Error Handling, Loading, and UX

- Global `loading.tsx` and `error.tsx` provide consistent UX.
- API helpers throw with response text; components display toasts/dialogs as needed.
- Some handlers include development-only debug (`{ hasCookie, hasAuthz }`) to diagnose auth.

---

## 14) Security Considerations

- Auth enforced at middleware level; APIs assume session unless explicitly public.
- DB queries scope by current user id (owner/member checks) to avoid data leakage.
- Project delete is a soft-archive (`archived: true`).
- Validation via Zod prevents malformed payloads.
- Indexes help avoid slow queries on multi-tenant collections.

---

## 15) Build, Run, and Deploy

Local dev:
```bash
npm install
npm run dev
# open http://localhost:3000
```

Env vars (`.env.local`): Clerk keys, `MONGODB_URI` (and optional `MONGODB_DB`).

DB test:
```bash
npm run db:test
```

Prod build:
```bash
npm run build
npm start
```

Deploy (Vercel recommended): set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `MONGODB_URI` in project settings.

---

## 16) Extending the App (Common Tasks)

- **Add a new model**
  1) Define schema in `src/lib/models.ts` (add indexes thoughtfully).
  2) Add Zod schemas to `src/lib/validation.ts` for create/patch.
  3) Add TypeScript interfaces in `src/lib/types.ts`.
  4) Create API routes in `src/app/api/<resource>` with GET/POST/PATCH/DELETE.
  5) Build UI under `src/app/<route>` and components in `src/components`.

- **Add a protected page**
  1) Create directory/file in `src/app/<path>/page.tsx`.
  2) Ensure route is not listed as public in `src/middleware.ts` (so it remains protected).

- **Use server data in a page**
  - In Server Components, call `fetch('/api/...', { cache: 'no-store' })` or perform model queries in a route handler.

- **Add realtime updates**
  - Extend `src/pages/api/socketio.ts` for new events/rooms.
  - On the client, connect to `/api/socketio` and subscribe to relevant rooms (e.g., by project id).

---

## 17) Notable Implementation Details

- Task creation updates project `tasksCount` and recomputes progress (done/total) lazily to keep UI in sync.
- Activity feed captures key events (project/task creation, comments) for auditability.
- `getUserIdFromRequest` provides a robust dev experience for API testing with Bearer tokens.
- `dbConnect()` uses a global cache to prevent multiple connections under HMR.

---

## 18) API Examples (Request/Response)

- List my projects:
```bash
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/projects
```
Response (trimmed):
```json
[
  {
    "id": "673...",
    "name": "Website Redesign",
    "status": "active",
    "progress": 20,
    "members": [{"id":"user_1","name":"Alex"}],
    "tasksCount": 3,
    "ownerId": "user_abc",
    "createdAt": "2024-11-01T12:00:00.000Z",
    "updatedAt": "2024-11-02T14:10:00.000Z"
  }
]
```

- Create a task:
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "projectId":"673...",
    "title":"Draft user flows",
    "priority":"high",
    "assignee":{"id":"user_1","name":"Alex"}
  }'
```

---

## 19) Glossary

- **Owner**: The Clerk user who created a project; has elevated permissions (e.g., create tasks in current implementation).
- **Member**: A user added to a project’s members list; gains visibility and collaboration.
- **Visible project**: A project where current user is owner or listed in `members`.
- **Public route**: Not requiring auth; configured in `src/middleware.ts`.

---

## 20) Where to Look in Code (Cheat Sheet)

- Route protection: `src/middleware.ts`
- Models: `src/lib/models.ts`
- DB connection: `src/lib/db.ts`
- Validation: `src/lib/validation.ts`
- Shared types: `src/lib/types.ts`
- API helper (client): `src/lib/api.ts`
- Auth fallback: `src/lib/serverAuth.ts`
- Projects API: `src/app/api/projects/*`
- Tasks API: `src/app/api/tasks/route.ts`
- Notifications API: `src/app/api/notifications/route.ts`
- Activity API: `src/app/api/activity/route.ts`
- Chat API: `src/app/api/chat/[projectId]/route.ts`
- Socket.IO server: `src/pages/api/socketio.ts`
- UI components: `src/components/*`, primitives in `src/components/ui/*`
- Pages: `src/app/*`

---

If you read this file top-to-bottom, you should have a complete understanding of Togetherflow’s purpose, stack, architecture, how data flows, and how to extend it safely.