import { animate, motion, useMotionValue } from "motion/react";
import { useEffect, useState } from "react";

interface NumberDisplayProps {
  value: number;
  className?: string;
  duration?: number;
  formatOptions?: Intl.NumberFormatOptions;
  animate?: boolean;
}

export default function NumberDisplay({
  value,
  className,
  duration = 0.5,
  formatOptions,
  animate: shouldAnimate = true,
}: NumberDisplayProps) {
  const motionValue = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (!shouldAnimate) {
      return;
    }

    const controls = animate(motionValue, value, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => {
        setDisplayValue(Math.round(latest * 1000) / 1000);
      },
    });

    return controls.stop;
  }, [value, duration, motionValue, shouldAnimate]);

  // Update displayValue directly when animation is disabled
  const actualDisplayValue = shouldAnimate ? displayValue : value;

  const formattedValue = formatOptions
    ? new Intl.NumberFormat(undefined, formatOptions).format(actualDisplayValue)
    : actualDisplayValue.toString();

  return (
    <motion.span
      key={value} // Force re-render when value changes
      className={className}
      initial={{ opacity: 0.6, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {formattedValue}
    </motion.span>
  );
}
