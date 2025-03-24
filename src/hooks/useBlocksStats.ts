// src/hooks/useBlocksStats.ts
import { Block } from "algosdk/client/indexer";
import { format } from "date-fns";
import { useMemo } from "react";

interface PeriodStats {
  avgRewardsPerDay: number;
  avgBlocksPerDay: number;
  totalBlocks: number;
  totalRewards: number;
  startDate: Date;
  endDate: Date;
}

interface ChangeData {
  percentage: number;
  direction: "up" | "down" | "none";
}

export interface BlockStats {
  totalRewards: number;
  totalNbOfBlocksWithRewards: number;
  maxReward: number;
  maxRewardDate: string;
  minReward: number;
  minRewardDate: string;
  maxBlocksInDay: number;
  maxBlocksDay: string;
  maxBlocksRewards: number;

  allTimeAvgRewardsPerDay: number;
  allTimeAvgBlocksPerDay: number;

  last7DaysAvgRewardsPerDay: number;
  last30DaysAvgRewardsPerDay: number;

  previous7Days: PeriodStats;
  last7Days: PeriodStats & {
    change: { rewards: ChangeData; blocks: ChangeData };
  };
  previous30Days: PeriodStats;
  last30Days: PeriodStats & {
    change: { rewards: ChangeData; blocks: ChangeData };
  };
}

type BlockData = Pick<Block, "timestamp" | "proposerPayout">;

