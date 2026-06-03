import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Helper for status colors
const getStatusColor = (status: string) => {
  switch (status) {
    case 'todo':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'in_progress':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'done':
      return 'bg-green-50 text-green-700 border-green-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = await params;

  const supabase = await createClient();

  const [{ data: project }, { data: tasks }] = await Promise.all([
    supabase
      .from('projects')
      .select('name')
      .eq('id', projectId)
      .single(),

    supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true }),
  ]);

  if (!project) {
    return <div className="p-8">Project not found</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-slate-500 hover:text-slate-900 flex items-center gap-1 text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>

          <div className="h-4 w-px bg-slate-300" />

          <h1 className="text-lg font-bold text-slate-900 truncate">
            {project.name}
          </h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Tasks</h2>

          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-sm">
            + Add Task
          </button>
        </div>

        {!tasks || tasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-500">
              No tasks yet. Get started!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between hover:border-indigo-300 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-5 h-5 rounded border border-slate-300 group-hover:border-indigo-500 cursor-pointer" />

                  <div>
                    <p className="font-medium text-slate-900">
                      {task.title}
                    </p>

                    {task.description && (
                      <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      task.status
                    )}`}
                  >
                    {task.status.replace('_', ' ')}
                  </span>

                  {task.due_date && (
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      📅{' '}
                      {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}