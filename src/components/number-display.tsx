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
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!shouldAnimate) {
      setDisplayValue(value);
      return;
    }

    const controls = animate(motionValue, value, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => {
        setDisplayValue(Math.round(latest));
      },
    });

    return controls.stop;
  }, [value, duration, motionValue, shouldAnimate]);

  const formattedValue = formatOptions
    ? new Intl.NumberFormat(undefined, formatOptions).format(displayValue)
    : displayValue.toString();

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
