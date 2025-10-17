//From https://github.com/shadcn-ui/ui/issues/2402

import { createContext, useContext, useState } from "react";
import {
  TooltipProvider as OriginalTooltipProvider,
  Tooltip as OriginalTooltip,
  TooltipTrigger as OriginalTooltipTrigger,
  TooltipContent as OriginalTooltipContent,
} from "./tooltip";
import { Popover, PopoverTrigger, PopoverContent } from "./popover";
import {
  TooltipContentProps,
  TooltipProps,
  TooltipTriggerProps,
  TooltipProviderProps,
} from "@radix-ui/react-tooltip";
import {
  PopoverContentProps,
  PopoverProps,
  PopoverTriggerProps,
} from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

const TouchContext = createContext<boolean | undefined>(undefined);
const useTouch = () => useContext(TouchContext);

export const TooltipProvider = ({
  children,
  ...props
}: TooltipProviderProps) => {
  const [isTouch] = useState<boolean | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    return window.matchMedia("(pointer: coarse)").matches;
  });

  return (
    <TouchContext.Provider value={isTouch}>
      <OriginalTooltipProvider {...props}>{children}</OriginalTooltipProvider>
    </TouchContext.Provider>
  );
};

export const Tooltip = (props: TooltipProps & PopoverProps) => {
  const isTouch = useTouch();

  return isTouch ? <Popover {...props} /> : <OriginalTooltip {...props} />;
};

export const TooltipTrigger = (
  props: TooltipTriggerProps & PopoverTriggerProps,
) => {
  const isTouch = useTouch();
  return isTouch ? (
    <PopoverTrigger {...props} />
  ) : (
    <OriginalTooltipTrigger {...props} />
  );
};

export const TooltipContent = (
  props: TooltipContentProps & PopoverContentProps,
) => {
  const isTouch = useTouch();

  return isTouch ? (
    <PopoverContent
      {...props}
      className={cn(
        props.className,
        "bg-tooltip text-tooltip-foreground border-border w-auto max-w-[200px] rounded-md border p-4 shadow-md",
      )}
    />
  ) : (
    <OriginalTooltipContent {...props} />
  );
};
