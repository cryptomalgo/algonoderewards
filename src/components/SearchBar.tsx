import { FormEvent, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

export default function SearchBar() {
  const [address, setAddress] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      navigate({ to: "/$address", params: { address } });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded bg-white p-4 shadow-md"
      >
        <input
          type="text"
          placeholder="Enter Algorand address..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="mb-4 w-full rounded border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          className="w-full rounded bg-blue-500 p-2 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          Search
        </button>
      </form>
    </div>
  );
}
