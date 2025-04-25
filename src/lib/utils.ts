import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function displayAlgoAddress(address: string, lettersToDisplay = 5) {
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
