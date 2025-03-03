import { createFileRoute } from "@tanstack/react-router";
import SearchBar from "../components/SearchBar.tsx";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="p-2">
      <SearchBar />
    </div>
  );
}
