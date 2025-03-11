import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon } from "lucide-react";
import { displayAlgoAddress } from "@/lib/utils";
import CopyButton from "@/components/copy-to-clipboard";
import { ResolvedAddress } from "@/components/heatmap/types";

export default function AddressFilters({
  showFilters,
  resolvedAddresses,
  selectedAddresses,
  setSelectedAddresses,
}: {
  showFilters: boolean;
  resolvedAddresses: ResolvedAddress[];
  selectedAddresses: string[];
  setSelectedAddresses: (addresses: string[]) => void;
}) {
  const selectAllAddresses = () => {
    if (selectedAddresses.length === resolvedAddresses.length) {
      setSelectedAddresses([]);
      return;
    }
    setSelectedAddresses(resolvedAddresses.map((addr) => addr.address));
  };

  const handleAddressToggle = (address: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedAddresses([...selectedAddresses, address]);
      return;
    }
    setSelectedAddresses(selectedAddresses.filter((addr) => addr !== address));
  };

  if (resolvedAddresses.length <= 1) return null;

  return (
    <AnimatePresence>
      {showFilters && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <fieldset
            id={"addresses-filter"}
            className={"mt-2 flex flex-col gap-2"}
          >
            <legend className="sr-only">Accounts list</legend>
            <div className="flex gap-2">
              <div className="flex h-6 shrink-0 items-center">
                <div className="group grid size-4 grid-cols-1">
                  <input
                    id={`address-all`}
                    type="checkbox"
                    checked={
                      selectedAddresses.length === resolvedAddresses.length
                    }
                    onChange={selectAllAddresses}
                    className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                  />
                  <CheckIcon
                    className={
                      "pointer-events-none col-start-1 row-start-1 size-2.5 self-center justify-self-center stroke-white stroke-3 group-has-disabled:stroke-gray-950/25"
                    }
                  />
                </div>
              </div>
              <div className="text-sm/6">
                <label
                  htmlFor={`address-all`}
                  className="flex items-center gap-2 font-medium text-nowrap text-gray-900"
                >
                  {selectedAddresses.length === resolvedAddresses.length
                    ? "Deselect all"
                    : "Select all"}
                </label>
              </div>
            </div>
            {resolvedAddresses.map((address) => (
              <AddressCheckbox
                key={address.address}
                address={address}
                checked={selectedAddresses.includes(address.address)}
                onChange={(checked) =>
                  handleAddressToggle(address.address, checked)
                }
              />
            ))}
          </fieldset>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AddressCheckbox({
  address,
  checked,
  onChange,
}: {
  address: ResolvedAddress;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex gap-2">
      <div className="flex h-6 shrink-0 items-center">
        <div className="group grid size-4 grid-cols-1">
          <input
            id={`address-${address.address}`}
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
          />
          <CheckIcon
            className={
              "pointer-events-none col-start-1 row-start-1 size-2.5 self-center justify-self-center stroke-white stroke-3 group-has-disabled:stroke-gray-950/25"
            }
          />
        </div>
      </div>
      <div className="text-sm/6">
        <label
          htmlFor={`address-${address.address}`}
          className="flex items-center gap-2 font-medium text-nowrap text-gray-900"
        >
          {address.nfd ? address.nfd : displayAlgoAddress(address.address)}
          <CopyButton
            address={address.nfd ? address.nfd : address.address}
            small
          />
        </label>
        <p className="hidden items-center gap-2 text-gray-500 sm:flex">
          {address.address} <CopyButton address={address.address} small />
        </p>
      </div>
    </div>
  );
}
