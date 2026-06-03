'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Database } from '@/types/database';
import { RealtimeChannel } from '@supabase/supabase-js';

type Task = Database['public']['Tables']['tasks']['Row'];

interface TaskListProps {
  initialTasks: Task[];
  projectId: string;
}

export default function TaskList({ initialTasks, projectId }: TaskListProps) {
  const supabase = createClient();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    due_date: '',
  });

  // --- REALTIME SUBSCRIPTION ---
  useEffect(() => {
    const channel: RealtimeChannel = supabase
      .channel(`tasks:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTasks(prev => {
              // FIX: Check if task already exists to prevent duplicates
              // (This happens when we create a task locally AND receive the realtime event for it)
              if (prev.some(task => task.id === payload.new.id)) {
                return prev;
              }
              return [payload.new as Task, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            setTasks(prev => prev.map(task => 
              task.id === payload.new.id ? payload.new as Task : task
            ));
          } else if (payload.eventType === 'DELETE') {
            setTasks(prev => prev.filter(task => task.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, projectId]); 

  // --- HANDLERS ---
  const handleDelete = async (taskId: string) => {
    const previousTasks = [...tasks];
    setTasks(prev => prev.filter(t => t.id !== taskId));
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (error) { setTasks(previousTasks); alert('Failed to delete'); }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    const previousTasks = [...tasks];
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: newStatus as Task['status'] } : t
    ));
    const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
    if (error) { setTasks(previousTasks); alert('Failed to update'); }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    const { data, error } = await supabase
      .from('tasks')
      .insert([{ 
        title: newTask.title, 
        description: newTask.description || null,
        due_date: newTask.due_date || null,
        project_id: projectId, 
        status: 'todo' 
      }])
      .select()
      .single();

    if (error) {
      alert('Failed to add task: ' + error.message);
    } else if (data) {
      setTasks(prev => [data, ...prev]);
      setNewTask({ title: '', description: '', due_date: '' });
    }
  };

  const getStatusColor = (status: string | null | undefined) => {
    switch (status ?? 'todo') {
      case 'todo': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'in_progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'done': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* --- EXPANDED ADD TASK FORM --- */}
      <form onSubmit={handleAddTask} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <input
          type="text"
          className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          placeholder="Task Title..."
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          required
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            placeholder="Description (optional)"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          />
          <input
            type="date"
            className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-600"
            value={newTask.due_date}
            onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
          />
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-colors">
            Add Task
          </button>
        </div>
      </form>

      {/* --- TASK LIST --- */}
      <div className="space-y-3">
        {tasks.length === 0 && <p className="text-slate-500 text-center py-8">No tasks yet.</p>}
        
        {tasks.map((task) => (
          <div key={task.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group hover:border-indigo-300 transition-all">
            
            {/* Left: Checkbox + Content */}
            <div className="flex items-start gap-4 flex-1 w-full md:w-auto">
              <button 
                onClick={() => handleStatusChange(task.id, task.status === 'done' ? 'todo' : 'done')}
                className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors flex-shrink-0
                  ${task.status === 'done' 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : 'border-slate-300 hover:border-indigo-500 text-transparent'
                  }`}
              >
                ✓
              </button>

              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                  {task.title}
                </p>
                
                {task.description && (
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">{task.description}</p>
                )}

                {task.due_date && (
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded flex items-center gap-1">
                       📅 {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              
              {/* Status Dropdown */}
              <select
                value={task.status ?? 'todo'}
                onChange={(e) => handleStatusChange(task.id, e.target.value)}
                className={`text-xs font-bold uppercase px-2 py-1 rounded-full border cursor-pointer outline-none ${getStatusColor(task.status)}`}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>

              {/* Delete Button */}
              <button
                onClick={() => handleDelete(task.id)}
                className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                title="Delete Task"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}