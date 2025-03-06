import { useState } from "react";
import { motion } from "framer-motion";
import { ClipboardCheckIcon, CopyIcon } from "lucide-react";

const CopyButton = ({
  address,
  small = false,
}: {
  address: string;
  small?: boolean;
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  };

  return (
    <motion.button
      onClick={copyToClipboard}
      className={
        "flex cursor-pointer gap-2 rounded-md bg-white px-2 py-2 text-sm font-semibold text-nowrap text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50"
      }
    >
      {copied ? (
        <ClipboardCheckIcon className={small ? "size-3" : "size-5"} />
      ) : (
        <CopyIcon className={small ? "size-3" : "size-5"} />
      )}
      {!small && (copied ? "Copied" : "Copy Address")}
    </motion.button>
  );
};

export default CopyButton;
