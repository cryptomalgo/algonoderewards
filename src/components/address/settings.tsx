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

export default function Settings() {
  const { themeSetting, setThemeSetting } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
        <SettingsIcon className="h-5 w-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="dark:border-gray-700 dark:bg-gray-800"
      >
        <DropdownMenuLabel className="dark:text-gray-100">
          Appearance
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="dark:bg-gray-700" />
        <div className="px-2 py-1.5">
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
