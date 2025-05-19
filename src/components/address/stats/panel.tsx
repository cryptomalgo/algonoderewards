import { cn } from "@/lib/utils";
import { useSearch } from "@tanstack/react-router";

export function Panel({ children }: { children: React.ReactNode }) {
  const search = useSearch({ from: "/$addresses" });
  const statsPanelTheme = search.statsPanelTheme;

  return (
    <div
      className={cn(
        "mb-4 rounded-lg shadow-sm dark:bg-white/6",
        statsPanelTheme === "indigo" ? "bg-indigo-500" : "bg-slate-100",
      )}
    >
      <div className="mx-auto h-full max-w-7xl rounded-lg">{children}</div>
    </div>
  );
}
