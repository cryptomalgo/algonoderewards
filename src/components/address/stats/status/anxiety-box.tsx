import { DotBadge } from "@/components/dot-badge";
import { useAverageBlockTime } from "@/hooks/useAverageBlockTime";
import { useStakeInfo } from "@/hooks/useStakeInfo";
import { formatMinutes } from "@/lib/utils";
import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
import { Account } from "algosdk/client/indexer";
import { AnxietyGauge } from "./anxiety-gauge";
import { LastBlockProposedBadge } from "./last-block-proposed-badge";
import AnticipatedTimeBetweenBlocksBadge from "./anticipated-time-between-blocks-badge";
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/mobile-tooltip";
import AlgoAmountDisplay from "@/components/algo-amount-display";
import Spinner from "@/components/spinner";

/**
 * Calculate the likelihood of not receiving rewards based on stake and rounds since last reward
 * @param accountStake The stake amount for the account
 * @param totalOnlineStake The total online stake in the network
 * @param roundsSinceLastReward Number of rounds since the account last proposed a block
 * @returns Probability (0-100) that the account should have proposed a block by now
 */
function calculateLikelihoodOfNoRewards(
  accountStake: AlgoAmount,
  totalOnlineStake: AlgoAmount,
  roundsSinceLastReward: number,
): number {
  const percentageOfTotalStake = accountStake.algos / totalOnlineStake.algos;

  return (1 - percentageOfTotalStake) ** roundsSinceLastReward * 100;
}

export function AnxietyBox({ account }: { account: Account }) {
  const {
    data: stakeInfo,
    isPending: isStakeInfoPending,
    error: stakeInfoError,
  } = useStakeInfo();
  const {
    data: averageBlockTime,
    isPending: isBlockTimePending,
    error: blockTimeError,
  } = useAverageBlockTime();

  if (isStakeInfoPending || isBlockTimePending) {
    return <Spinner />;
  }
  if (stakeInfoError) {
    return (
      <div className="text-red-500">
        Error fetching stake info: {stakeInfoError.message}
      </div>
    );
  }

  if (blockTimeError) {
    return (
      <div className="text-red-500">
        Error fetching stake info: {blockTimeError.message}
      </div>
    );
  }

  if (account.lastProposed === undefined) {
    return (
      <DotBadge className="text-md" color="red" label="No block proposed" />
    );
  }

  const accountStake = new AlgoAmount({ microAlgos: account.amount });
  const totalStake = new AlgoAmount({
    microAlgos: Number(stakeInfo.stake_micro_algo),
  });

  const stakeRatio =
    Number(accountStake.microAlgos) / Number(totalStake.microAlgos);
  const roundsBetweenBlocks =
    Number(totalStake.microAlgos) / Number(accountStake.microAlgos);
  const anticipatedBlockTimeMinutes = averageBlockTime / stakeRatio / 60;
  const likelihoodOfNoRewards = calculateLikelihoodOfNoRewards(
    accountStake,
    totalStake,
    Number(account.round) - account.lastProposed,
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <AnxietyGauge value={Math.round(likelihoodOfNoRewards)} />
            </TooltipTrigger>
            <TooltipContent>
              Shows how normal it is to not have proposed a block since the last
              one, based on expected timing between proposed blocks.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <LastBlockProposedBadge account={account} />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <AnticipatedTimeBetweenBlocksBadge
              ancitipatedTimeInMinutes={anticipatedBlockTimeMinutes}
            />
          </TooltipTrigger>
          <TooltipContent>
            The estimated number of rounds between proposed blocks is{" "}
            <span className="dark:bg-accent bg-gray-700">
              total stake / your stake
            </span>
            .
            <br />
            Based on the total stake of{" "}
            <AlgoAmountDisplay
              microAlgoAmount={totalStake.microAlgos}
              showUsdValue={false}
              showAnimation={false}
            />{" "}
            and your stake{" "}
            <AlgoAmountDisplay
              microAlgoAmount={accountStake.microAlgos}
              showUsdValue={false}
              showAnimation={false}
            />{" "}
            you should propose every{" "}
            <strong>{Math.round(roundsBetweenBlocks)} rounds</strong>. <br />
            With a average round time of {averageBlockTime}s it's{" "}
            <strong>{Math.round(anticipatedBlockTimeMinutes)}</strong> minutes
            so {formatMinutes(Math.round(anticipatedBlockTimeMinutes))}.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
