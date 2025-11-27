import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function displayAlgoAddress(
  address: string | undefined,
  lettersToDisplay = 5,
) {
  if (!address || address.length < lettersToDisplay * 2) {
    return address || "";
  }
  return `${address.slice(0, lettersToDisplay)}...${address.slice(
    -lettersToDisplay,
  )}`;
}

export function calculateAPYAndProjection(
  rewards: number, // rewards received in the period
  algoStaked: number, // amount of Algo staked/held
  days: number, // period duration
): { apy: number; projectedTotal: number } {
  if (algoStaked === 0 || days === 0) return { apy: 0, projectedTotal: 0 };

  const apy = parseFloat(
    ((rewards / algoStaked) * (365 / days) * 100).toFixed(2),
  );
  const projectedTotal = (rewards / days) * 365;
  return { apy, projectedTotal };
}

export function formatMinutes(minutes: number): string {
  if (minutes < 0) {
    throw new Error("Minutes cannot be negative");
  }

  // Calculate hours and remaining minutes
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);

  // Format the result
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  } else {
    return `${mins}m`;
  }
}
