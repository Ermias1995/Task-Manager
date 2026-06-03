// src/app/project/[id]/page.tsx
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import TaskList from '@/components/TaskList';

// Note: params is now a Promise, so we await it immediately
export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  
  const projectId = id;

  const { data: project } = await supabase
    .from('projects')
    .select('name')
    .eq('id', projectId)
    .single();

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  if (!project) return <div className="p-8">Project not found</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          <Link href="/dashboard" className="text-slate-500 hover:text-slate-900 text-sm font-medium">
            ← Back
          </Link>
          <h1 className="text-lg font-bold text-slate-900">{project.name}</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Tasks</h2>
        
        <TaskList initialTasks={tasks || []} projectId={projectId} />
      </main>
    </div>
  );
}