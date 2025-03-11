import {
  ChevronRightIcon,
  FilterIcon,
  HomeIcon,
  SlidersHorizontalIcon,
} from "lucide-react";
import { ResolvedAddress } from "@/components/heatmap/types";
import { cn, displayAlgoAddress } from "@/lib/utils";
import Spinner from "@/components/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";

export default function AddressBreadcrumb({
  resolvedAddresses,
  showFilters,
  setShowFilters,
  showAddAddress,
  setShowAddAddress,
}: {
  resolvedAddresses: ResolvedAddress[];
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  showAddAddress: boolean;
  setShowAddAddress: (show: boolean) => void;
}) {
  return (
    <nav aria-label="Breadcrumb" className="flex">
      <ol role="list" className="flex items-center space-x-4">
        <li>
          <div>
            <a href="/" className="text-gray-400 hover:text-gray-500">
              <HomeIcon aria-hidden="true" className="size-5 shrink-0" />
              <span className="sr-only">Home</span>
            </a>
          </div>
        </li>
        <li>
          <div className="flex items-center">
            <ChevronRightIcon
              aria-hidden="true"
              className="size-5 shrink-0 text-gray-400"
            />
            <a
              href={""}
              aria-current={"page"}
              className="ml-4 hidden text-sm font-medium text-gray-500 hover:text-gray-700 md:block"
            >
              {resolvedAddresses.length === 0 && <Spinner />}
              {(resolvedAddresses.length === 1 && resolvedAddresses[0].nfd) ??
                resolvedAddresses[0].address}
              {resolvedAddresses.length > 1 &&
                `Multiple addresses (${resolvedAddresses.length})`}
            </a>
            <a
              href={""}
              aria-current={"page"}
              className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700 md:hidden"
            >
              {resolvedAddresses.length === 0 && <Spinner />}
              {resolvedAddresses.length === 1 &&
                displayAlgoAddress(resolvedAddresses[0].address)}
              {resolvedAddresses.length > 1 && "Multiple addresses"}
            </a>

            <div className={"ml-3 flex items-center gap-2"}>
              {resolvedAddresses.length > 1 && (
                <Tooltip>
                  <TooltipProvider>
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
                          showFilters && "bg-gray-100",
                        )}
                      >
                        <FilterIcon className={"size-3"} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Select address to display</TooltipContent>
                  </TooltipProvider>
                </Tooltip>
              )}
              {resolvedAddresses.length > 0 && (
                <Tooltip>
                  <TooltipProvider>
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
                          showAddAddress && "bg-gray-100",
                        )}
                      >
                        <SlidersHorizontalIcon className={"size-3"} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Add or remove addresses</TooltipContent>
                  </TooltipProvider>
                </Tooltip>
              )}
            </div>
          </div>
        </li>
      </ol>
    </nav>
  );
}
