import React from "react";
import {
  ChevronRightIcon,
  FilterIcon,
  HomeIcon,
  SlidersHorizontalIcon,
} from "lucide-react";
import { ResolvedAddress } from "@/components/heatmap/types";
import { cn, displayAlgoAddress } from "@/lib/utils";
import Spinner from "@/components/spinner.tsx";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import Settings from "./settings.tsx";
import { useTheme } from "@/components/theme-provider";
import { Block } from "algosdk/client/indexer";

const AddressBreadcrumb = React.memo<{
  resolvedAddresses: ResolvedAddress[];
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  showAddAddress: boolean;
  setShowAddAddress: (show: boolean) => void;
  blocks: Block[];
}>(
  ({
    resolvedAddresses,
    showFilters,
    setShowFilters,
    showAddAddress,
    setShowAddAddress,
    blocks,
  }) => {
    const { theme } = useTheme();
    return (
      <nav aria-label="Breadcrumb" className="flex justify-between">
        <ol role="list" className="flex items-center space-x-4">
          <li>
            <div>
              <a
                href={theme ? `/?theme=${theme}` : "/"}
                className="text-gray-400 hover:text-gray-300 dark:text-gray-500 dark:hover:text-gray-400"
              >
                <HomeIcon aria-hidden="true" className="size-5 shrink-0" />
                <span className="sr-only">Home</span>
              </a>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <ChevronRightIcon
                aria-hidden="true"
                className="size-5 shrink-0 text-gray-400 dark:text-gray-500"
              />
              <a
                href={""}
                aria-current={"page"}
                className="ml-4 hidden text-sm font-medium text-gray-500 hover:text-gray-700 md:block dark:text-gray-400 dark:hover:text-gray-300"
              >
                {resolvedAddresses.length === 0 && <Spinner />}
                {resolvedAddresses.length === 1 &&
                  (resolvedAddresses[0].nfd ?? resolvedAddresses[0].address)}
                {resolvedAddresses.length > 1 &&
                  `Multiple addresses (${resolvedAddresses.length})`}
              </a>
              <a
                href={""}
                aria-current={"page"}
                className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700 md:hidden dark:text-gray-400 dark:hover:text-gray-300"
              >
                {resolvedAddresses.length === 0 && <Spinner />}
                {resolvedAddresses.length === 1 &&
                  (resolvedAddresses[0].nfd ??
                    displayAlgoAddress(resolvedAddresses[0].address))}
                {resolvedAddresses.length > 1 && "Multiple addresses"}
              </a>

              <div className={"ml-3 flex items-center gap-2"}>
                {resolvedAddresses.length > 1 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => {
                          if (!showFilters) {
                            setShowAddAddress(false);
                          }
                          setShowFilters(!showFilters);
                        }}
                        className={cn(
                          "flex cursor-pointer gap-2 rounded-md bg-white px-2 py-2 text-sm font-semibold text-nowrap text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50",
                          "dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700 dark:hover:bg-gray-700",
                          showFilters && "bg-gray-100 dark:bg-gray-700",
                        )}
                      >
                        <FilterIcon className={"size-3"} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
                      Select address to display
                    </TooltipContent>
                  </Tooltip>
                )}
                {resolvedAddresses.length > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => {
                          if (!showAddAddress) {
                            setShowFilters(false);
                          }
                          setShowAddAddress(!showAddAddress);
                        }}
                        className={cn(
                          "flex cursor-pointer gap-2 rounded-md bg-white px-2 py-2 text-sm font-semibold text-nowrap text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50",
                          "dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700 dark:hover:bg-gray-700",
                          showAddAddress && "bg-gray-100 dark:bg-gray-700",
                        )}
                      >
                        <SlidersHorizontalIcon className={"size-3"} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
                      Add or remove addresses
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </li>
        </ol>
        <Settings blocks={blocks} />
      </nav>
    );
  },
);

export default AddressBreadcrumb;
