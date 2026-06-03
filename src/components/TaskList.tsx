'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Database } from '@/types/database'; // Import your generated types

// Define the shape of a Task based on your DB
type Task = Database['public']['Tables']['tasks']['Row'];

interface TaskListProps {
  initialTasks: Task[];
  projectId: string;
}

export default function TaskList({ initialTasks, projectId }: TaskListProps) {
  const supabase = createClient();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // --- OPTIMISTIC UI: Change Status ---
  const handleStatusChange = async (taskId: string, newStatus: string) => {
    // 1. Snapshot current state for rollback
    const previousTasks = [...tasks];

    // 2. Update local state immediately (Optimistic)
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: newStatus as Task['status'] } : t
    ));

    // 3. Send to API
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId);

    // 4. Handle Error: Rollback if API fails
    if (error) {
      console.error('Update failed:', error);
      setTasks(previousTasks); // Revert to old state
      alert('Failed to update status');
    }
  };

  // --- ADD TASK ---
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    // Create temporary optimistic task (optional, or wait for DB)
    // Let's wait for DB for creation to keep it simple, 
    // but we could optimistically add it to the list too.
    
    const { data, error } = await supabase
      .from('tasks')
      .insert([{ 
        title: newTaskTitle, 
        project_id: projectId, 
        status: 'todo' 
      }])
      .select()
      .single();

    if (error) {
      alert('Failed to add task');
    } else if (data) {
      setTasks(prev => [data, ...prev]);
      setNewTaskTitle('');
    }
  };

  // Helper for status colors
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
      {/* Add Task Form */}
      <form onSubmit={handleAddTask} className="flex gap-2">
        <input
          type="text"
          className="flex-1 px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Add a new task..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
        />
        <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium">
          Add
        </button>
      </form>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.length === 0 && <p className="text-slate-500 text-center py-4">No tasks yet.</p>}
        
        {tasks.map((task) => (
          <div key={task.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-300 transition-all">
            
            {/* Left: Content */}
            <div className="flex items-center gap-4 flex-1">
              {/* Simple Checkbox interaction (toggle Done/Todo) */}
              <button 
                onClick={() => handleStatusChange(task.id, task.status === 'done' ? 'todo' : 'done')}
                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors
                  ${task.status === 'done' 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : 'border-slate-300 hover:border-indigo-500 text-transparent'
                  }`}
              >
                ✓
              </button>

              <div className="flex-1">
                {/* Inline Editable Title (Simplified: ContentEditable or Input on click) */}
                <p className={`font-medium ${task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                  {task.title}
                </p>
                {task.description && <p className="text-sm text-slate-500">{task.description}</p>}
              </div>
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-3">
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}