import { indexerClient } from "@/lib/indexer-client";
import { useQuery } from "@tanstack/react-query";

const DEFAULT_BLOCK_TIME = 2.8; // Default block time in seconds

// Private API call - not exported
const getAverageBlockTime = () => {
  const minutesAgo = 5;
  const dateAgo = new Date(new Date().getTime() - minutesAgo * 60 * 1000);

  return indexerClient
    .searchForBlockHeaders()
    .limit(50)
    .afterTime(dateAgo.toISOString())
    .do()
    .then((res) => {
      const blocks = res.blocks;
      const timeDifferences: number[] = [];

      for (let i = 0; i < blocks.length - 1; i++) {
        const currentBlock = blocks[i];
        const nextBlock = blocks[i + 1];

        if (currentBlock.timestamp && nextBlock.timestamp) {
          const timeDiff = nextBlock.timestamp - currentBlock.timestamp;
          timeDifferences.push(timeDiff);
        }
      }

      if (timeDifferences.length === 0) {
        console.error(
          "No time differences found, returning default block time",
        );
        return DEFAULT_BLOCK_TIME;
      }

      const averageTimeDiff =
        timeDifferences.reduce((sum, diff) => sum + diff, 0) /
        timeDifferences.length;

      return Math.round(averageTimeDiff * 100) / 100;
    });
};

export const useAverageBlockTime = () => {
  return useQuery({
    queryKey: ["averageBlockTime"],
    queryFn: getAverageBlockTime,
    refetchOnWindowFocus: false,
  });
};
