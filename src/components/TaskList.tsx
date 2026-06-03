'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Database } from '@/types/database';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useSearchParams, useRouter } from 'next/navigation';

type Task = Database['public']['Tables']['tasks']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface TaskListProps {
  initialTasks: Task[];
  projectId: string;
}

export default function TaskList({ initialTasks, projectId }: TaskListProps) {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    due_date: '',
    assignee_id: '' as string,
  });

  // Filter State
  const currentFilter = searchParams.get('status') || 'all';
  
  // --- REALTIME SUBSCRIPTION ---
  useEffect(() => {
    const channel: RealtimeChannel = supabase
      .channel(`tasks:${projectId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `project_id=eq.${projectId}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setTasks(prev => {
            if (prev.some(t => t.id === payload.new.id)) return prev;
            return [payload.new as Task, ...prev];
          });
        } else if (payload.eventType === 'UPDATE') {
          setTasks(prev => prev.map(t => t.id === payload.new.id ? payload.new as Task : t));
        } else if (payload.eventType === 'DELETE') {
          setTasks(prev => prev.filter(t => t.id !== payload.old.id));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase, projectId]); 

  // --- FETCH PROFILES ---
  useEffect(() => {
    const fetchProfiles = async () => {
      const { data } = await supabase.from('profiles').select('*');
      if (data) setProfiles(data as Profile[]);
    };
    fetchProfiles();
  }, [supabase]);

  // --- HANDLERS ---
  const handleDelete = async (taskId: string) => {
    const previousTasks = [...tasks];
    setTasks(prev => prev.filter(t => t.id !== taskId));
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (error) { setTasks(previousTasks); alert('Failed to delete'); }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    const previousTasks = [...tasks];
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus as Task['status'] } : t));
    const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
    if (error) { setTasks(previousTasks); alert('Failed to update'); }
  };

  const handleSaveEdit = async (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
    const { error } = await supabase.from('tasks').update(updates).eq('id', taskId);
    if (error) alert('Failed to save changes');
    else setEditingId(null);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    const { data, error } = await supabase.from('tasks').insert([{ 
      title: newTask.title, 
      description: newTask.description || null,
      due_date: newTask.due_date || null,
      assignee_id: newTask.assignee_id || null,
      project_id: projectId, 
      status: 'todo' 
    }]).select().single();
    if (error) alert('Failed to add task');
    else if (data) { setTasks(prev => [data, ...prev]); setNewTask({ title: '', description: '', due_date: '', assignee_id: '' }); }
  };

  const getStatusColor = (status: string | null | undefined) => {
    switch (status ?? 'todo') {
      case 'todo': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'in_progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'done': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const handleFilterChange = (newStatus: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newStatus === 'all') params.delete('status');
    else params.set('status', newStatus);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const filteredTasks = tasks.filter(task => {
    if (currentFilter === 'all') return true;
    return task.status === currentFilter;
  });

  return (
    <div className="space-y-6">
      <form onSubmit={handleAddTask} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <input type="text" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium" placeholder="Task Title..." value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} required />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input type="text" className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="Description" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} />
          <input type="date" className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-600" value={newTask.due_date} onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })} />
          <select className="px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white" value={newTask.assignee_id} onChange={(e) => setNewTask({ ...newTask, assignee_id: e.target.value })}>
            <option value="">Unassigned</option>
            {profiles.map(p => <option key={p.id} value={p.id}>{p.full_name || p.email}</option>)}
          </select>
        </div>
        <div className="flex justify-end pt-2"><button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium">Add Task</button></div>
      </form>

      <div className="flex gap-2 border-b border-slate-200 pb-1">
        {['all', 'todo', 'in_progress', 'done'].map((filter) => (
          <button key={filter} onClick={() => handleFilterChange(filter)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${currentFilter === filter ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            {filter === 'all' ? 'All' : filter.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredTasks.length === 0 && <p className="text-slate-500 text-center py-8">No tasks found.</p>}
        {filteredTasks.map((task) => (
          <div key={task.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-indigo-300 transition-all">
            <div className="flex items-start gap-4 flex-1 w-full md:w-auto">
              <button onClick={() => handleStatusChange(task.id, task.status === 'done' ? 'todo' : 'done')} className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${task.status === 'done' ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 hover:border-indigo-500 text-transparent'}`}>✓</button>
              <div className="flex-1 min-w-0 w-full">
                {editingId === task.id ? (
                  <div className="space-y-2 animate-in fade-in">
                    <input autoFocus defaultValue={task.title} id={`title-${task.id}`} className="w-full px-2 py-1 font-bold border-b border-indigo-500 bg-slate-50 rounded" onBlur={(e) => handleSaveEdit(task.id, { title: e.target.value })} onKeyDown={(e) => { if(e.key==='Enter') handleSaveEdit(task.id, { title: e.currentTarget.value }); if(e.key==='Escape') setEditingId(null); }} />
                    <textarea defaultValue={task.description || ''} id={`desc-${task.id}`} placeholder="Description" className="w-full px-2 py-1 text-sm border border-slate-200 rounded" rows={2} onBlur={(e) => handleSaveEdit(task.id, { description: e.target.value })} />
                    <select id={`assignee-${task.id}`} defaultValue={task.assignee_id || ''} className="text-xs border border-slate-200 rounded px-2" onBlur={(e) => handleSaveEdit(task.id, { assignee_id: e.target.value || null })}>
                      <option value="">Unassigned</option>
                      {profiles.map(p => <option key={p.id} value={p.id}>{p.full_name || p.email}</option>)}
                    </select>
                  </div>
                ) : (
                  <>
                    <p onClick={() => setEditingId(task.id)} className="font-medium truncate cursor-text hover:text-indigo-600">{task.title}</p>
                    {task.description && <p className="text-sm text-slate-500 mt-1 line-clamp-2">{task.description}</p>}
                    {task.assignee_id && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                          {profiles.find(p => p.id === task.assignee_id)?.full_name?.charAt(0) || '?'}
                        </div>
                        <span className="text-xs text-slate-500">{profiles.find(p => p.id === task.assignee_id)?.full_name}</span>
                      </div>
                    )}
                    {task.due_date && <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded mt-2 inline-block">📅 {new Date(task.due_date).toLocaleDateString()}</span>}
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              <select value={task.status ?? 'todo'} onChange={(e) => handleStatusChange(task.id, e.target.value)} className={`text-xs font-bold uppercase px-2 py-1 rounded-full border cursor-pointer outline-none ${getStatusColor(task.status)}`}>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
              <button onClick={() => handleDelete(task.id)} className="text-slate-400 hover:text-red-600">🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}