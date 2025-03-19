import { useMemo, useState } from "react";
import { useBlocks } from "@/hooks/useRewardTransactions";
import { useAlgorandAddresses } from "@/hooks/useAlgorandAddress";
import { Error } from "@/components/error";
import Heatmap from "@/components/heatmap/heatmap";
import AddressBreadcrumb from "./address-breadcrumb";
import AddressFilters from "./address-filters";
import StatsPanel from "./stats-panel";
import AddAddress from "./add-address";
import { useNavigate } from "@tanstack/react-router";
import CopyButton from "@/components/copy-to-clipboard.tsx";
import { displayAlgoAddress } from "@/lib/utils.ts";
import CumulativeRewardsChart from "@/components/address/charts/cumulative-rewards-chart";
import CumulativeBlocksChart from "@/components/address/charts/cumulative-blocks-chart";
import RewardByDayHourChart from "@/components/address/charts/reward-by-day-hour-chart.tsx";

export default function AddressView({ addresses }: { addresses: string }) {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const addressesArray = useMemo(
    () => addresses.split(",").filter(Boolean),
    [addresses],
  );
  const { resolvedAddresses } = useAlgorandAddresses(addressesArray);

  // Function to update addresses in both state and URL
  const handleAddAddresses = (newAddresses: string[]) => {
    // Create a unique set of addresses (including only non-empty values)
    const uniqueAddresses = [...new Set([...newAddresses])].filter(Boolean);

    // Update the URL without triggering a full navigation
    navigate({
      to: "/$addresses",
      params: { addresses: uniqueAddresses.join(",") },
      replace: true,
    });
  };
  // Track selected addresses with a state
  const [selectedAddresses, setSelectedAddresses] = useState<string[]>([]);

  // Set all addresses as selected when resolvedAddresses changes
  useMemo(() => {
    if (resolvedAddresses?.length > 0) {
      setSelectedAddresses(resolvedAddresses.map((addr) => addr.address));
    }
  }, [resolvedAddresses]);

  const { data: blocks, loading, hasError } = useBlocks(resolvedAddresses);

  // Filter blocks based on selected addresses
  const filteredBlocks = useMemo(() => {
    if (!blocks) return [];
    if (selectedAddresses.length === 0) return [];

    return blocks.filter(
      (block) =>
        block.proposer && selectedAddresses.includes(block.proposer.toString()),
    );
  }, [blocks, selectedAddresses]);

  if (hasError) {
    return <Error />;
  }

  return (
    <div className="min-h-full">
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="mobile-web-app-capable" content="yes" />
      <main className="mt-4">
        <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2 border-b border-gray-200 pb-5">
            <AddressBreadcrumb
              setShowAddAddress={setShowAddAddress}
              showAddAddress={showAddAddress}
              resolvedAddresses={resolvedAddresses}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              blocks={filteredBlocks}
            />
            <AddAddress
              showAddAddress={showAddAddress}
              resolvedAddresses={resolvedAddresses}
              setAddresses={handleAddAddresses}
            />
            <AddressFilters
              showFilters={showFilters}
              resolvedAddresses={resolvedAddresses}
              selectedAddresses={selectedAddresses}
              setSelectedAddresses={setSelectedAddresses}
            />
            {resolvedAddresses.length === 1 && !showAddAddress && (
              <div className={"flex flex-wrap items-center gap-2"}>
                <h2 className="block text-xl/7 text-gray-700 sm:hidden sm:truncate sm:text-lg sm:tracking-tight">
                  {displayAlgoAddress(resolvedAddresses[0].address)}
                </h2>
                <h2 className="hidden text-xl/7 text-gray-700 sm:block sm:truncate sm:text-lg sm:tracking-tight">
                  {resolvedAddresses[0].address}
                </h2>
                <CopyButton address={resolvedAddresses[0].address} />
              </div>
            )}
          </div>

          <div className="rounded-lg px-5 py-6 sm:px-6">
            <StatsPanel filteredBlocks={filteredBlocks} loading={loading} />
            <Heatmap blocks={filteredBlocks} />
            <CumulativeRewardsChart blocks={filteredBlocks} />
            <CumulativeBlocksChart blocks={filteredBlocks} />
            <RewardByDayHourChart blocks={filteredBlocks} />
          </div>
        </div>
      </main>
    </div>
  );
}
