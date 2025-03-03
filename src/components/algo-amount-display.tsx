import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
import AlgorandLogo from "@/components/algorand-logo.tsx";

export default function AlgoAmountDisplay({
  microAlgoAmount,
  className,
  iconSize = 12,
}: {
  microAlgoAmount: bigint;
  className?: string;
  iconSize?: number;
}) {
  const algoAmount = new AlgoAmount({ microAlgos: BigInt(microAlgoAmount) });
  return (
    <span className={`flex items-center ${className}`}>
      {algoAmount.algos.toFixed(3)}
      <AlgorandLogo className="ml-0.5" size={iconSize} />
    </span>
  );
}
