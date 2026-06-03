###  Task Manager
# TaskFlow

A multi-workspace task management application built with **Next.js**, **TypeScript**, **Supabase**, and **Tailwind CSS**. The platform supports team collaboration, project management, real-time task updates, and secure workspace isolation through Row Level Security (RLS).

---
## Project Structure

```txt
task-manager/
├── public/
├── schema.sql
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   ├── login/
│   │   ├── signup/
│   │   ├── project/
│   │   │   └── [id]/
│   │   ├── auth/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── DashboardHeader.tsx
│   │   ├── ProjectList.tsx
│   │   ├── TaskList.tsx
│   │   └── TeamSection.tsx
│   │
│   ├── types/
│   │   └── database.ts
│   │
│   └── utils/
│       └── supabase/
│           ├── client.ts
│           ├── server.ts
│           └── middleware.ts
│
├── supabase/
│   └── functions/
│       └── get-overdue/
│           └── index.ts
│
├── README.md
├── .env.example
└── package.json
```

### Key Directories

* **app/** → App Router pages and layouts
* **components/** → Reusable UI components
* **types/** → Generated Supabase TypeScript types
* **utils/supabase/** → Browser and server Supabase clients
* **supabase/functions/** → Edge Functions
* **schema.sql** → Database schema, RLS policies, and seed data

### Authentication

* Sign Up / Sign In / Sign Out
* Protected routes with middleware
* Supabase Auth integration

### Workspace Management

* Create and switch workspaces
* Invite team members
* Workspace-based access control

### Project & Task Management

* Create projects within workspaces
* Create, edit, and delete tasks
* Assign tasks to workspace members
* Due dates and status tracking

### Realtime Collaboration

* Live task updates using Supabase Realtime
* Instant synchronization across connected users

### User Experience

* URL-based task filtering
* Optimistic UI updates
* Inline task editing
* Loading, empty, and error states

### Security

* Full Row Level Security (RLS)
* Workspace isolation via `workspace_members`
* No cross-workspace data access

### Bonus Features

* Supabase Edge Function for overdue tasks
* Optimistic UI with rollback handling
* Realtime task synchronization

---

## Tech Stack

* Next.js (App Router)
* TypeScript
* Supabase
* PostgreSQL
* Tailwind CSS
* Vercel

---

## Run Locally

```bash
git clone <repo-url>
cd task-manager
npm install
npm run dev
```

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Run `schema.sql` in the Supabase SQL Editor before starting the application.

---

## Architecture Notes

* Server Components used for primary data fetching.
* Client Components used for realtime and interactive features.
* RLS policies enforce workspace-level access control.
* Supabase generated types used throughout the application.

---

## Known Limitations

* Edge Function currently returns `assignee_id` instead of assignee name.
* Workspace name editing is not implemented.

---

## Checklist

* [x] Authentication working
* [x] RLS enabled
* [x] Workspace isolation enforced
* [x] No service role key exposed
* [x] No `any` types
* [x] Realtime updates implemented
* [x] Edge Function implemented
* [x] Live Vercel deployment
