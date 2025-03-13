import { useState } from "react";
import { motion } from "motion/react";
import { ClipboardCheckIcon, CopyIcon } from "lucide-react";

const CopyButton = ({
  address,
  small = false,
}: {
  address: string;
  small?: boolean;
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  };

  return (
    <motion.button
      onClick={copyToClipboard}
      className={
        "dark:text-foreground bg-secondary text-secondary-foreground flex cursor-pointer gap-2 rounded-md px-2 py-2 text-sm font-semibold text-nowrap shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 dark:bg-gray-800 dark:ring-gray-700 dark:hover:bg-gray-700"
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
