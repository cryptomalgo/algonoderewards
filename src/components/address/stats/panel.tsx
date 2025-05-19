export function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 rounded-lg bg-slate-50 shadow-sm dark:bg-white/6">
      <div className="mx-auto max-w-7xl rounded-lg">{children}</div>
    </div>
  );
}
