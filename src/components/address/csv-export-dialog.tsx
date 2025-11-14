import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CalendarIcon, HelpCircle, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/mobile-tooltip";
import { CSV_COLUMNS, CsvColumnId } from "@/lib/csv-columns.ts";
import { toast } from "sonner";
import { MinimalBlock } from "@/lib/block-types";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface CsvExportDialogProps {
  children: React.ReactNode;
  blocks: MinimalBlock[];
  onExport: (
    selectedColumns: CsvColumnId[],
    includeHeader: boolean,
    fromDate: Date,
    toDate: Date,
  ) => Promise<void>;
}

export default function CsvExportDialog({
  children,
  onExport,
  blocks,
}: CsvExportDialogProps) {
  const [selectedColumns, setSelectedColumns] = useState<CsvColumnId[]>([
    "timestamp",
    "address",
    "payout_algo",
  ]);
  const [includeHeader, setIncludeHeader] = useState<boolean>(true);
  const [open, setOpen] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isWarningChecked, setWarningChecked] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [minDate, setMinDate] = useState<Date | undefined>(
    new Date("2025-01-01"),
  );
  const [maxDate] = useState<Date>(new Date(Date.now()));

  // Format date to display in UTC
  const formatDateUTC = (date: Date): string => {
    // Convert the date to ISO string and extract just the date part
    return format(date, "LLL dd, y");
  };

  // Find the earliest block timestamp when the component mounts
  useEffect(() => {
    if (blocks && blocks.length > 0) {
      const timestamps = blocks.map((block) => block.timestamp);
      const minTimestamp = Math.min(...timestamps);

      // Create UTC date from timestamp
      const utcMinDate = new Date(minTimestamp * 1000);
      setMinDate(utcMinDate);

      // Initialize date range when min date is determined
      if (!dateRange) {
        // Create UTC date range
        const now = new Date();
        setDateRange({
          from: utcMinDate,
          to: now,
        });
      }
    }
  }, [blocks, dateRange]);

  const handleColumnToggle = (columnId: CsvColumnId) => {
    setSelectedColumns((current) =>
      current.includes(columnId)
        ? current.filter((id) => id !== columnId)
        : [...current, columnId],
    );
  };

  const handleSelectAll = () => {
    setSelectedColumns(CSV_COLUMNS.map((col) => col.id));
  };

  const handleSelectNone = () => {
    setSelectedColumns([]);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Use UTC dates for filtering
      const fromDate = dateRange?.from ? new Date(dateRange.from) : new Date(0);
      const toDate = dateRange?.to ? new Date(dateRange.to) : new Date();

      // Filter blocks based on date range (UTC)
      const filteredBlocks = blocks.filter((block) => {
        const blockDate = new Date(block.timestamp * 1000);

        // Set times to ensure we include full days in UTC
        const startDate = new Date(fromDate);
        startDate.setUTCHours(0, 0, 0, 0);

        const endDate = new Date(toDate);
        endDate.setUTCHours(23, 59, 59, 999);

        return blockDate >= startDate && blockDate <= endDate;
      });

      if (filteredBlocks.length === 0) {
        toast.error("No blocks found in the selected date range");
        return;
      }
      await onExport(selectedColumns, includeHeader, fromDate, toDate);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
      setOpen(false);
    }
  };

  // Check if any price column is selected
  const isPriceDataSelected = selectedColumns.some(
    (colId) => CSV_COLUMNS.find((col) => col.id === colId)?.isPriceColumn,
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (isExporting) return; // Prevent closing while exporting
        setOpen(newOpen);
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export to CSV</DialogTitle>
          <DialogDescription>
            Configure your CSV export options
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto px-1 py-4">
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-medium">Date Range (UTC)</h3>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDateRange({
                        from: minDate,
                        to: maxDate,
                      });
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </div>
              <div className="grid gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange && "text-muted-foreground",
                      )}
                      disabled={isExporting}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {formatDateUTC(dateRange.from)} -{" "}
                            {formatDateUTC(dateRange.to)}
                          </>
                        ) : (
                          formatDateUTC(dateRange.from)
                        )
                      ) : (
                        <span>Select date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      autoFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      hidden={{ before: minDate, after: maxDate }}
                      numberOfMonths={2}
                      disabled={(date) => {
                        // Ensure dates are only selectable within valid range
                        return (
                          (minDate && date < minDate) ||
                          (maxDate && date > maxDate)
                        );
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-medium">Select Columns</h3>
                <div className="space-x-2">
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectNone}
                  >
                    Clear
                  </Button>
                </div>
              </div>

              <div className="space-y-3 rounded-md border p-3">
                {CSV_COLUMNS.map((column) => (
                  <div key={column.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={column.id}
                      checked={selectedColumns.includes(column.id)}
                      onCheckedChange={() => handleColumnToggle(column.id)}
                      disabled={isExporting}
                    />
                    <div className="flex flex-1 items-center">
                      <Label
                        htmlFor={column.id}
                        className="cursor-pointer text-sm font-normal"
                      >
                        {column.label}
                      </Label>

                      {column.help && (
                        <Tooltip delayDuration={300}>
                          <TooltipTrigger asChild>
                            <div className="ml-1 cursor-help">
                              <HelpCircle className="h-3.5 w-3.5 text-gray-700 dark:text-gray-300" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-xs">
                            <p className="text-xs">{column.help}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}

                      {column.example && (
                        <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">
                          {column.example}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-header"
                checked={includeHeader}
                onCheckedChange={(checked) =>
                  setIncludeHeader(checked as boolean)
                }
                disabled={isExporting}
              />
              <Label
                htmlFor="include-header"
                className="cursor-pointer text-sm font-normal"
              >
                Include header row
              </Label>
            </div>

            {isPriceDataSelected && (
              <Alert className="bg-yellow-50 text-yellow-800 dark:bg-yellow-400/10 dark:text-yellow-500">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>
                  Important notice about Vestige & Binance price data
                </AlertTitle>
                <AlertDescription className="text-xs text-yellow-800 dark:text-yellow-500">
                  The price data is provided as a convenience and should not be
                  used for tax purposes without verification. While we strive
                  for accuracy, you are responsible for verifying all financial
                  data.
                  <div className="mt-2 flex items-center space-x-2">
                    <Checkbox
                      id="price-data-warning"
                      checked={isWarningChecked}
                      onCheckedChange={(checked) =>
                        setWarningChecked(checked as boolean)
                      }
                    />
                    <Label
                      htmlFor="price-data-warning"
                      className="cursor-pointer text-sm font-normal"
                    >
                      I understand
                    </Label>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        <DialogFooter className="sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setOpen(false)}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              if (isPriceDataSelected && !isWarningChecked) {
                toast.warning(
                  "Please confirm you understand the price data warning",
                );
                const warningCheckbox =
                  document.getElementById("price-data-warning");
                if (warningCheckbox) {
                  warningCheckbox.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                  warningCheckbox.parentElement?.classList.add("animate-pulse");
                  // Remove animation class after animation completes
                  setTimeout(() => {
                    warningCheckbox.parentElement?.classList.remove(
                      "animate-pulse",
                    );
                  }, 1000);
                }
                return;
              }
              handleExport();
            }}
            disabled={
              selectedColumns.length === 0 || isExporting || !dateRange?.from
            }
            className="min-w-[80px]"
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              "Export"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
