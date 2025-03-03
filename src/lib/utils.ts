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
