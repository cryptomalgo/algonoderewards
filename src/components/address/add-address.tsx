import { AnimatePresence, motion } from "framer-motion";
import SearchBar from "./search-bar";
import { ResolvedAddress } from "@/components/heatmap/types.ts";

export default function AddAddress({
  showAddAddress,
  resolvedAddresses,
  setAddresses,
}: {
  showAddAddress: boolean;
  resolvedAddresses: ResolvedAddress[];
  setAddresses: (addresses: string[]) => void;
}) {
  return (
    <AnimatePresence>
      {showAddAddress && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <SearchBar
            addresses={resolvedAddresses.map(
              (resolvedAddress) =>
                resolvedAddress.nfd ?? resolvedAddress.address,
            )}
            setAddresses={setAddresses}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
