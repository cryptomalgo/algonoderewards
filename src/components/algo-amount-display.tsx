import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
import AlgorandLogo from "@/components/algorand-logo.tsx";
import { animate, motion, useMotionValue } from "motion/react";
import { useEffect, useState } from "react";
import { useAlgoPrice } from "@/hooks/queries/useAlgoPrice";
import { useSearch } from "@tanstack/react-router";

export default function AlgoAmountDisplay({
  microAlgoAmount,
  className,
  showAnimation = true,
  showUsdValue = true,
  hidden = false,
}: {
  microAlgoAmount: bigint | number;
  className?: string;
  showAnimation?: boolean;
  showUsdValue?: boolean;
  hidden?: boolean;
}) {
  const search = useSearch({ from: "/$addresses" });
  const currency = search.currency || "USD";

  // Ensure microAlgoAmount is a BigInt
  const algoAmount = new AlgoAmount({
    microAlgos:
      typeof microAlgoAmount === "number"
        ? BigInt(Math.round(microAlgoAmount))
        : microAlgoAmount,
  });

  const value = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState("0.000");

  const { data: algoPrice } = useAlgoPrice(currency);

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

  // Format currency value
  function formatCurrencyValue(
    algoValue: number,
    price: number,
    currencyCode: string,
  ): string {
    const currencyValue = algoValue * price;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(currencyValue);
  }

  const algoValue = Number(algoAmount.algos);
  const currencyValue =
    algoPrice && showUsdValue
      ? formatCurrencyValue(algoValue, algoPrice, currency)
      : null;

  return (
    <span className={`inline-flex flex-col ${className}`}>
      <span className="inline-flex items-center">
        <motion.span
          key={String(microAlgoAmount)}
          initial={{ opacity: 0.6, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {hidden ? "*****" : displayValue}
        </motion.span>
        <AlgorandLogo className="ml-0.5" />
      </span>
      {showUsdValue && currencyValue && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-fit text-xs"
        >
          {hidden ? "*****" : currencyValue}
        </motion.span>
      )}
    </span>
  );
}
