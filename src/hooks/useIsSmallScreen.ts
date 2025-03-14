import { useState, useEffect } from "react";

/**
 * Custom hook that returns a boolean indicating if the current screen width
 * is less than the provided threshold
 *
 * @param threshold - The width threshold in pixels (default: 768px for md breakpoint)
 * @returns boolean - True if screen width is less than threshold
 */
export function useIsSmallScreen(threshold = 768): boolean {
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(false);

  useEffect(() => {
    // Initial check
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < threshold);
    };

    // Set initial value
    checkScreenSize();

    // Add event listener for resize
    window.addEventListener("resize", checkScreenSize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, [threshold]);

  return isSmallScreen;
}
