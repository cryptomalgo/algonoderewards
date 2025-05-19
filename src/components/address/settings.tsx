import { MoonIcon, SettingsIcon, SunIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { motion } from "framer-motion";
import { exportBlocksToCsv } from "@/lib/csv-export";
import { Block } from "algosdk/client/indexer";
import CsvExportDialog from "@/components/address/csv-export-dialog.tsx";
import { DownloadIcon } from "lucide-react";
import { toast } from "sonner";
import { useAlgoPrice } from "@/hooks/useAlgoPrice";
import AlgorandLogo from "@/components/algorand-logo.tsx";
import { useNavigate, useSearch } from "@tanstack/react-router";

export default function Settings({ blocks }: { blocks: Block[] }) {
  const { themeSetting, setThemeSetting } = useTheme();
  const { price: algoPrice, loading: priceLoading } = useAlgoPrice();
  const navigate = useNavigate({ from: "/$addresses" });
  const search = useSearch({ from: "/$addresses" });
  const statsPanelTheme = search.statsPanelTheme;

  const changeStatsPanelTheme = (newTheme: "light" | "indigo") => {
    navigate({
      search: (prev) => ({
        ...prev,
        statsPanelTheme: newTheme,
      }),
      replace: true, // Replace the URL to avoid adding to history stack
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
        <SettingsIcon className="h-5 w-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="dark:border-gray-700 dark:bg-gray-800"
      >
        <div className="px-2 py-1.5">
          <CsvExportDialog
            blocks={blocks}
            onExport={(columns, includeHeader, fromDate, toDate) => {
              // Filter blocks based on provided date range
              const filteredBlocks = blocks.filter((block) => {
                const blockDate = new Date(block.timestamp * 1000);

                // Set time boundaries for full day comparison
                const startDate = new Date(fromDate);
                startDate.setHours(0, 0, 0, 0);

                const endDate = new Date(toDate);
                endDate.setHours(23, 59, 59, 999);

                return blockDate >= startDate && blockDate <= endDate;
              });

              // Show warning if no blocks found
              if (filteredBlocks.length === 0) {
                toast.error("No blocks found in the selected date range");
                return Promise.reject("No blocks in date range");
              }

              return exportBlocksToCsv(filteredBlocks, columns, includeHeader);
            }}
          >
            <div className="flex w-full cursor-pointer items-center rounded-md px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700">
              <DownloadIcon className="mr-2 h-4 w-4" />
              CSV Download
            </div>
          </CsvExportDialog>
        </div>
        <DropdownMenuSeparator className="dark:bg-gray-700" />

        <DropdownMenuLabel className="dark:text-gray-100">
          Appearance
        </DropdownMenuLabel>
        <div className="px-2 py-1.5">
          <span className="text-sm">Theme</span>
          <ToggleGroup
            type="single"
            value={themeSetting}
            onValueChange={(value) => {
              if (value) setThemeSetting(value as "light" | "dark" | "system");
            }}
            className="relative gap-0.5 rounded-full border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800"
          >
            {/* Animated background highlight */}
            <motion.div
              className="absolute top-0 left-0 h-full rounded-full"
              initial={false}
              animate={{
                width: "33.33%",
                x:
                  themeSetting === "light"
                    ? 0
                    : themeSetting === "system"
                      ? "100%"
                      : "200%",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />

            <ToggleGroupItem
              value="light"
              aria-label="Light Mode"
              className="relative rounded-full bg-transparent px-3 py-1 text-gray-600 transition-colors duration-200 first:rounded-l-full hover:bg-slate-200 data-[state=on]:bg-slate-200 data-[state=on]:shadow-xs dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <motion.div
                animate={{
                  scale: themeSetting === "light" ? 1.1 : 1,
                  rotate: themeSetting === "light" ? 0 : 15,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <SunIcon
                  className={`h-4 w-4 ${themeSetting === "light" ? "fill-current text-amber-500" : ""}`}
                />
              </motion.div>
            </ToggleGroupItem>

            <ToggleGroupItem
              value="system"
              aria-label="System Mode"
              className="relative rounded-full px-3 py-1 text-gray-600 transition-colors duration-200 hover:bg-slate-200 data-[state=on]:bg-slate-200 data-[state=on]:shadow-xs dark:text-gray-300 dark:hover:bg-gray-700 dark:data-[state=on]:bg-gray-700"
            >
              <motion.div
                className={"px-4"}
                animate={{
                  scale: themeSetting === "system" ? 1.1 : 1,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                Auto
              </motion.div>
            </ToggleGroupItem>

            <ToggleGroupItem
              value="dark"
              aria-label="Dark Mode"
              className="relative rounded-full px-3 py-1 text-gray-600 transition-colors duration-200 last:rounded-r-full hover:bg-slate-200 data-[state=on]:bg-transparent data-[state=on]:shadow-xs dark:text-gray-300 dark:hover:bg-gray-700 dark:data-[state=on]:bg-gray-700 dark:data-[state=on]:text-white"
            >
              <motion.div
                animate={{
                  scale: themeSetting === "dark" ? 1.1 : 1,
                  rotate: themeSetting === "dark" ? 0 : 15,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <MoonIcon
                  className={`h-4 w-4 ${themeSetting === "dark" ? "fill-current text-indigo-400" : ""}`}
                />
              </motion.div>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="px-2 py-1.5">
          <span className="text-sm">Light mode stats</span>

          <ToggleGroup
            type="single"
            value={statsPanelTheme || "light"}
            onValueChange={(value) => {
              if (value) changeStatsPanelTheme(value as "light" | "indigo");
            }}
            className="relative gap-0.5 rounded-full border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800"
          >
            {/* Animated background highlight */}
            <motion.div
              className="absolute top-0 left-0 h-full rounded-full"
              initial={false}
              animate={{
                width: "50%",
                x: statsPanelTheme === "light" ? 0 : "100%",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />

            <ToggleGroupItem
              value="light"
              aria-label="Light Stats Theme"
              className="relative rounded-full bg-transparent px-3 py-1 text-gray-600 transition-colors duration-200 first:rounded-l-full hover:bg-slate-200 data-[state=on]:bg-slate-200 data-[state=on]:shadow-xs dark:text-gray-300 dark:hover:bg-gray-700 dark:data-[state=on]:bg-gray-700"
            >
              <motion.div
                animate={{
                  scale: statsPanelTheme === "light" ? 1.1 : 1,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <span className="px-2">Light</span>
              </motion.div>
            </ToggleGroupItem>

            <ToggleGroupItem
              value="indigo"
              aria-label="Indigo Stats Theme"
              className="relative rounded-full px-3 py-1 text-gray-600 transition-colors duration-200 last:rounded-r-full hover:bg-slate-200 data-[state=on]:bg-slate-200 data-[state=on]:shadow-xs dark:text-gray-300 dark:hover:bg-gray-700 dark:data-[state=on]:bg-gray-700"
            >
              <motion.div
                animate={{
                  scale: statsPanelTheme === "indigo" ? 1.1 : 1,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <span className="px-2">Indigo</span>
              </motion.div>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {!priceLoading && algoPrice && (
          <>
            <DropdownMenuSeparator className="dark:bg-gray-700" />
            <div className="flex items-center gap-1 px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center">
                <span className="mr-1">1</span>
                <AlgorandLogo className="h-3.5 w-3.5" />
                <span className="ml-1">=</span>
              </div>
              <span className="font-medium">{algoPrice}</span>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