export function useBlocksStats(filteredBlocks: BlockData[]): BlockStats {
  return useMemo(() => {
    // Initialize basic stats
    const totalRewards = filteredBlocks.reduce(
      (acc: number, block: BlockData) => {
        return acc + (block?.proposerPayout ?? 0);
      },
      0,
    );

    const totalNbOfBlocksWithRewards = filteredBlocks.length;

    // Group blocks by local user day instead of UTC
    const blocksByDay = filteredBlocks.reduce(
      (acc: Record<string, BlockData[]>, block: BlockData) => {
        const blockDate = new Date(block.timestamp * 1000);
        // Format date to YYYY-MM-DD in local timezone
        const dateKey = format(blockDate, "yyyy-MM-dd");

        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }

        acc[dateKey].push(block);
        return acc;
      },
      {},
    );

    // Find the day with the most blocks
    let maxBlocksInDay = 0;
    let maxBlocksDay = "";
    let maxBlocksRewards = 0;

    Object.entries(blocksByDay).forEach(([day, blocks]) => {
      if (blocks.length > maxBlocksInDay) {
        maxBlocksInDay = blocks.length;
        maxBlocksDay = day;
        // Calculate total rewards for this day
        maxBlocksRewards = blocks.reduce(
          (sum: number, block: BlockData) => sum + (block?.proposerPayout ?? 0),
          0,
        );
      }
    });

    // Format the max blocks day for display
    const formattedMaxBlocksDate = maxBlocksDay ? maxBlocksDay : "N/A";

    // Calculate min and max rewards
    const maxRewardTransaction = filteredBlocks.reduce(
      (acc, block) => {
        const amount = block?.proposerPayout ?? 0;
        const date = block.timestamp ?? 0;
        return acc.amount > amount ? acc : { amount, date };
      },
      { amount: 0, date: 0 },
    );

    const minRewardTransaction = filteredBlocks.reduce(
      (acc, block) => {
        const amount = block?.proposerPayout ?? 0;
        const date = block.timestamp ?? 0;
        return acc.amount < amount ? acc : { amount, date };
      },
      {
        amount:
          filteredBlocks.length > 0
            ? (filteredBlocks[0]?.proposerPayout ?? 0)
            : 0,
        date:
          filteredBlocks.length > 0 ? (filteredBlocks[0]?.timestamp ?? 0) : 0,
      },
    );

    // -------- Calculate time period statistics --------

    // Function to calculate stats for a specific period
    const calculatePeriodStats = (days: number, offset = 0): PeriodStats => {
      // Get today's date at the beginning of the day in user's timezone
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Calculate end date with offset (yesterday - offset at end of day)
      const endDate = new Date(today);
      endDate.setDate(today.getDate() - 1 - offset);
      endDate.setHours(23, 59, 59, 999);

      // Calculate start date (days before end date at start of day)
      const startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - (days - 1));
      startDate.setHours(0, 0, 0, 0);

      // Convert to timestamps for comparison
      const endTimestamp = Math.floor(endDate.getTime() / 1000);
      const startTimestamp = Math.floor(startDate.getTime() / 1000);

      // Filter blocks within the period
      const blocksInPeriod = filteredBlocks.filter(
        (block) =>
          block.timestamp >= startTimestamp && block.timestamp <= endTimestamp,
      );

      // Calculate stats for the period
      const periodRewards = blocksInPeriod.reduce(
        (sum: number, block: BlockData) => sum + (block?.proposerPayout ?? 0),
        0,
      );

      // Calculate averages using total days in period
      const avgRewardsPerDay = Math.round(periodRewards / days);

      const avgBlocksPerDay =
        Math.round((blocksInPeriod.length / days) * 100) / 100;

      return {
        startDate: startDate,
        endDate: endDate,
        avgRewardsPerDay,
        avgBlocksPerDay,
        totalBlocks: blocksInPeriod.length,
        totalRewards: periodRewards,
      };
    };

    const allTimeStats = (() => {
      // If no blocks, return zeros
      if (filteredBlocks.length === 0) {
        return {
          avgRewardsPerDay: 0,
          avgBlocksPerDay: 0,
          totalDays: 0,
        };
      }

      // Sort blocks to find the first block timestamp
      const sortedBlocks = [...filteredBlocks].sort(
        (a, b) => a.timestamp - b.timestamp,
      );
      const firstBlockDate = new Date(sortedBlocks[0].timestamp * 1000);

      // Set first block to beginning of its day
      const startDate = new Date(firstBlockDate);
      startDate.setHours(0, 0, 0, 0);

      // Set end date to yesterday at end of day in user's timezone
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const endDate = new Date(today);
      endDate.setDate(today.getDate() - 1);
      endDate.setHours(23, 59, 59, 999);

      // Convert to timestamps for comparison
      const endTimestamp = Math.floor(endDate.getTime() / 1000);

      // Filter blocks within the period (from first block to yesterday)
      const blocksInPeriod = filteredBlocks.filter(
        (block) => block.timestamp <= endTimestamp,
      );

      // Calculate total rewards for the filtered blocks
      const periodRewards = blocksInPeriod.reduce(
        (sum, block) => sum + (block?.proposerPayout ?? 0),
        0,
      );

      // Calculate total days (add 1 because we want to include both start and end days)
      const totalDays = Math.max(
        1,
        Math.floor(
          (endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000),
        ) + 1,
      );

      return {
        avgRewardsPerDay: Math.round(periodRewards / totalDays),
        avgBlocksPerDay: blocksInPeriod.length / totalDays,
        totalDays,
      };
    })();

    const last7DaysStats = calculatePeriodStats(7);
    const previous7DaysStats = calculatePeriodStats(7, 7);

    const last30DaysStats = calculatePeriodStats(30);
    const previous30DaysStats = calculatePeriodStats(30, 30);

    // Calculate percentage changes
    const calculate7DayChange = (): {
      rewards: ChangeData;
      blocks: ChangeData;
    } => {
      // Rewards change
      let rewardsChange: ChangeData = {
        percentage: 0,
        direction: "none",
      };

      // Blocks change
      let blocksChange: ChangeData = {
        percentage: 0,
        direction: "none",
      };

      // Calculate rewards change if previous value exists
      if (previous7DaysStats.avgRewardsPerDay > 0) {
        const change =
          ((last7DaysStats.avgRewardsPerDay -
            previous7DaysStats.avgRewardsPerDay) /
            previous7DaysStats.avgRewardsPerDay) *
          100;

        rewardsChange = {
          percentage: Math.abs(Math.round(change * 10) / 10),
          direction: change >= 0 ? "up" : "down",
        };
      }

      // Calculate blocks change if previous value exists
      if (previous7DaysStats.avgBlocksPerDay > 0) {
        const change =
          ((last7DaysStats.avgBlocksPerDay -
            previous7DaysStats.avgBlocksPerDay) /
            previous7DaysStats.avgBlocksPerDay) *
          100;

        blocksChange = {
          percentage: Math.abs(Math.round(change * 10) / 10),
          direction: change >= 0 ? "up" : "down",
        };
      }

      return {
        rewards: rewardsChange,
        blocks: blocksChange,
      };
    };

    const calculate30DayChange = (): {
      rewards: ChangeData;
      blocks: ChangeData;
    } => {
      // Rewards change
      let rewardsChange: ChangeData = {
        percentage: 0,
        direction: "none",
      };

      // Blocks change
      let blocksChange: ChangeData = {
        percentage: 0,
        direction: "none",
      };

      // Calculate rewards change if previous value exists
      if (previous30DaysStats.avgRewardsPerDay > 0) {
        const change =
          ((last30DaysStats.avgRewardsPerDay -
            previous30DaysStats.avgRewardsPerDay) /
            previous30DaysStats.avgRewardsPerDay) *
          100;

        rewardsChange = {
          percentage: Math.abs(Math.round(change * 10) / 10),
          direction: change >= 0 ? "up" : "down",
        };
      }

      // Calculate blocks change if previous value exists
      if (previous30DaysStats.avgBlocksPerDay > 0) {
        const change =
          ((last30DaysStats.avgBlocksPerDay -
            previous30DaysStats.avgBlocksPerDay) /
            previous30DaysStats.avgBlocksPerDay) *
          100;

        blocksChange = {
          percentage: Math.abs(Math.round(change * 10) / 10),
          direction: change >= 0 ? "up" : "down",
        };
      }

      return {
        rewards: rewardsChange,
        blocks: blocksChange,
      };
    };

    const sevenDayChange = calculate7DayChange();
    const thirtyDayChange = calculate30DayChange();
    return {
      // Basic stats
      totalRewards: Math.round(totalRewards),
      totalNbOfBlocksWithRewards,
      maxReward: Math.round(maxRewardTransaction.amount),
      maxRewardDate: new Date(
        maxRewardTransaction.date * 1000,
      ).toLocaleString(),
      minReward:
        filteredBlocks.length === 0
          ? 0
          : Math.round(minRewardTransaction.amount),
      minRewardDate: new Date(
        minRewardTransaction.date * 1000,
      ).toLocaleString(),

      // Max blocks in day stat
      maxBlocksInDay,
      maxBlocksDay: formattedMaxBlocksDate,
      maxBlocksRewards: Math.round(maxBlocksRewards),

      // Average rewards stats
      allTimeAvgRewardsPerDay: Math.round(allTimeStats.avgRewardsPerDay),
      allTimeAvgBlocksPerDay: allTimeStats.avgBlocksPerDay,
      last7DaysAvgRewardsPerDay: Math.round(last7DaysStats.avgRewardsPerDay),
      last30DaysAvgRewardsPerDay: Math.round(last30DaysStats.avgRewardsPerDay),

      previous7Days: {
        startDate: previous7DaysStats.startDate,
        endDate: previous7DaysStats.endDate,
        avgRewardsPerDay: previous7DaysStats.avgRewardsPerDay,
        avgBlocksPerDay: previous7DaysStats.avgBlocksPerDay,
        totalBlocks: previous7DaysStats.totalBlocks,
        totalRewards: previous7DaysStats.totalRewards,
      },
      last7Days: {
        startDate: last7DaysStats.startDate,
        endDate: last7DaysStats.endDate,
        avgRewardsPerDay: last7DaysStats.avgRewardsPerDay,
        avgBlocksPerDay: last7DaysStats.avgBlocksPerDay,
        totalBlocks: last7DaysStats.totalBlocks,
        totalRewards: last7DaysStats.totalRewards,
        change: {
          rewards: sevenDayChange.rewards,
          blocks: sevenDayChange.blocks,
        },
      },

      previous30Days: {
        startDate: previous30DaysStats.startDate,
        endDate: previous30DaysStats.endDate,
        avgRewardsPerDay: previous30DaysStats.avgRewardsPerDay,
        avgBlocksPerDay: previous30DaysStats.avgBlocksPerDay,
        totalBlocks: previous30DaysStats.totalBlocks,
        totalRewards: previous30DaysStats.totalRewards,
      },

      last30Days: {
        startDate: last30DaysStats.startDate,
        endDate: last30DaysStats.endDate,
        avgRewardsPerDay: last30DaysStats.avgRewardsPerDay,
        avgBlocksPerDay: last30DaysStats.avgBlocksPerDay,
        totalBlocks: last30DaysStats.totalBlocks,
        totalRewards: last30DaysStats.totalRewards,
        change: {
          rewards: thirtyDayChange.rewards,
          blocks: thirtyDayChange.blocks,
        },
      },
    };
  }, [filteredBlocks]);
}
