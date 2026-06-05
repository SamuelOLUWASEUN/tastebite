export default function Loading() {
  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-4 w-24 bg-surface-800 rounded-full mb-3 animate-pulse" />
        <div className="h-10 w-48 bg-surface-800 rounded-full mb-10 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card overflow-hidden animate-pulse">
              <div className="h-48 bg-surface-800" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-surface-800 rounded-full w-3/4" />
                <div className="h-3 bg-surface-800 rounded-full w-full" />
                <div className="h-3 bg-surface-800 rounded-full w-2/3" />
                <div className="h-9 bg-surface-800 rounded-full mt-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
