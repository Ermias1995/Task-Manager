import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle, BarChart3, Users, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      
      {/* --- NAVBAR --- */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-200">
            T
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">TaskFlow</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors px-4 py-2 rounded-lg hover:bg-slate-50">
            Sign In
          </Link>
          <Link 
            href="/login" 
            className="text-sm font-semibold bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition-all hover:shadow-lg shadow-indigo-200/50"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-16 pb-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Left: Text Content */}
          <div className="flex-1 space-y-8 lg:pr-12 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider border border-indigo-100">
              New: Real-time Collaboration
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-slate-900">
              Manage your team's <br/>
              <span className="text-indigo-600">workflow effortlessly.</span>
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed max-w-lg">
              TaskFlow brings your teams and tasks together in one intuitive workspace. 
              Real-time updates, robust RLS security, and seamless project tracking.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link 
                href="/login" 
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 hover:-translate-y-1"
              >
                Start for free <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Right: Visual Representation */}
          <div className="flex-1 relative w-full lg:w-auto">
            {/* Main Dashboard Card */}
            <div className="bg-slate-50 rounded-3xl border border-slate-200 shadow-2xl overflow-hidden p-8 max-w-[500px] mx-auto">
              {/* Header */}
              <div className="h-10 bg-white border-b border-slate-100 flex items-center px-4 justify-between mb-6 rounded-t-2xl">
                <div className="w-28 h-3 bg-slate-200 rounded-full"></div>
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-500"></div>
                  <div className="w-6 h-6 rounded-full bg-slate-200"></div>
                </div>
              </div>
              
              {/* Body */}
              <div className="space-y-5">
                <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                  <div className="w-32 h-3 bg-slate-200 rounded"></div>
                  <div className="w-16 h-3 bg-indigo-50 rounded"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-24 bg-white rounded-xl border border-slate-100 p-4 space-y-2 shadow-sm">
                    <div className="w-full h-2 bg-slate-200 rounded"></div>
                    <div className="w-2/3 h-2 bg-slate-200 rounded"></div>
                    <div className="w-1/2 h-2 bg-slate-200 rounded"></div>
                  </div>
                  <div className="h-24 bg-white rounded-xl border border-slate-100 p-4 space-y-2 shadow-sm">
                    <div className="w-full h-2 bg-slate-200 rounded"></div>
                    <div className="w-3/4 h-2 bg-slate-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* CENTERED ANIMATIONS (Floating Elements) */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col gap-4 w-full pointer-events-none">
              
              {/* Task Done Bubble */}
              <div className="mx-auto w-auto bg-white px-6 py-4 rounded-2xl shadow-2xl shadow-indigo-100 border border-slate-100 flex items-center gap-4 animate-bounce">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Task Completed</div>
                  <div className="text-xs text-slate-500">Just now</div>
                </div>
              </div>
              
              {/* Team Member Notification */}
              <div className="mx-auto w-auto bg-white px-6 py-4 rounded-2xl shadow-2xl shadow-purple-100 border border-slate-100 flex items-center gap-4" style={{ animationDelay: '0.5s' }}>
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Users size={20} />
                </div>
                <div>
                  <div className="w-24 h-2 bg-slate-800 rounded mb-1"></div>
                  <div className="w-16 h-2 bg-slate-200 rounded"></div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Everything you need to ship faster</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              From personal projects to enterprise workflows, TaskFlow scales with your needs.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Analytics & Insights</h3>
              <p className="text-slate-500">Track progress across all your workspaces with real-time dashboards.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Real-time Sync</h3>
              <p className="text-slate-500">Collaborate with your team instantly. Updates happen across all devices.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-6">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Team Management</h3>
              <p className="text-slate-500">Invite members, assign tasks, and manage permissions securely.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-slate-200 py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-400 text-sm">
          <p>&copy; {new Date().getFullYear()} TaskFlow. Built for builders.</p>
        </div>
      </footer>

    </div>
  );
}