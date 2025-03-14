import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
import AlgorandLogo from "@/components/algorand-logo.tsx";
import { animate, motion, useMotionValue } from "motion/react";
import { useEffect, useState } from "react";

export default function AlgoAmountDisplay({
  microAlgoAmount,
  className,
  iconSize = 12,
  showAnimation = true,
}: {
  microAlgoAmount: bigint | number;
  className?: string;
  iconSize?: number;
  showAnimation?: boolean;
}) {
  // Ensure microAlgoAmount is a BigInt
  const algoAmount = new AlgoAmount({
    microAlgos:
      typeof microAlgoAmount === "number"
        ? BigInt(microAlgoAmount)
        : microAlgoAmount,
  });

  const value = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState("0.000");

  useEffect(() => {
    const algoValue = Number(algoAmount.algos);

    if (!showAnimation) {
      // Skip animation if showAnimation is false
      setDisplayValue(algoValue.toFixed(3));
      return;
    }

    const controls = animate(value, algoValue, {
      duration: 0.5,
      ease: "easeOut",
      onUpdate: (latest) => {
        setDisplayValue(latest.toFixed(3));
      },
    });

    return controls.stop;
  }, [algoAmount.algos, showAnimation, value]);

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
      <AlgorandLogo className="ml-0.5" size={iconSize} />
    </span>
  );
}
