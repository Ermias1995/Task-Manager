'use client';
import { createClient } from '@/utils/supabase/client';
import { LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function DashboardHeader() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase]);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4 md:gap-8">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight hidden md:block">TaskFlow</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-900">{user?.user_metadata?.full_name}</p>
          </div>
          <form action="/auth/signout" method="post">
            <button className="text-slate-400 hover:text-red-600">
              <LogOut size={20} />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}