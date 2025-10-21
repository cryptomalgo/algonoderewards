import { useMemo, useState, useDeferredValue, Suspense, lazy } from "react";
import { useBlocks } from "@/hooks/useRewardTransactions";
import { useAlgorandAddresses } from "@/hooks/useAlgorandAddress";
import { Error } from "@/components/error";
import AddressBreadcrumb from "./address-breadcrumb";
import AddressFilters from "./address-filters";
import AddAddress from "./add-address";
import { useNavigate } from "@tanstack/react-router";
import CopyButton from "@/components/copy-to-clipboard.tsx";
import { displayAlgoAddress } from "@/lib/utils.ts";

// Lazy load ALL heavy components for better performance
const Heatmap = lazy(() => import("@/components/heatmap/heatmap"));
const StatsPanels = lazy(() => import("./stats/stats-panels"));
const AccountStatus = lazy(() => import("./stats/status/status"));
const CumulativeRewardsChart = lazy(
  () => import("@/components/address/charts/cumulative-rewards-chart"),
);
const CumulativeBlocksChart = lazy(
  () => import("@/components/address/charts/cumulative-blocks-chart"),
);
const RewardByDayHourChart = lazy(
  () => import("@/components/address/charts/reward-by-day-hour-chart.tsx"),
);
const BlockRewardIntervals = lazy(
  () => import("./charts/block-reward-intervals"),
);

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
      search: (prev) => ({
        hideBalance: false,
        theme: prev.theme ?? "system",
        statsPanelTheme: prev.statsPanelTheme ?? "indigo",
      }),
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

  // Use React 18 useDeferredValue for smooth UI updates during heavy rendering
  const deferredBlocks = useDeferredValue(filteredBlocks);

  // Enhanced loading placeholders for different content types
  const StatsFallback = () => (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg bg-gray-100 p-6 dark:bg-gray-800"
        >
          <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="mt-2 h-8 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
      ))}
    </div>
  );

  const HeatmapFallback = () => (
    <div className="mt-6 animate-pulse rounded-lg bg-gray-100 p-6 dark:bg-gray-800">
      <div className="mb-4 h-6 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 49 }).map((_, i) => (
          <div
            key={i}
            className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700"
          ></div>
        ))}
      </div>
    </div>
  );

  // Simple loading placeholder for charts
  const ChartFallback = () => (
    <div className="flex h-80 animate-pulse items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
      <div className="text-gray-500 dark:text-gray-400">Loading chart...</div>
    </div>
  );

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
            {resolvedAddresses.length === 1 && (
              <div>
                <div className={"flex flex-wrap items-center gap-2"}>
                  <h2 className="block text-xl/7 text-gray-700 sm:hidden sm:truncate sm:text-lg sm:tracking-tight">
                    {displayAlgoAddress(resolvedAddresses[0].address)}
                  </h2>
                  <h2 className="hidden text-xl/7 text-gray-700 sm:block sm:truncate sm:text-lg sm:tracking-tight">
                    {resolvedAddresses[0].address}
                  </h2>
                  <CopyButton address={resolvedAddresses[0].address} />
                </div>
                <Suspense fallback={<div className="h-20 animate-pulse"></div>}>
                  <AccountStatus address={resolvedAddresses[0]} />
                </Suspense>
              </div>
            )}
          </div>
          <div className="rounded-lg px-2 py-6 sm:px-3 md:px-4 lg:px-5">
            {/* Priority 1: Stats panels with lazy loading */}
            <Suspense fallback={<StatsFallback />}>
              <StatsPanels
                resolvedAddresses={resolvedAddresses}
                filteredBlocks={filteredBlocks}
                loading={loading}
              />
            </Suspense>

            {/* Priority 2: Heatmap with deferred data for smooth updates */}
            <Suspense fallback={<HeatmapFallback />}>
              <Heatmap blocks={deferredBlocks} />
            </Suspense>

            {/* Priority 3: Heavy charts with lazy loading and Suspense */}
            <Suspense fallback={<ChartFallback />}>
              <CumulativeRewardsChart blocks={deferredBlocks} />
            </Suspense>

            <Suspense fallback={<ChartFallback />}>
              <CumulativeBlocksChart blocks={deferredBlocks} />
            </Suspense>

            <Suspense fallback={<ChartFallback />}>
              <BlockRewardIntervals
                blocks={deferredBlocks}
                resolvedAddresses={resolvedAddresses}
              />
            </Suspense>

            <Suspense fallback={<ChartFallback />}>
              <RewardByDayHourChart blocks={deferredBlocks} />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
