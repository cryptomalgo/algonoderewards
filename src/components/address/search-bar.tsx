import { useState } from "react";
import AlgorandLogo from "@/components/algorand-logo.tsx";
import { displayAlgoAddress } from "@/lib/utils.ts";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SearchBar({
  addresses,
  setAddresses,
}: {
  addresses: string[];
  setAddresses: (addresses: string[]) => void;
}) {
  const [inputValue, setInputValue] = useState<string>("");
  const [isInputValid, setIsInputValid] = useState<boolean>(true);

  const validateAddress = (address: string): boolean => {
    const trimmedAddress = address.trim();
    // Check if it's a 58-char alphanumeric string or ends with .algo (case insensitive)
    return (
      /^[A-Za-z0-9]{58}$/.test(trimmedAddress) ||
      /\.algo$/i.test(trimmedAddress)
    );
  };

  const addAddress = () => {
    const trimmedInput = inputValue.trim();

    if (trimmedInput === "") return;

    if (!validateAddress(trimmedInput)) {
      setIsInputValid(false);
      return;
    }

    if (!addresses.includes(trimmedInput)) {
      setAddresses([...addresses, trimmedInput]);
      setInputValue("");
      setIsInputValid(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsInputValid(true); // Reset validation state when input changes
  };

  const removeAddress = (indexToRemove: number) => {
    setAddresses(addresses.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission
      addAddress();
    }
  };

  return (
    <div className={"max-w-sm"}>
      <label
        htmlFor="query"
        className="block text-sm/6 font-medium text-gray-900 dark:text-gray-100"
      >
        Enter a list of Algorand addresses or{" "}
        <a href={"https://app.nf.domains"}>NFD</a> to get stats
      </label>

      {/* Address tags */}
      <div className="my-2 mb-2 flex flex-wrap gap-2">
        {addresses.length > 0 &&
          addresses.map((address, index) => (
            <div
              key={index}
              className="flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-blue-700/10 ring-inset dark:bg-indigo-900/30 dark:text-indigo-300 dark:ring-indigo-500/30"
            >
              <span className="mr-1 max-w-[200px] truncate">
                {address.length === 58 ? displayAlgoAddress(address) : address}
              </span>
              {addresses.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAddress(index)}
                  className="text-indigo-400 hover:text-indigo-600 dark:text-indigo-300 dark:hover:text-indigo-200"
                >
                  <XIcon className="size-4" />
                </button>
              )}
            </div>
          ))}
      </div>

      <div className="mt-2 flex">
        <div className="-mr-px grid grow grid-cols-1 focus-within:relative">
          <input
            id="query"
            name="query"
            type="text"
            autoCorrect="off"
            spellCheck={false}
            placeholder="noderewards.algo"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className={cn(
              "col-start-1 row-start-1 block w-full rounded-l-md py-1.5 pr-3 pl-10 text-base outline-1 -outline-offset-1",
              "bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100",
              "placeholder:text-gray-400 dark:placeholder:text-gray-500",
              "focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:focus:outline-indigo-500",
              isInputValid
                ? "outline-gray-300 dark:outline-gray-600"
                : "outline-red-500 dark:outline-red-700",
              "sm:pl-9 sm:text-lg/6",
            )}
          />

          <AlgorandLogo className="pointer-events-none col-start-1 row-start-1 ml-3 size-5 self-center text-gray-400 sm:size-4 dark:text-gray-500" />
        </div>

        <button
          type="button"
          onClick={addAddress}
          className={cn(
            "flex shrink-0 items-center gap-x-1.5 rounded-r-md px-3 py-2 text-sm font-semibold",
            "bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100",
            "outline-1 -outline-offset-1 outline-gray-300 dark:outline-gray-600",
            "hover:bg-gray-50 dark:hover:bg-gray-700",
            "focus:relative focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:focus:outline-indigo-500",
          )}
        >
          +
        </button>
      </div>
      {!isInputValid && (
        <p className="mt-1 text-sm text-red-500 dark:text-red-400">
          Please enter a valid Algorand address (58 characters) or NFD domain
          (.algo)
        </p>
      )}
    </div>
  );
}
