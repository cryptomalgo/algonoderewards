import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
import AlgorandLogo from "@/components/algorand-logo.tsx";
import { animate, motion, useMotionValue } from "motion/react";
import { useEffect, useState } from "react";

export default function AlgoAmountDisplay({
  microAlgoAmount,
  className,
  showAnimation = true,
}: {
  microAlgoAmount: bigint | number;
  className?: string;
  showAnimation?: boolean;
}) {
  // Ensure microAlgoAmount is a BigInt
  const algoAmount = new AlgoAmount({
    microAlgos:
      typeof microAlgoAmount === "number"
        ? BigInt(Math.round(microAlgoAmount))
        : microAlgoAmount,
  });

  const value = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState("0.000");

  useEffect(() => {
    const algoValue = Number(algoAmount.algos);

    if (!showAnimation) {
      // Skip animation if showAnimation is false
      setDisplayValue(formatNumber(algoValue));
      return;
    }

    const controls = animate(value, algoValue, {
      duration: 0.5,
      ease: "easeOut",
      onUpdate: (latest) => {
        setDisplayValue(formatNumber(latest));
      },
    });

    return controls.stop;
  }, [algoAmount.algos, showAnimation, value]);

  // Format number with commas for thousands and fixed 3 decimal places
  function formatNumber(num: number): string {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(num);
  }

  return (
    <span className={`items-center ${className} inline-flex`}>
      <motion.span
        key={String(microAlgoAmount)} // Force re-render when value changes
        initial={{ opacity: 0.6, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {displayValue}
      </motion.span>
      <AlgorandLogo className="ml-0.5" />
    </span>
  );
}
