TaskFlow - Fullstack Task Management System
A multi-workspace task management application built with Next.js 14, Supabase, TypeScript, and Tailwind CSS. Designed for real-time team collaboration with secure, row-level security (RLS).

Submission by: [Your Full Name]Start Time: [Date + Time + Timezone]End Time: [Date + Time + Timezone]Total Duration: ~24 Hours

Features Implemented
Core Features
Authentication: Secure sign-up, sign-in, and sign-out flows using Supabase Auth.
Multi-Workspace Architecture: Users can belong to multiple workspaces and switch between them seamlessly.
Project Management: Create and view projects within workspaces.
Task Management: Full CRUD operations (Create, Read, Update, Delete) for tasks.
Team Collaboration: Workspace owners can invite members by email (email lookup against public.profiles).
Real-Time Updates: Task status and content updates sync instantly across all connected users via Supabase Channels.
URL Filtering: Task lists are filtered by status (Todo, In Progress, Done) using URL query parameters (?status=done), ensuring filter state is shareable.
Advanced Features
Optimistic UI: Task status updates reflect immediately in the UI, rolling back automatically on API failure with user feedback.
Inline Editing: All task fields (Title, Description, Due Date, Assignee) are editable directly within the list without page reloads using a clean modal/input overlay.
Row-Level Security (RLS): Comprehensive policies enforce data isolation. Users can only access workspaces, projects, and tasks they are members of.
Type Safety: All database interactions use auto-generated TypeScript types (src/types/database.ts) with strict enforcement (no any types).
Edge Function: /get-overdue endpoint returns a list of overdue tasks for a specific project while enforcing RLS.
Loading States: Skeleton loaders implemented for Dashboard and Project views to prevent layout shifts and white screens.
Tech Stack
Framework: Next.js 14 (App Router, Server Components)
Language: TypeScript
Database & Auth: Supabase (PostgreSQL, Auth, Realtime, Edge Functions)
Styling: Tailwind CSS
State Management: React Hooks (useState, useEffect) + Optimistic UI patterns
Icons: Lucide React
Deployment: Vercel
Folder Structure
task-manager/
├── public/ # Static assets
├── schema.sql # Database schema, RLS policies, and seed data
├── src/
│ ├── app/ # Next.js App Router
│ │ ├── dashboard/
│ │ │ ├── loading.tsx # Skeleton loader for dashboard
│ │ │ └── page.tsx # Main dashboard (Workspace switcher, Team, Projects)
│ │ ├── login/
│ │ │ └── page.tsx # Login page
│ │ ├── project/
│ │ │ ├── [id]/
│ │ │ │ ├── loading.tsx # Skeleton loader for project view
│ │ │ │ └── page.tsx # Project view (Task List, Filters)
│ │ ├── signup/
│ │ │ └── page.tsx # Sign up page with metadata
│ │ ├── auth/
│ │ │ └── signout/ # Server action for sign out
│ │ ├── layout.tsx # Root layout
│ │ ├── page.tsx # Landing page
│ │ └── globals.css # Global styles
│ ├── components/ # Reusable Client Components
│ │ ├── DashboardHeader.tsx # Navigation bar
│ │ ├── ProjectList.tsx # Project grid & Create Modal
│ │ ├── TaskList.tsx # Task grid, Inline Edit, Realtime, Filters
│ │ └── TeamSection.tsx # Member avatars & Invite input
│ ├── types/
│ │ └── database.ts # Auto-generated Supabase types
│ └── utils/
│ └── supabase/
│ ├── client.ts # Browser client
│ ├── server.ts # Server client (SSR)
│ └── middleware.ts # Auth middleware
└── supabase/
└── functions/
└── get-overdue/
└── index.ts # Edge Function for overdue tasks


---

## How to Run Locally

1.  **Clone the repository:**
    ```bash
    git clone [YOUR_REPO_URL]
    cd task-manager
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env.local` file in the root:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your-project-url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
    ```

4.  **Database Setup:**
    *   Go to your Supabase Dashboard -> SQL Editor.
    *   Run the contents of `schema.sql`.
    *   (This creates tables, RLS policies, and seed data).

5.  **Start the development server:**
    ```bash
    npm run dev
    ```

6.  **Access the app:**
    *   Open [http://localhost:3000](http://localhost:3000)
    *   Use the Sign Up page to create an account.

---

## Architecture Decisions

*   **Server vs. Client Components:**
    *   Used **Server Components** for `Dashboard` and `Project` page structure to handle initial data fetching securely and efficiently (avoiding `useEffect` for initial loads).
    *   Used **Client Components** (`TaskList`, `DashboardHeader`) for interactive features like Realtime subscriptions and Modal state.
*   **RLS Strategy:**
    *   Adopted a "Membership Check" pattern. All policies on `tasks`, `projects`, and `workspaces` verify membership via the `workspace_members` table. This ensures a user cannot access data from a workspace they haven't been invited to.
*   **Realtime Optimization:**
    *   Implemented a duplicate check (`prev.some`) in the `INSERT` subscription handler to prevent the optimistic UI duplicate issue when the action originates from the user's own client.

---

## What is Incomplete, Skipped, or Broken

*   **Assignee Names in Edge Function:** The requirement asked for "Assignee Name" in the Edge Function response. Due to `auth.users` RLS restrictions and the absence of a public `profiles` table at the start, the Edge Function currently returns `assignee_id`. This would require an `Edge Function` trigger or a `profiles` table join which was added later in the process.
*   **Assignee Name in Task List:** The UI currently displays the assignee's avatar and name *if* they exist in `profiles`. If the user was added manually via ID before the `profiles` trigger was implemented, it might not show the name, only the ID.
*   **Edit Workspace Name:** The current UI allows switching workspaces but does not allow editing the workspace name itself.

---

## Final Review of Disqualifier Checklist

- [x] **No Broken Auth:** Sign Up, Sign In, and Sign Out all work and redirect correctly on the live Vercel URL.
- [x] **Cross-Workspace Leak:** RLS policies were written to strictly enforce isolation via `workspace_members`. Verified using multiple browser sessions (incognito).
- [x] **No Service Role Key:** Only `NEXT_PUBLIC_SUPABASE_ANON_KEY` is exposed. Service Role Key is not committed or used in client-side code.
- [x] **No `any` Types:** Supabase types were generated using `npx supabase gen types` and used throughout the codebase.
- [x] **Single Git Commit:** Commits were made progressively for every major feature (Auth, DB, UI, Realtime).
- [x] **Vercel Live URL:** The application is deployed, accessible, and functional.
- [x] **Time Limit:** Submitted within the 24-hour window.

---

## Bonus Features

1.  **Optimistic UI:** Implemented for task status changes. The UI updates instantly and rolls back on error.
2.  **Edge Function:** `/functions/v1/get-overdue` endpoint successfully retrieves overdue tasks with RLS enforcement.
3.  **Custom UI Design:** Landing page and Dashboard styled with intentionality, avoiding generic template defaults.

---
