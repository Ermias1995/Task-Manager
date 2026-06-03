'use client';
import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface TeamSectionProps {
  currentWorkspaceId: string;
  members: any[];
  user: any;
  onMemberAdded: () => void;
}

export default function TeamSection({ currentWorkspaceId, members, user, onMemberAdded }: TeamSectionProps) {
  const supabase = createClient();
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  const handleInviteMember = async () => {
    if (!inviteEmail.trim() || !currentWorkspaceId) return;
    setIsInviting(true);
    const { data: profile } = await supabase.from('profiles').select('*').eq('email', inviteEmail).single();
    if (!profile) { alert('User not found'); setIsInviting(false); return; }
    
    const { error } = await supabase.from('workspace_members').insert({
      workspace_id: currentWorkspaceId, user_id: profile.id, role: 'member'
    });
    if (error) alert('Failed to invite');
    else { onMemberAdded(); setInviteEmail(''); }
    setIsInviting(false);
  };

  return (
    <div className="flex flex-col md:flex-row items-start justify-between gap-4 bg-white p-4 my-8 rounded-xl border border-slate-200 shadow-sm">
      {/* Left: Title */}
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-slate-900">Your Team</h2>
        <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-md font-medium">
          {members.length} {members.length === 1 ? 'Member' : 'Members'}
        </span>
      </div>

      {/* Right: Invite Input */}
      <div className="flex items-center gap-2 w-full md:w-auto">
        <input 
          type="email" 
          placeholder="Invite..." 
          className="text-sm px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full md:w-48 text-slate-600"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleInviteMember()}
        />
        <button 
          onClick={handleInviteMember}
          disabled={isInviting}
          className="bg-indigo-600 text-white p-1.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          <UserPlus size={16} />
        </button>
      </div>
    </div>
  );
}