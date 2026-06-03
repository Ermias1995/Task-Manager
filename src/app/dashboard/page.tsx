'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import DashboardHeader from '@/components/DashboardHeader';
import TeamSection from '@/components/TeamSection';
import ProjectList from '@/components/ProjectList';

export default function Dashboard() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>(null);
  
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (!user) return;

      const { data: memberData } = await supabase
        .from('workspace_members')
        .select('workspace_id, workspaces(*)')
        .eq('user_id', user.id);

      if (memberData && memberData.length > 0) {
        const wsList = memberData.map((m: any) => m.workspaces);
        setWorkspaces(wsList);
        if (!currentWorkspaceId) setCurrentWorkspaceId(wsList[0].id);
        const activeId = currentWorkspaceId || wsList[0].id;

        const { data: projects } = await supabase
          .from('projects')
          .select('*, tasks(count)')
          .eq('workspace_id', activeId)
          .order('created_at', { ascending: true });
        if (projects) setProjects(projects);

        const { data: members } = await supabase
          .from('workspace_members')
          .select('user_id, role, profiles(full_name, avatar_url)')
          .eq('workspace_id', activeId);
        if (members) setMembers(members);
        setIsWorkspaceModalOpen(false);
      } else {
        setIsWorkspaceModalOpen(true);
      }
    };
    fetchData();
  }, [currentWorkspaceId]);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: workspace } = await supabase.from('workspaces').insert({ name: newWorkspaceName }).select().single();
    if (!workspace) return alert('Failed');
    await supabase.from('workspace_members').insert({ workspace_id: workspace.id, user_id: user?.id, role: 'owner' });
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"> {/* Reduced padding from py-10 to py-6 */}
        
        {isWorkspaceModalOpen ? (
          <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-xl shadow-lg text-center animate-in fade-in zoom-in-95">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome!</h2>
            <p className="text-slate-500 mb-6">Create your first workspace.</p>
            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <input type="text" autoFocus className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Workspace Name" value={newWorkspaceName} onChange={(e) => setNewWorkspaceName(e.target.value)} required />
              <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-medium">Create Workspace</button>
            </form>
          </div>
        ) : (
          <>
            {/* Workspace Switcher */}
            <div className="mb-6 pb-2 border-b border-slate-200">
              <select 
                value={currentWorkspaceId || ''} 
                onChange={(e) => setCurrentWorkspaceId(e.target.value)}
                className="text-xl font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-md px-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer hover:bg-white transition-colors w-full md:w-auto"
              >
                {workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id}>{ws.name}</option>
                ))}
              </select>
            </div>

            <TeamSection 
              currentWorkspaceId={currentWorkspaceId!} 
              members={members} 
              user={user} 
              onMemberAdded={() => window.location.reload()} 
            />
            
            <ProjectList projects={projects} currentWorkspaceId={currentWorkspaceId!} />
          </>
        )}
      </main>
    </div>
  );
}