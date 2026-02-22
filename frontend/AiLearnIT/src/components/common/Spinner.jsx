export default function Spinner() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-slate-800 rounded"></div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 bg-slate-800 rounded-xl"></div>
        ))}
      </div>

      <div className="h-75 bg-slate-800 rounded-xl"></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-60 bg-slate-800 rounded-xl"></div>
        <div className="h-60 bg-slate-800 rounded-xl"></div>
      </div>
    </div>
  );
}
