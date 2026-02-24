import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import SearchBar from "./search-bar";
import { displayAlgoAddress } from "@/lib/utils";
import { SENSITIVE_MASK } from "@/constants";

const mockUseSearch = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  useSearch: () => mockUseSearch(),
}));

describe("Address SearchBar masking", () => {
  const address =
    "CEX4PWPMPIR32NUAJHRA6T2YSRW3JZYL23VL4UTEZMWUHHTBO22C3HC4SU";
  const nfd = "noderewards.algo";

  beforeEach(() => {
    mockUseSearch.mockReturnValue({ hideBalance: false });
  });

  it("shows masked chips when hideBalance is true", () => {
    mockUseSearch.mockReturnValue({ hideBalance: true });

    render(
      <SearchBar
        addresses={[address, nfd]}
        setAddresses={vi.fn()}
      />,
    );

    expect(screen.getAllByText(SENSITIVE_MASK)).toHaveLength(2);
    expect(screen.queryByText(displayAlgoAddress(address))).toBeNull();
    expect(screen.queryByText(nfd)).toBeNull();
  });

  it("keeps existing address display when hideBalance is false", () => {
    render(
      <SearchBar
        addresses={[address, nfd]}
        setAddresses={vi.fn()}
      />,
    );

    expect(screen.getByText(displayAlgoAddress(address))).toBeTruthy();
    expect(screen.getByText(nfd)).toBeTruthy();
  });
});
