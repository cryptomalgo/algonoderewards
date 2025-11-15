import { useCallback, useRef } from "react";

interface UseLongPressOptions {
  onLongPress: () => void;
  onClick?: () => void;
  delay?: number;
}

export function useLongPress({
  onLongPress,
  onClick,
  delay = 500,
}: UseLongPressOptions) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);

  const start = useCallback(() => {
    isLongPressRef.current = false;

    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      onLongPress();
    }, delay);
  }, [onLongPress, delay]);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  const handleClick = useCallback(() => {
    clear();
    if (!isLongPressRef.current && onClick) {
      onClick();
    }
    isLongPressRef.current = false;
  }, [onClick, clear]);

  return {
    onMouseDown: start,
    onMouseUp: handleClick,
    onMouseLeave: clear,
    onTouchStart: start,
    onTouchEnd: handleClick,
  };
}
