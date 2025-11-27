import { useMemo, useState, useDeferredValue, Suspense, lazy } from "react";
import { useSearch } from "@tanstack/react-router";
import { useBlocksQuery } from "@/hooks/queries/useBlocksQuery";
import { useAlgorandAddresses } from "@/hooks/useAlgorandAddress";
import { Error } from "@/components/error";
import { ErrorBoundary } from "@/components/error-boundary";
import { FetchProgress } from "@/components/fetch-progress";
import { useCurrentRound } from "@/hooks/queries/useCurrentRound";
import AddressBreadcrumb from "./address-breadcrumb";
import AddressFilters from "./address-filters";
import AddAddress from "./add-address";
import { useNavigate } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { displayAlgoAddress } from "@/lib/utils.ts";
import CopyButton from "@/components/copy-to-clipboard";

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

// Enhanced loading placeholders for different content types
const StatsFallback = () => (
  <div className="space-y-4">
    {/* APY Panel */}
    <div className="mb-4 rounded-lg bg-slate-100 shadow-sm dark:bg-white/6">
      <div className="mx-auto h-full max-w-7xl rounded-lg p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-sm bg-slate-50 px-3 py-2 sm:px-4 sm:py-3 md:py-4 lg:py-5 dark:bg-black/10"
            >
              <Skeleton className="mb-1 h-4 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
    {/* Totals Panel */}
    <div className="mb-4 rounded-lg bg-slate-100 shadow-sm dark:bg-white/6">
      <div className="mx-auto h-full max-w-7xl rounded-lg p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-sm bg-slate-50 px-3 py-2 sm:px-4 sm:py-3 md:py-4 lg:py-5 dark:bg-black/10"
            >
              <Skeleton className="mb-1 h-4 w-24" />
              <Skeleton className="h-6 w-28" />
            </div>
          ))}
        </div>
      </div>
    </div>
    {/* Rewards/Blocks Per Day Panels */}
    <div className="flex justify-between gap-3 md:flex-col">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="mb-4 flex-1 rounded-lg bg-slate-100 shadow-sm dark:bg-white/6"
        >
          <div className="mx-auto h-full max-w-7xl rounded-lg p-4">
            <div className="rounded-sm bg-slate-50 px-3 py-2 sm:px-4 sm:py-3 md:py-4 lg:py-5 dark:bg-black/10">
              <Skeleton className="mb-1 h-4 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const HeatmapFallback = () => (
  <div className="mt-6 rounded-lg bg-gray-100 p-6 dark:bg-gray-800">
    <Skeleton className="mb-4 h-6 w-32" />
    <div className="grid grid-cols-7 gap-1">
      {Array.from({ length: 49 }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-4" />
      ))}
    </div>
  </div>
);

// Enhanced loading placeholder for charts with proper structure
const ChartFallback = () => (
  <div className="-mx-6 mt-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:mx-0 sm:p-6 dark:border-gray-800 dark:bg-gray-900">
    <Skeleton className="mb-2 h-6 w-32" />
    <div className="mt-2" style={{ width: "100%", height: "320px" }}>
      <Skeleton className="h-full w-full" />
    </div>
  </div>
);

