export interface DayWithRewards {
  date: string;
  count: number;
  totalAmount: number;
}

export interface DisplayMonth {
  month: number;
  year: number;
}

export type ResolvedAddress = {
  nfd: string | null;
  address: string;
};
