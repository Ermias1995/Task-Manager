import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

// This is a Server Component (async)
export default async function Dashboard() {
  const supabase = await createClient();
  
  // Fetch projects
  // Note: RLS policies we wrote earlier will automatically filter these
  // to only show projects belonging to YOUR workspace.
  const { data: projects } = await supabase
    .from('projects')
    .select(`
      *,
      tasks(count)
    `)
    .order('created_at', { ascending: true });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">My Workspace</h1>
          <div className="flex items-center gap-4">
            {/* We will add a Sign Out button later */}
            <span className="text-sm text-slate-500">User</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Projects</h2>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
            + New Project
          </button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects && projects.length > 0 ? (
            projects.map((project: any) => (
              <Link 
                key={project.id} 
                href={`/project/${project.id}`}
                className="group bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer"
              >
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 mb-2">
                  {project.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="bg-slate-100 px-2 py-1 rounded text-xs font-medium">
                    {project.tasks[0].count} Tasks
                  </span>
                  <span>•</span>
                  <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-3 py-12 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-xl">
              <p>No projects found.</p>
              <p className="text-sm mt-1">Create a workspace and project in the database to get started.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}