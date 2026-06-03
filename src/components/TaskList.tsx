'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Database } from '@/types/database';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useSearchParams, useRouter } from 'next/navigation';

type Task = Database['public']['Tables']['tasks']['Row'];

interface TaskListProps {
  initialTasks: Task[];
  projectId: string;
}

export default function TaskList({ initialTasks, projectId }: TaskListProps) {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [editingId, setEditingId] = useState<string | null>(null);

  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  // 1. Get current filter from URL (default to 'all')
  const currentFilter = searchParams.get('status') || 'all';

  // 2. Filter logic
  const filteredTasks = tasks.filter(task => {
    if (currentFilter === 'all') return true;
    return task.status === currentFilter;
  });
  
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

    const handleFilterChange = (newStatus: string) => {
    // Update URL without refreshing the page
    const params = new URLSearchParams(searchParams.toString());
    if (newStatus === 'all') {
      params.delete('status');
    } else {
      params.set('status', newStatus);
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

      // --- HANDLE SAVE (Updates Title, Desc, Date) ---
    const handleSaveEdit = async (taskId: string, updates: Partial<Task>) => {
        // 1. Optimistic UI: Update local state immediately
        setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, ...updates } : t
        ));

        // 2. Send to DB
        const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId);

        if (error) {
        alert('Failed to save changes');
        } else {
        setEditingId(null); // Exit edit mode on success
        }
    };

      const handleCheckOverdue = async () => {
        const { data, error } = await supabase.functions.invoke('get-overdue', {
        body: { project_id: projectId }
        });

        if (error) {
        alert(`Error: ${error.message}`);
        } else {
        const count = data?.overdue_count || 0;
        if (count === 0) {
            alert('Great job! No overdue tasks.');
        } else {
            alert(`You have ${count} overdue tasks! Check the list.`);
        }
        }
    };

    return (
    <div className="space-y-6">
      {/* --- EXPANDED ADD TASK FORM --- */}
      {/* (Keep your form code exactly as it is) */}
      <form onSubmit={handleAddTask} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        {/* ... inputs ... */}
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

      {/* --- FILTER BAR (NEW) --- */}
      <div className="flex gap-2 border-b border-slate-200 pb-1">
        {['all', 'todo', 'in_progress', 'done'].map((filter) => {
          const isActive = currentFilter === filter;
          const label = filter === 'all' ? 'All' : filter.replace('_', ' ');
          
          return (
            <button
              key={filter}
              onClick={() => handleFilterChange(filter)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                isActive 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {label.charAt(0).toUpperCase() + label.slice(1)}
            </button>
          );
        })}
        {/* Overdue Button */}
        <button
          onClick={handleCheckOverdue}
          className="text-xs font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1 px-3 py-1 rounded-full bg-orange-50 hover:bg-orange-100 transition-colors"
        >
          ⚠️ Check Overdue
        </button>
      </div>

      {/* --- TASK LIST --- */}
      {/* Updated to use filteredTasks */}
      <div className="space-y-3">
        {filteredTasks.length === 0 && (
          <p className="text-slate-500 text-center py-8">
            {currentFilter === 'all' ? 'No tasks yet.' : `No tasks with status "${currentFilter}".`}
          </p>
        )}
        
        {filteredTasks.map((task) => (
          // ... (Keep your task card code exactly as it is)
                    <div key={task.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group hover:border-indigo-300 transition-all">
            
            {/* Left: Content OR Edit Form */}
            <div className="flex items-start gap-4 flex-1 w-full md:w-auto">
              {/* Checkbox (Always Visible) */}
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

              <div className="flex-1 min-w-0 w-full">
                {editingId === task.id ? (
                  // --- EDIT MODE: Form ---
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <input
                      autoFocus
                      type="text"
                      defaultValue={task.title}
                      id={`edit-title-${task.id}`}
                      className="w-full px-2 py-1 text-base font-bold border-b border-indigo-500 focus:outline-none bg-slate-50 rounded"
                    />
                    <textarea
                      defaultValue={task.description || ''}
                      id={`edit-desc-${task.id}`}
                      placeholder="Add description..."
                      className="w-full px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                      rows={2}
                    />
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-slate-500">Due:</label>
                      <input
                        type="date"
                        defaultValue={task.due_date ? task.due_date.split('T')[0] : ''}
                        id={`edit-date-${task.id}`}
                        className="text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => {
                          const title = (document.getElementById(`edit-title-${task.id}`) as HTMLInputElement).value;
                          const desc = (document.getElementById(`edit-desc-${task.id}`) as HTMLTextAreaElement).value;
                          const date = (document.getElementById(`edit-date-${task.id}`) as HTMLInputElement).value;
                          handleSaveEdit(task.id, { 
                            title, 
                            description: desc || null, 
                            due_date: date || null 
                          });
                        }}
                        className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-xs bg-slate-200 text-slate-700 px-3 py-1 rounded hover:bg-slate-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // --- VIEW MODE: Display ---
                  <>
                    <div 
                      onClick={() => setEditingId(task.id)}
                      className="group/title cursor-text"
                    >
                      <p className={`font-medium truncate ${task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-900'} group-hover/title:text-indigo-600 transition-colors`}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-sm text-slate-500 mt-1 line-clamp-2 group-hover/title:text-indigo-400">{task.description}</p>
                      )}
                    </div>

                    {task.due_date && (
                      <div className="flex items-center gap-1 mt-2">
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded flex items-center gap-1 group-hover/due:bg-indigo-50 group-hover/due:text-indigo-600 transition-colors cursor-pointer" onClick={() => setEditingId(task.id)}>
                          📅 {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Right: Controls (Status Dropdown + Delete) - Keep this exactly as it was */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              <select
                value={task.status ?? 'todo'}
                onChange={(e) => handleStatusChange(task.id, e.target.value)}
                className={`text-xs font-bold uppercase px-2 py-1 rounded-full border cursor-pointer outline-none ${getStatusColor(task.status)}`}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
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