import { FormEvent, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import AlgorandLogo from "@/components/algorand-logo.tsx";

export default function SearchBar() {
  const [address, setAddress] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      navigate({
        to: "/$address",
        params: { address: address.trim().toUpperCase() },
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label
          htmlFor="query"
          className="block text-sm/6 font-medium text-gray-900"
        >
          Enter an Algorand address or{" "}
          <a href={"https://app.nf.domains"}>NFD</a>
        </label>
        <div className="mt-2 flex">
          <div className="-mr-px grid grow grid-cols-1 focus-within:relative">
            <input
              id="query"
              name="query"
              type="text"
              autoCorrect="off"
              spellCheck={false}
              placeholder="noderewards.algo"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="col-start-1 row-start-1 block w-full rounded-l-md bg-white py-1.5 pr-3 pl-10 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:pl-9 sm:text-lg/6"
            />

            <AlgorandLogo
              size={12}
              className="pointer-events-none col-start-1 row-start-1 ml-3 size-5 self-center text-gray-400 sm:size-4"
            />
          </div>
          <button
            type="submit"
            className="flex shrink-0 items-center gap-x-1.5 rounded-r-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-1 -outline-offset-1 outline-gray-300 hover:bg-gray-50 focus:relative focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
          >
            Get stats
          </button>
        </div>
      </div>
    </form>
  );
}