export default function AddressView({ addresses }: { addresses: string }) {
  const navigate = useNavigate();
  const search = useSearch({ from: "/$addresses" });
  const [showFilters, setShowFilters] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);

  const addressesArray = useMemo(
    () => addresses.split(",").filter(Boolean),
    [addresses],
  );
  const {
    resolvedAddresses,
    loading: addressLoading,
    hasError: addressError,
  } = useAlgorandAddresses(addressesArray);

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
        enableCache: prev.enableCache ?? false,
        theme: prev.theme ?? "system",
        statsPanelTheme: prev.statsPanelTheme ?? "indigo",
        currency: prev.currency ?? "USD",
      }),
    });
  };

  // Track selected addresses with a state - derive initial value from resolvedAddresses
  const [selectedAddresses, setSelectedAddresses] = useState<string[]>(() =>
    resolvedAddresses?.length > 0
      ? resolvedAddresses.map((addr) => addr.address)
      : [],
  );

  // Sync selectedAddresses when resolvedAddresses changes (but only the keys, not on every render)
  const resolvedAddressKeys = useMemo(
    () =>
      resolvedAddresses?.length > 0
        ? resolvedAddresses.map((addr) => addr.address).join(",")
        : "",
    [resolvedAddresses],
  );

  // Update selected addresses when the resolved addresses change (new addresses loaded)
  useMemo(() => {
    if (resolvedAddresses?.length > 0) {
      setSelectedAddresses(resolvedAddresses.map((addr) => addr.address));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedAddressKeys]);

  const { data: currentRound } = useCurrentRound();

  const {
    data: blocks,
    loading,
    hasError,
    progress,
  } = useBlocksQuery(resolvedAddresses, {
    enableCache: search.enableCache,
    currentRound: currentRound ? Number(currentRound) : undefined,
  });

  // Filter blocks based on selected addresses
  const filteredBlocks = useMemo(() => {
    if (!blocks) return [];
    if (selectedAddresses.length === 0) return [];

    return blocks.filter((block: { proposer?: string }) => {
      return block.proposer && selectedAddresses.includes(block.proposer);
    });
  }, [blocks, selectedAddresses]);

  // Use React 18 useDeferredValue for smooth UI updates during heavy rendering
  const deferredBlocks = useDeferredValue(filteredBlocks);

  if (hasError) {
    return <Error />;
  }

  return (
    <div className="min-h-full">
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="mobile-web-app-capable" content="yes" />
      <FetchProgress
        isVisible={progress.showProgress}
        syncedUntilRound={progress.syncedUntilRound}
        startRound={progress.startRound}
        currentRound={progress.currentRound}
        remainingRounds={progress.remainingRounds}
        fetchedCount={progress.fetchedCount}
        cachedCount={progress.cachedCount}
        isCacheEnabled={search.enableCache}
      />
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
              loading={addressLoading}
              hasError={addressError}
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
            {resolvedAddresses.length === 1 && resolvedAddresses[0] && (
              <div>
                <div className={"flex flex-wrap items-center gap-2"}>
                  <h2 className="block text-xl/7 text-gray-700 sm:hidden sm:truncate sm:text-lg sm:tracking-tight">
                    {displayAlgoAddress(resolvedAddresses[0]?.address)}
                  </h2>
                  <h2 className="hidden text-xl/7 text-gray-700 sm:block sm:truncate sm:text-lg sm:tracking-tight">
                    {resolvedAddresses[0]?.address}
                  </h2>
                  <CopyButton address={resolvedAddresses[0].address} />
                </div>
                <AccountStatus address={resolvedAddresses[0]} />
              </div>
            )}
          </div>
          <div className="rounded-lg px-2 py-6 sm:px-3 md:px-4 lg:px-5">
            {/* Priority 1: Stats panels with lazy loading */}
            <ErrorBoundary>
              <Suspense fallback={<StatsFallback />}>
                <StatsPanels
                  resolvedAddresses={resolvedAddresses}
                  filteredBlocks={filteredBlocks}
                  loading={loading}
                />
              </Suspense>
            </ErrorBoundary>

            <ErrorBoundary>
              <Suspense fallback={<HeatmapFallback />}>
                <Heatmap blocks={filteredBlocks} />
              </Suspense>
            </ErrorBoundary>

            {/* Priority 3: Heavy charts with lazy loading and Suspense */}
            <ErrorBoundary>
              <Suspense fallback={<ChartFallback />}>
                <CumulativeRewardsChart
                  blocks={deferredBlocks}
                  hideBalance={search.hideBalance}
                />
              </Suspense>
            </ErrorBoundary>

            <ErrorBoundary>
              <Suspense fallback={<ChartFallback />}>
                <CumulativeBlocksChart blocks={deferredBlocks} />
              </Suspense>
            </ErrorBoundary>

            <ErrorBoundary>
              <Suspense fallback={<ChartFallback />}>
                <BlockRewardIntervals
                  blocks={deferredBlocks}
                  resolvedAddresses={resolvedAddresses}
                />
              </Suspense>
            </ErrorBoundary>

            <ErrorBoundary>
              <Suspense fallback={<ChartFallback />}>
                <RewardByDayHourChart blocks={deferredBlocks} />
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
      </main>
    </div>
  );
}
