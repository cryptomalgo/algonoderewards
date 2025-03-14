// src/lib/date-utils.ts
export function generateDateRange(startTimestamp?: number): string[] {
  // Create an array of all dates between first timestamp and today
  const firstDate = startTimestamp
    ? new Date(startTimestamp * 1000)
    : new Date();

  // Set to start of day in local timezone
  firstDate.setHours(0, 0, 0, 0);

  const endDate = new Date(); // Today's date
  const allDates = [];
  const currentDate = new Date(firstDate);

  // Generate all dates between first date and today (inclusive)
  while (currentDate <= endDate) {
    // Use date formatting that respects local timezone instead of ISO
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    allDates.push(dateStr);

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return allDates;
}
