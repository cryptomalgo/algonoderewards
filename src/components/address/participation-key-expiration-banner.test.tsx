import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ParticipationKeyExpirationBanner } from "./participation-key-expiration-banner";
import type { ResolvedAddress } from "@/components/heatmap/types";
import { PARTICIPATION_KEY_MANAGEMENT_DOCS_URL } from "@/constants";
import { useAccounts } from "@/hooks/queries/useAccounts";
import { useAverageBlockTime } from "@/hooks/queries/useAverageBlockTime";

vi.mock("@/hooks/queries/useAccounts", () => ({ useAccounts: vi.fn() }));
vi.mock("@/hooks/queries/useAverageBlockTime", () => ({
  useAverageBlockTime: vi.fn(),
}));

const mockedUseAccounts = vi.mocked(useAccounts);
const mockedUseAverageBlockTime = vi.mocked(useAverageBlockTime);

const BLOCK_TIME = 3;
const ROUNDS_PER_DAY = 86_400 / BLOCK_TIME;
const CURRENT_ROUND = 1_000_000n;
const ACCOUNT_ADDRESS = "A".repeat(58);
const ALICE_ADDRESS: ResolvedAddress = {
  address: ACCOUNT_ADDRESS,
  nfd: "alice.algo",
};

function accountExpiringInDays(days: number) {
  return {
    round: CURRENT_ROUND,
    participation: {
      voteLastValid: CURRENT_ROUND + BigInt(Math.round(days * ROUNDS_PER_DAY)),
    },
  };
}

function mockAccounts(
  accounts: unknown[],
  { pending = false }: { pending?: boolean } = {},
) {
  mockedUseAccounts.mockReturnValue({
    data: accounts,
    pending,
  } as unknown as ReturnType<typeof useAccounts>);
}

function mockAverageBlockTime(
  blockTime: number | undefined,
  { pending = false }: { pending?: boolean } = {},
) {
  mockedUseAverageBlockTime.mockReturnValue({
    data: blockTime,
    isPending: pending,
  } as unknown as ReturnType<typeof useAverageBlockTime>);
}

function renderBanner(resolvedAddresses: ResolvedAddress[]) {
  return render(
    <ParticipationKeyExpirationBanner resolvedAddresses={resolvedAddresses} />,
  );
}

describe("ParticipationKeyExpirationBanner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAverageBlockTime(BLOCK_TIME);
  });

  afterEach(() => {
    cleanup();
  });

  it("warns when a key expires inside the warning window", () => {
    mockAccounts([accountExpiringInDays(5)]);

    renderBanner([ALICE_ADDRESS]);

    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByText(/alice\.algo/)).toBeTruthy();
    expect(screen.getByText(/expires in 5 days/)).toBeTruthy();
  });

  it("escalates to a critical message inside the critical window", () => {
    mockAccounts([accountExpiringInDays(1)]);

    renderBanner([ALICE_ADDRESS]);

    expect(screen.getByText(/within a day/)).toBeTruthy();
    expect(screen.getByText(/Register a new key now/)).toBeTruthy();
  });

  it("reports an already expired key", () => {
    mockAccounts([
      {
        round: CURRENT_ROUND,
        participation: { voteLastValid: CURRENT_ROUND - 1n },
      },
    ]);

    renderBanner([ALICE_ADDRESS]);

    expect(screen.getByText(/has expired/)).toBeTruthy();
  });

  it("renders nothing while account data is loading", () => {
    mockAccounts([], { pending: true });

    renderBanner([ALICE_ADDRESS]);

    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("renders nothing while the average block time is loading", () => {
    mockAccounts([accountExpiringInDays(1)]);
    mockAverageBlockTime(undefined, { pending: true });

    renderBanner([ALICE_ADDRESS]);

    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("renders nothing when the key is valid past the warning window", () => {
    mockAccounts([accountExpiringInDays(30)]);

    renderBanner([ALICE_ADDRESS]);

    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("renders nothing when the address has no participation key", () => {
    mockAccounts([{ round: CURRENT_ROUND }]);

    renderBanner([ALICE_ADDRESS]);

    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("falls back to a shortened address when there is no NFD", () => {
    mockAccounts([accountExpiringInDays(3)]);

    renderBanner([{ address: ACCOUNT_ADDRESS, nfd: null }]);

    expect(screen.getByText(/AAAAA\.\.\.AAAAA/)).toBeTruthy();
  });

  it("mentions the other addresses that need attention", () => {
    mockAccounts([accountExpiringInDays(2), accountExpiringInDays(6)]);

    renderBanner([
      ALICE_ADDRESS,
      { address: ACCOUNT_ADDRESS, nfd: "bob.algo" },
    ]);

    expect(
      screen.getByText(/1 other address also needs attention/),
    ).toBeTruthy();
  });

  it("links to the participation key management documentation", () => {
    mockAccounts([accountExpiringInDays(3)]);

    renderBanner([ALICE_ADDRESS]);

    const link = screen.getByRole("link", { name: /How to register/ });

    expect(link.getAttribute("href")).toBe(
      PARTICIPATION_KEY_MANAGEMENT_DOCS_URL,
    );
  });

  it("can be dismissed", () => {
    mockAccounts([accountExpiringInDays(3)]);

    renderBanner([ALICE_ADDRESS]);
    fireEvent.click(screen.getByLabelText("Dismiss notification"));

    expect(screen.queryByRole("alert")).toBeNull();
  });
});
