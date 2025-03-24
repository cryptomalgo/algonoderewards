import { register, unregister, TimeZone } from "timezone-mock";

/**
 * Converts standard GMT notation to timezone-mock format
 * Note: timezone-mock uses reversed notation where Etc/GMT+2 means GMT-2
 */
export function setTimezone(zone: `GMT${"+" | "-"}${number}`): () => void {
  // Extract the sign and number from the input
  const match = zone.match(/^GMT([+-])(\d+)$/);
  if (!match) {
    throw new Error(
      `Invalid timezone format: ${zone}. Use format "GMT+n" or "GMT-n"`,
    );
  }

  const [, sign, numStr] = match;
  const num = parseInt(numStr, 10);

  if (num < 0 || num > 14) {
    throw new Error(`Timezone offset must be between 0 and 14 (got ${num})`);
  }

  // Reverse the sign for timezone-mock's reversed notation
  const reversedSign = sign === "+" ? "-" : "+";
  const mockZone = `Etc/GMT${reversedSign}${num}` as TimeZone;

  register(mockZone);

  // Return cleanup function
  return () => unregister();
}

/**
 * Type-safe GMT timezone offsets
 * Allows values from GMT-12 to GMT+14
 */
export type GMTOffset =
  | "GMT+0"
  | "GMT+1"
  | "GMT+2"
  | "GMT+3"
  | "GMT+4"
  | "GMT+5"
  | "GMT+6"
  | "GMT+7"
  | "GMT+8"
  | "GMT+9"
  | "GMT+10"
  | "GMT+11"
  | "GMT+12"
  | "GMT+13"
  | "GMT+14"
  | "GMT-0"
  | "GMT-1"
  | "GMT-2"
  | "GMT-3"
  | "GMT-4"
  | "GMT-5"
  | "GMT-6"
  | "GMT-7"
  | "GMT-8"
  | "GMT-9"
  | "GMT-10"
  | "GMT-11"
  | "GMT-12";

/**
 * Type-safe timezone setter
 * @returns A cleanup function to restore the timezone
 */
export function setGMTTimezone(zone: GMTOffset): () => void {
  return setTimezone(zone);
}

/**
 * @returns A cleanup function to restore the timezone
 */
export function setUTCTimezone(): () => void {
  register("UTC");
  return () => unregister();
}
