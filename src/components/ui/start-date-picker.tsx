import { format, subDays } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface StartDatePickerProps {
  startDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  showReset?: boolean;
  onReset?: () => void;
}

export function StartDatePicker({
  startDate,
  onStartDateChange,
  minDate,
  maxDate,
  disabled = false,
  className,
  placeholder = "Select start date",
  showReset = false,
  onReset,
}: StartDatePickerProps) {
  // Format date to display in UTC
  const formatDateUTC = (date: Date): string => {
    return format(date, "LLL dd, y");
  };

  const endDate = new Date(); // Always today

  const handleLast7Days = () => {
    const thirtyDaysAgo = subDays(endDate, 7);
    // Ensure we don't go before the minimum date
    const startDateToSet =
      minDate && thirtyDaysAgo < minDate ? minDate : thirtyDaysAgo;
    onStartDateChange(startDateToSet);
  };

  const handleLast30Days = () => {
    const thirtyDaysAgo = subDays(endDate, 30);
    // Ensure we don't go before the minimum date
    const startDateToSet =
      minDate && thirtyDaysAgo < minDate ? minDate : thirtyDaysAgo;
    onStartDateChange(startDateToSet);
  };

  const handleLast90Days = () => {
    const ninetyDaysAgo = subDays(endDate, 90);
    // Ensure we don't go before the minimum date
    const startDateToSet =
      minDate && ninetyDaysAgo < minDate ? minDate : ninetyDaysAgo;
    onStartDateChange(startDateToSet);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Quick date selection buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleLast7Days}
          disabled={disabled}
          className="text-xs"
        >
          Last 7 days
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLast30Days}
          disabled={disabled}
          className="text-xs"
        >
          Last 30 days
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLast90Days}
          disabled={disabled}
          className="text-xs"
        >
          Last 90 days
        </Button>
        {showReset && onReset && (
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            disabled={disabled}
            className="text-xs"
          >
            All time
          </Button>
        )}
      </div>

      {/* Date picker */}
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="start-date"
              variant="outline"
              className={cn(
                "flex-1 justify-start text-left font-normal",
                !startDate && "text-muted-foreground",
              )}
              disabled={disabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? (
                <>
                  {formatDateUTC(startDate)} - {formatDateUTC(endDate)}
                </>
              ) : (
                <span>{placeholder}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              autoFocus
              mode="single"
              defaultMonth={startDate}
              selected={startDate}
              onSelect={onStartDateChange}
              disabled={(date) => {
                if (minDate && date < minDate) return true;
                if (maxDate && date > maxDate) return true;
                return false;
              }}
              numberOfMonths={1}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
