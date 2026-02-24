import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { NFDExpirationBanner } from "./nfd-expiration-banner";
import { SENSITIVE_MASK } from "@/constants";

afterEach(() => {
  cleanup();
});

describe("NFDExpirationBanner privacy masking", () => {
  it("shows the real NFD name by default", () => {
    render(
      <NFDExpirationBanner
        nfdName="noderewards"
        timeExpires={null}
        expired={true}
      />,
    );

    expect(
      screen.getByText((text) => text.includes(`"noderewards"`)),
    ).toBeTruthy();
  });

  it("masks the NFD name when hideSensitive is enabled", () => {
    render(
      <NFDExpirationBanner
        nfdName="noderewards"
        timeExpires={null}
        expired={true}
        hideSensitive={true}
      />,
    );

    expect(
      screen.getByText((text) => text.includes(`"${SENSITIVE_MASK}"`)),
    ).toBeTruthy();
    expect(screen.queryByText((text) => text.includes("noderewards"))).toBeNull();
    expect(screen.getByRole("link", { name: "Renew NFD" })).toBeTruthy();
  });
});
