'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { Plus, X, LogOut, UserPlus, Search } from 'lucide-react';

export default function Dashboard() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  
  // Workspace State
  const [currentWorkspace, setCurrentWorkspace] = useState<any>(null);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  // Project State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  // Invite State
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (!user) return;

      // 1. Find a workspace the user belongs to
      const { data: memberData } = await supabase
        .from('workspace_members')
        .select('workspace_id, workspaces(*)')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (memberData && memberData.workspaces) {
        // User has a workspace
        setCurrentWorkspace(memberData.workspaces);
        
        // Fetch Projects for this workspace
        const { data: projects } = await supabase
          .from('projects')
          .select('*, tasks(count)')
          .eq('workspace_id', memberData.workspace_id)
          .order('created_at', { ascending: true });
        if (projects) setProjects(projects);

        // Fetch Members (Workspace + Profiles)
        const { data: members } = await supabase
          .from('workspace_members')
          .select('user_id, role, profiles(full_name, avatar_url)')
          .eq('workspace_id', memberData.workspace_id);
        if (members) setMembers(members);
      } else {
        // User has NO workspace -> Open Create Modal
        setIsWorkspaceModalOpen(true);
      }
    };
    fetchData();
  }, [supabase]);

  // --- HANDLE CREATE WORKSPACE ---
  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Create Workspace
    const { data: workspace, error: wsError } = await supabase
      .from('workspaces')
      .insert({ name: newWorkspaceName })
      .select()
      .single();

    if (wsError || !workspace) {
      alert('Failed to create workspace: ' + (wsError?.message || 'Unknown error'));
      return;
    }

    // 2. Add User as Owner
    const { error: memError } = await supabase
      .from('workspace_members')
      .insert({
        workspace_id: workspace.id,
        user_id: user?.id,
        role: 'owner'
      });

    if (memError) {
      alert('Failed to add owner to workspace');
    } else {
      // Refresh page to load new workspace data
      window.location.reload();
    }
  };

  // --- HANDLE CREATE PROJECT ---
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace) return;

    const { error } = await supabase.from('projects').insert({ 
      name: newProjectName, 
      workspace_id: currentWorkspace.id 
    });

    if (error) alert('Failed to create project');
    else {
      const { data: projects } = await supabase.from('projects').select('*, tasks(count)').order('created_at', { ascending: true });
      if (projects) setProjects(projects);
      setIsProjectModalOpen(false); 
      setNewProjectName('');
    }
  };

  // --- HANDLE INVITE MEMBER ---
  const handleInviteMember = async () => {
    if (!inviteEmail || !currentWorkspace) return;

    // 1. Find user by Email in 'profiles' table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', inviteEmail)
      .single();

    if (profileError || !profile) {
      alert(`User with email "${inviteEmail}" not found. They must sign up first.`);
      return;
    }

    // 2. Add to Workspace Members
    const { error } = await supabase
      .from('workspace_members')
      .insert({
        workspace_id: currentWorkspace.id,
        user_id: profile.id,
        role: 'member'
      });

    if (error) {
      alert(error.message.includes('duplicate') ? 'User already in workspace' : 'Failed to invite');
    } else {
      alert(`Invited ${profile.full_name || inviteEmail}!`);
      setInviteEmail('');
      // Refresh member list
      const { data: members } = await supabase
        .from('workspace_members')
        .select('user_id, role, profiles(full_name, avatar_url)')
        .eq('workspace_id', currentWorkspace.id);
      if (members) setMembers(members);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {currentWorkspace ? currentWorkspace.name : 'Setup'}
            </h1>
            <nav className="hidden md:flex gap-6">
              <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-indigo-600">Dashboard</Link>
            </nav>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-900">{user?.user_metadata?.full_name}</p>
            </div>
            <form action="/auth/signout" method="post">
              <button className="text-slate-400 hover:text-red-600"><LogOut size={20} /></button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* 1. WORKSPACE CREATION MODAL (If no workspace exists) */}
        {isWorkspaceModalOpen && (
          <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-xl shadow-lg text-center animate-in fade-in zoom-in-95">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome!</h2>
            <p className="text-slate-500 mb-6">Create your first workspace to get started.</p>
            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <input 
                type="text" 
                autoFocus
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                placeholder="Workspace Name (e.g. My Company)" 
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                required 
              />
              <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-medium">Create Workspace</button>
            </form>
          </div>
        )}

        {/* 2. TEAM SECTION (If workspace exists) */}
        {currentWorkspace && (
          <div className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-900">Your Team</h2>
              {/* Invite Input */}
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Invite by email..." 
                  className="text-sm px-3 py-1 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
                <button onClick={handleInviteMember} className="bg-indigo-50 text-indigo-600 p-1.5 rounded-md hover:bg-indigo-100 transition-colors" title="Invite Member">
                  <UserPlus size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Current User */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold border-2 border-white shadow-sm">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs text-slate-500">You (Owner)</span>
              </div>

              {/* Other Members */}
              {members.map((m: any) => (
                m.user_id !== user?.id && (
                  <div key={m.user_id} className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-sm font-bold border-2 border-white shadow-sm" title={`${m.profiles.full_name} (${m.role})`}>
                      {m.profiles.full_name?.charAt(0)}
                    </div>
                    <span className="text-xs text-slate-500 capitalize">{m.role}</span>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {/* 3. PROJECTS SECTION */}
        {currentWorkspace && (
          <>
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Projects</h2>
                <p className="text-slate-500 mt-1">Manage your tasks and progress</p>
              </div>
              <button onClick={() => setIsProjectModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2 font-medium">
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
              <button onClick={() => setIsProjectModalOpen(true)} className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/50 transition-all min-h-[160px]">
                <Plus size={32} className="mb-2" />
                <span className="font-medium">Create Project</span>
              </button>
            </div>
          </>
        )}
      </main>

      {/* Create Project Modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 bg-slate-900/20 z-50 flex items-center justify-center backdrop-blur-[2px]">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">New Project</h2>
              <button onClick={() => setIsProjectModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <input type="text" autoFocus className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Project Name" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} required />
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsProjectModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}