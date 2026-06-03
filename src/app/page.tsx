import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle, BarChart3, Users, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      
      {/* --- NAVBAR --- */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
            T
          </div>
          <span className="text-xl font-bold tracking-tight">TaskFlow</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <Link href="#" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Product</Link>
          <Link href="#" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Solutions</Link>
          <Link href="#" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Pricing</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">Sign In</Link>
          <Link href="/login" className="text-sm font-medium bg-slate-900 text-white px-5 py-2.5 rounded-full hover:bg-slate-800 transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-20 pb-20 px-6 max-w-7xl mx-auto overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Left: Text Content */}
          <div className="flex-1 space-y-6 lg:pr-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold uppercase tracking-wide">
              New: Real-time Collaboration
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
              Manage your team's workflow <span className="text-indigo-600">effortlessly.</span>
            </h1>
            <p className="text-lg text-slate-500 max-w-lg leading-relaxed">
              TaskFlow brings your teams and tasks together in one intuitive workspace. 
              Real-time updates, robust RLS security, and seamless project tracking.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link 
                href="/login" 
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 hover:scale-105 transition-all shadow-xl shadow-indigo-200"
              >
                Start for free <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <button className="px-8 py-4 text-base font-semibold text-slate-700 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                View Demo
              </button>
            </div>

            {/* Social Proof */}
            <div className="pt-8 flex items-center gap-4 text-sm text-slate-400">
              <p className="font-medium text-slate-500">Trusted by modern teams at:</p>
              <div className="flex gap-4 opacity-50">
                <div className="w-20 h-8 bg-slate-200 rounded"></div>
                <div className="w-20 h-8 bg-slate-200 rounded"></div>
                <div className="w-20 h-8 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>

          {/* Right: Visual Representation (CSS Illustration) */}
          <div className="flex-1 relative w-full aspect-square lg:aspect-auto lg:h-[600px] bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 shadow-2xl flex items-center justify-center p-8">
            {/* Abstract Dashboard Representation */}
            <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col">
              {/* Header */}
              <div className="h-12 bg-slate-50 border-b border-slate-100 flex items-center px-4 justify-between">
                <div className="w-24 h-3 bg-slate-200 rounded-full"></div>
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-500"></div>
                  <div className="w-6 h-6 rounded-full bg-slate-200"></div>
                </div>
              </div>
              {/* Body */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-40 h-4 bg-slate-100 rounded"></div>
                  <div className="w-16 h-4 bg-indigo-50 rounded"></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-24 bg-slate-50 rounded-lg border border-slate-100 p-3 space-y-2">
                    <div className="w-full h-2 bg-slate-200 rounded"></div>
                    <div className="w-2/3 h-2 bg-slate-200 rounded"></div>
                    <div className="w-1/2 h-2 bg-slate-200 rounded"></div>
                  </div>
                  <div className="h-24 bg-slate-50 rounded-lg border border-slate-100 p-3 space-y-2">
                    <div className="w-full h-2 bg-slate-200 rounded"></div>
                    <div className="w-3/4 h-2 bg-slate-200 rounded"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="w-32 h-3 bg-slate-100 rounded"></div>
                  <div className="w-8 h-3 bg-indigo-100 rounded"></div>
                </div>
              </div>
              {/* Footer */}
              <div className="h-8 bg-slate-50 border-t border-slate-100 flex items-center px-4 justify-between">
                <div className="w-16 h-2 bg-slate-200 rounded"></div>
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center justify-center p-4 animate-bounce">
              <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                <CheckCircle size={16} />
              </div>
              <div className="text-xs font-bold text-slate-900">Task Done!</div>
            </div>
            
            <div className="absolute bottom-10 -left-8 w-32 bg-white rounded-xl shadow-xl border border-slate-100 p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                <Users size={16} />
              </div>
              <div>
                <div className="w-20 h-2 bg-slate-800 rounded mb-1"></div>
                <div className="w-12 h-2 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need to ship faster</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              From personal projects to enterprise workflows, TaskFlow scales with your needs.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Analytics & Insights</h3>
              <p className="text-slate-500">Track progress across all your workspaces with real-time dashboards.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Real-time Sync</h3>
              <p className="text-slate-500">Collaborate with your team instantly. Updates happen across all devices.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
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