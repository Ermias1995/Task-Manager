export default function ProjectLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 h-16 w-full sticky top-0 z-10"></header>
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-8 w-64 bg-slate-200 rounded animate-pulse mb-6"></div>
        
        {/* Form Skeleton */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm h-32 w-full mb-6 animate-pulse"></div>

        {/* Task List Skeleton */}
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-4 rounded-lg border border-slate-200 h-20 w-full animate-pulse"></div>
          ))}
        </div>
      </main>
    </div>
  );
}