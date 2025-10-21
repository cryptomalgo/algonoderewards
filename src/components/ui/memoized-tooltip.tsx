import React from "react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/mobile-tooltip";

// Memoized tooltip wrapper for performance
interface MemoizedTooltipProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

export const MemoizedTooltip = React.memo(function MemoizedTooltip({
  trigger,
  content,
  className,
  side = "top",
  align = "center",
}: MemoizedTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>{trigger}</div>
      </TooltipTrigger>
      <TooltipContent className={className} side={side} align={align}>
        {content}
      </TooltipContent>
    </Tooltip>
  );
});

// Memoized TooltipContent component for direct usage
export const MemoizedTooltipContent = React.memo(TooltipContent);

// Memoized TooltipTrigger component for direct usage
export const MemoizedTooltipTrigger = React.memo(TooltipTrigger);

// Specialized memoized tooltip for number displays with dates
interface NumberTooltipProps {
  value: React.ReactNode;
  dateString: string;
}

export const NumberTooltip = React.memo(function NumberTooltip({
  value,
  dateString,
}: NumberTooltipProps) {
  return <MemoizedTooltip trigger={value} content={dateString} />;
});

// Specialized memoized tooltip for amount displays with dates
interface AmountTooltipProps {
  amount: React.ReactNode;
  dateString: string;
}

export const AmountTooltip = React.memo(function AmountTooltip({
  amount,
  dateString,
}: AmountTooltipProps) {
  return <MemoizedTooltip trigger={amount} content={dateString} />;
});

// Comprehensive memoized tooltip for complex use cases
interface ComplexTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  asChild?: boolean;
}

export const ComplexTooltip = React.memo(function ComplexTooltip({
  children,
  content,
  className,
  side = "top",
  align = "center",
  asChild = false,
}: ComplexTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild={asChild}>{children}</TooltipTrigger>
      <TooltipContent className={className} side={side} align={align}>
        {content}
      </TooltipContent>
    </Tooltip>
  );
});
