import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { NFDExpirationBanner } from "./nfd-expiration-banner";

const NOW = new Date("2026-01-01T12:00:00Z");
const WARNING_DAYS = 60;
const CRITICAL_DAYS = 15;

function renderBanner(props: {
  timeExpires: string | null;
  expired?: boolean;
}) {
  return render(
    <NFDExpirationBanner
      nfdName="alice.algo"
      timeExpires={props.timeExpires}
      expired={props.expired}
      warningDays={WARNING_DAYS}
      criticalDays={CRITICAL_DAYS}
    />,
  );
}

describe("NFDExpirationBanner", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it("renders nothing when the NFD is far from expiring", () => {
    renderBanner({ timeExpires: "2026-06-01T12:00:00Z" });

    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("renders nothing when no expiration date is known", () => {
    renderBanner({ timeExpires: null });

    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("warns when the NFD expires inside the warning window", () => {
    renderBanner({ timeExpires: "2026-01-31T12:00:00Z" });

    expect(screen.getByText(/expires in 30 days/)).toBeTruthy();
  });

  it("escalates when the NFD expires inside the critical window", () => {
    renderBanner({ timeExpires: "2026-01-06T12:00:00Z" });

    expect(screen.getByText(/expires in 5 days!/)).toBeTruthy();
  });

  it("says tomorrow when the NFD expires the next day", () => {
    renderBanner({ timeExpires: "2026-01-02T12:00:00Z" });

    expect(screen.getByText(/expires tomorrow/)).toBeTruthy();
  });

  it("reports an expired NFD from the expired flag", () => {
    renderBanner({ timeExpires: "2026-01-01T12:00:00Z", expired: true });

    expect(screen.getByText(/has expired/)).toBeTruthy();
  });

  it("links to the NFD renewal page", () => {
    renderBanner({ timeExpires: "2026-01-06T12:00:00Z" });

    const link = screen.getByRole("link", { name: /Renew NFD/ });

    expect(link.getAttribute("href")).toBe(
      "https://app.nf.domains/name/alice.algo",
    );
  });
});
