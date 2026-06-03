'use client';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useState } from 'react';

interface ProjectListProps {
  projects: any[];
  currentWorkspaceId: string;
}

export default function ProjectList({ projects, currentWorkspaceId }: ProjectListProps) {
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !currentWorkspaceId) return;
    const { error } = await supabase.from('projects').insert({ name, workspace_id: currentWorkspaceId });
    if (error) alert('Failed to create project');
    else window.location.reload();
  };

  return (
    <>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Projects</h2>
          <p className="text-slate-500 mt-1">Manage your tasks and progress</p>
        </div>
        <button onClick={() => setIsOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2 font-medium">
          <Plus size={18} /> New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Link key={project.id} href={`/project/${project.id}`} className="group block">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-400 transition-all h-full">
              <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600">{project.name}</h3>
              <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 w-fit px-3 py-1 rounded-full mt-4">
                <span className="font-semibold text-slate-700">{project.tasks[0].count}</span>
                <span>Tasks</span>
              </div>
            </div>
          </Link>
        ))}
        <button onClick={() => setIsOpen(true)} className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/50 transition-all min-h-[160px]">
          <Plus size={32} className="mb-2" />
          <span className="font-medium">Create Project</span>
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/20 z-50 flex items-center justify-center backdrop-blur-[2px]">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">New Project</h2>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">X</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <input type="text" autoFocus className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Project Name" value={name} onChange={(e) => setName(e.target.value)} required />
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}