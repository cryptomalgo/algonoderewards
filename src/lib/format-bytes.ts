/**
 * Format bytes to human-readable size with rounded values
 * @param bytes - Number of bytes to format
 * @returns Formatted string like "358 KB" or "2 MB"
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i)) + " " + sizes[i];
}
